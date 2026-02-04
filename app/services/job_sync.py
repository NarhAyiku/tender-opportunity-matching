"""
Job Sync Service - Coordinates fetching jobs from adapters and saving to database

This is the brain of the job ingestion system. It:
1. Fetches jobs from multiple sources in parallel
2. Deduplicates based on (source, external_id)
3. Inserts new jobs, updates existing ones
4. Marks jobs not seen in recent syncs as stale
"""
import asyncio
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
import logging

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.services.job_adapters import get_adapter, AVAILABLE_SOURCES
from app.schemas.opportunity import OpportunityCreate, SyncResponse
from app.models.opportunity import Opportunity


logger = logging.getLogger(__name__)


class JobSyncService:
    """
    Service for synchronizing jobs from external sources to the database.
    """
    
    def __init__(self, db: Session):
        self.db = db
    
    async def sync_jobs(
        self,
        keywords: str,
        location: Optional[str] = None,
        sources: Optional[List[str]] = None,
        limit_per_source: int = 50,
        mark_stale_after_hours: int = 72
    ) -> SyncResponse:
        """
        Sync jobs from specified sources.
        
        Args:
            keywords: Search keywords
            location: Location filter
            sources: List of sources to sync (defaults to all)
            limit_per_source: Max jobs per source
            mark_stale_after_hours: Mark jobs as stale if not refreshed within this time
            
        Returns:
            SyncResponse with counts of inserted, updated, and stale jobs
        """
        start_time = datetime.utcnow()
        sources = sources or AVAILABLE_SOURCES
        
        errors: List[str] = []
        all_jobs: List[OpportunityCreate] = []
        
        # Fetch from all sources in parallel
        fetch_tasks = []
        for source in sources:
            if source not in AVAILABLE_SOURCES:
                errors.append(f"Unknown source: {source}")
                continue
            
            fetch_tasks.append(
                self._fetch_from_source(source, keywords, location, limit_per_source)
            )
        
        # Wait for all fetches to complete
        results = await asyncio.gather(*fetch_tasks, return_exceptions=True)
        
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                source_name = sources[i] if i < len(sources) else "unknown"
                errors.append(f"Error fetching from {source_name}: {str(result)}")
                logger.error(f"Fetch error for {source_name}: {result}")
            elif isinstance(result, list):
                all_jobs.extend(result)
        
        # Save jobs to database
        inserted, updated = await self._save_jobs(all_jobs)
        
        # Mark old jobs as stale
        stale_marked = await self._mark_stale_jobs(
            sources, mark_stale_after_hours
        )
        
        duration = (datetime.utcnow() - start_time).total_seconds()
        
        return SyncResponse(
            status="success" if not errors else "partial",
            inserted=inserted,
            updated=updated,
            stale_marked=stale_marked,
            errors=errors,
            duration_seconds=round(duration, 2)
        )
    
    async def _fetch_from_source(
        self,
        source: str,
        keywords: str,
        location: Optional[str],
        limit: int
    ) -> List[OpportunityCreate]:
        """
        Fetch jobs from a single source.
        """
        try:
            adapter = get_adapter(source)
            jobs = await adapter.fetch_jobs(keywords, location, limit)
            logger.info(f"Fetched {len(jobs)} jobs from {source}")
            return jobs
        except Exception as e:
            logger.error(f"Error fetching from {source}: {e}")
            raise
    
    async def _save_jobs(
        self,
        jobs: List[OpportunityCreate]
    ) -> tuple[int, int]:
        """
        Save jobs to database, handling duplicates.
        
        Returns:
            Tuple of (inserted_count, updated_count)
        """
        inserted = 0
        updated = 0
        
        for job_data in jobs:
            try:
                # Check if job already exists (by source + external_id)
                existing = None
                if job_data.external_id:
                    existing = self.db.query(Opportunity).filter(
                        and_(
                            Opportunity.source == job_data.source,
                            Opportunity.external_id == job_data.external_id
                        )
                    ).first()
                
                if existing:
                    # Update existing job
                    existing.title = job_data.title
                    existing.company = job_data.company
                    existing.company_name = job_data.company
                    existing.location = job_data.location
                    existing.description = job_data.description
                    existing.salary_min = job_data.salary_min
                    existing.salary_max = job_data.salary_max
                    existing.job_type = job_data.job_type
                    existing.is_remote = job_data.remote
                    existing.url = job_data.url
                    existing.application_url = job_data.url
                    existing.mark_refreshed()
                    updated += 1
                else:
                    # Insert new job
                    new_job = Opportunity(
                        title=job_data.title,
                        company=job_data.company,
                        company_name=job_data.company,
                        location=job_data.location,
                        description=job_data.description,
                        salary_min=job_data.salary_min,
                        salary_max=job_data.salary_max,
                        salary_currency=job_data.salary_currency,
                        job_type=job_data.job_type,
                        is_remote=job_data.remote,
                        url=job_data.url,
                        application_url=job_data.url,
                        source=job_data.source,
                        external_id=job_data.external_id,
                        external_url=job_data.external_url,
                        refreshed_at=datetime.utcnow(),
                        is_stale=False
                    )
                    self.db.add(new_job)
                    inserted += 1
                    
            except Exception as e:
                logger.error(f"Error saving job '{job_data.title}': {e}")
                continue
        
        # Commit all changes
        try:
            self.db.commit()
        except Exception as e:
            logger.error(f"Error committing jobs: {e}")
            self.db.rollback()
            raise
        
        logger.info(f"Saved jobs: {inserted} inserted, {updated} updated")
        return inserted, updated
    
    async def _mark_stale_jobs(
        self,
        sources: List[str],
        hours: int
    ) -> int:
        """
        Mark jobs as stale if they haven't been refreshed recently.
        
        Returns:
            Count of jobs marked as stale
        """
        cutoff = datetime.utcnow() - timedelta(hours=hours)
        
        # Only mark jobs from the synced sources as stale
        stale_count = self.db.query(Opportunity).filter(
            and_(
                Opportunity.source.in_(sources),
                Opportunity.is_stale == False,
                or_(
                    Opportunity.refreshed_at == None,
                    Opportunity.refreshed_at < cutoff
                )
            )
        ).update(
            {"is_stale": True},
            synchronize_session=False
        )
        
        self.db.commit()
        
        if stale_count > 0:
            logger.info(f"Marked {stale_count} jobs as stale")
        
        return stale_count
    
    def get_sync_status(self) -> Dict[str, Any]:
        """
        Get current sync status and job counts.
        """
        total = self.db.query(Opportunity).count()
        active = self.db.query(Opportunity).filter(
            Opportunity.is_stale == False
        ).count()
        stale = total - active
        
        # Get counts by source
        from sqlalchemy import func
        by_source = dict(
            self.db.query(
                Opportunity.source,
                func.count(Opportunity.id)
            ).group_by(Opportunity.source).all()
        )
        
        # Get last refresh time
        last_refresh = self.db.query(
            func.max(Opportunity.refreshed_at)
        ).scalar()
        
        return {
            "last_sync": last_refresh,
            "total_jobs": total,
            "active_jobs": active,
            "stale_jobs": stale,
            "by_source": by_source
        }
