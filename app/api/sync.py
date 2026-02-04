"""
Sync API Router - Endpoints for job synchronization

Endpoints:
    POST /api/sync/jobs - Trigger a job sync
    GET  /api/sync/status - Get sync status and job counts
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.schemas.opportunity import SyncRequest, SyncResponse, SyncStatusResponse
from app.services.job_sync import JobSyncService
from app.services.job_adapters import AVAILABLE_SOURCES


router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/jobs", response_model=SyncResponse)
async def sync_jobs(
    request: SyncRequest,
    db: Session = Depends(get_db)
):
    """
    Trigger a job sync from external sources.
    
    This endpoint fetches jobs from Jooble, Adzuna, or other configured sources
    and saves them to the database.
    
    **Request Body:**
    - `keywords`: Search terms (required)
    - `location`: Location filter (optional)
    - `sources`: List of sources to sync, defaults to all (optional)
    - `limit_per_source`: Max jobs per source, default 50 (optional)
    
    **Returns:**
    - Count of inserted, updated, and stale jobs
    - List of any errors encountered
    """
    # Validate sources
    invalid_sources = [s for s in request.sources if s not in AVAILABLE_SOURCES]
    if invalid_sources:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid sources: {invalid_sources}. Available: {AVAILABLE_SOURCES}"
        )
    
    sync_service = JobSyncService(db)
    
    try:
        result = await sync_service.sync_jobs(
            keywords=request.keywords,
            location=request.location,
            sources=request.sources,
            limit_per_source=request.limit_per_source
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Sync failed: {str(e)}"
        )


@router.post("/jobs/background", response_model=dict)
async def sync_jobs_background(
    request: SyncRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Trigger a job sync in the background.
    
    Returns immediately while sync runs asynchronously.
    Use GET /status to check progress.
    """
    # Validate sources
    invalid_sources = [s for s in request.sources if s not in AVAILABLE_SOURCES]
    if invalid_sources:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid sources: {invalid_sources}. Available: {AVAILABLE_SOURCES}"
        )
    
    # Note: For production, you'd want to use a proper task queue (Celery, etc.)
    # This is a simple background task for MVP
    async def run_sync():
        sync_service = JobSyncService(db)
        await sync_service.sync_jobs(
            keywords=request.keywords,
            location=request.location,
            sources=request.sources,
            limit_per_source=request.limit_per_source
        )
    
    background_tasks.add_task(run_sync)
    
    return {
        "status": "started",
        "message": "Sync started in background. Check /status for progress."
    }


@router.get("/status", response_model=SyncStatusResponse)
def get_sync_status(db: Session = Depends(get_db)):
    """
    Get current sync status and job counts.
    
    **Returns:**
    - `last_sync`: Timestamp of last successful sync
    - `total_jobs`: Total jobs in database
    - `active_jobs`: Jobs not marked as stale
    - `stale_jobs`: Jobs marked as potentially outdated
    - `by_source`: Job counts grouped by source
    """
    sync_service = JobSyncService(db)
    status = sync_service.get_sync_status()
    
    return SyncStatusResponse(
        last_sync=status["last_sync"],
        total_jobs=status["total_jobs"],
        active_jobs=status["active_jobs"],
        stale_jobs=status["stale_jobs"],
        by_source=status["by_source"]
    )


@router.get("/sources", response_model=List[str])
def get_available_sources():
    """
    Get list of available job sources.
    
    Returns the names of all configured job adapters.
    """
    return AVAILABLE_SOURCES


@router.delete("/stale", response_model=dict)
def delete_stale_jobs(
    older_than_days: int = 7,
    db: Session = Depends(get_db)
):
    """
    Delete stale jobs older than specified days.
    
    Use with caution - this permanently removes jobs from the database.
    
    **Query Parameters:**
    - `older_than_days`: Delete stale jobs older than this many days (default: 7)
    """
    from datetime import datetime, timedelta
    from app.models.opportunity import Opportunity
    
    cutoff = datetime.utcnow() - timedelta(days=older_than_days)
    
    deleted_count = db.query(Opportunity).filter(
        Opportunity.is_stale == True,
        Opportunity.refreshed_at < cutoff
    ).delete(synchronize_session=False)
    
    db.commit()
    
    return {
        "status": "success",
        "deleted": deleted_count,
        "message": f"Deleted {deleted_count} stale jobs older than {older_than_days} days"
    }
