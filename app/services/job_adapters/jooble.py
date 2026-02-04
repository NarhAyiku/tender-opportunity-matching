"""
Jooble Job Adapter - Fetches and normalizes jobs from Jooble API
API Docs: https://jooble.org/api/about
"""
import os
import httpx
from typing import List, Optional, Dict, Any
import logging

from app.services.job_adapters.base import BaseJobAdapter
from app.schemas.opportunity import OpportunityCreate


logger = logging.getLogger(__name__)


class JoobleAdapter(BaseJobAdapter):
    """
    Adapter for Jooble job search API.
    
    Jooble is a job aggregator available in 69+ countries.
    Free API with generous rate limits.
    """
    
    source_name = "jooble"
    base_url = "https://jooble.org/api"
    
    def __init__(self, api_key: Optional[str] = None):
        super().__init__()
        self.api_key = api_key or os.getenv("JOOBLE_API_KEY")
        
        if not self.api_key:
            raise ValueError(
                "Jooble API key not provided. "
                "Set JOOBLE_API_KEY environment variable or pass api_key parameter."
            )
    
    async def fetch_jobs(
        self,
        keywords: str,
        location: Optional[str] = None,
        limit: int = 50
    ) -> List[OpportunityCreate]:
        """
        Fetch jobs from Jooble API.
        
        Args:
            keywords: Search terms
            location: Location filter
            limit: Max jobs to return (fetches in pages of ~20)
            
        Returns:
            List of normalized OpportunityCreate objects
        """
        jobs = []
        page = 1
        
        # Jooble returns ~20 jobs per page
        max_pages = (limit // 20) + 1
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            while len(jobs) < limit and page <= max_pages:
                try:
                    response = await self._make_request(
                        client, keywords, location, page
                    )
                    
                    if not response:
                        break
                    
                    raw_jobs = response.get("jobs", [])
                    
                    if not raw_jobs:
                        break
                    
                    for raw_job in raw_jobs:
                        normalized = self.normalize(raw_job)
                        if normalized:
                            jobs.append(normalized)
                            
                            if len(jobs) >= limit:
                                break
                    
                    page += 1
                    
                except Exception as e:
                    self.logger.error(f"Error fetching page {page}: {e}")
                    break
        
        self.logger.info(f"Fetched {len(jobs)} jobs from Jooble for '{keywords}'")
        return jobs
    
    async def _make_request(
        self,
        client: httpx.AsyncClient,
        keywords: str,
        location: Optional[str],
        page: int
    ) -> Optional[Dict[str, Any]]:
        """
        Make a single request to Jooble API.
        """
        url = f"{self.base_url}/{self.api_key}"
        
        payload = {
            "keywords": keywords,
            "page": page
        }
        
        if location:
            payload["location"] = location
        
        try:
            response = await client.post(
                url,
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                # If mocked response.json is coroutine, await it
                if hasattr(data, "__await__"):
                    data = await data
                return data
            
            self.logger.warning(
                f"Jooble API returned {response.status_code}: {response.text}"
            )
            return None
            
        except httpx.RequestError as e:
            self.logger.error(f"Request error: {e}")
            return None
    
    def normalize(self, raw_job: Dict[str, Any]) -> Optional[OpportunityCreate]:
        """
        Convert Jooble job format to our standard OpportunityCreate.
        
        Jooble job structure:
        {
            "title": "Job Title",
            "location": "City, Country",
            "snippet": "Job description snippet...",
            "salary": "50,000 - 70,000 USD",
            "source": "company website",
            "type": "Full-time",
            "link": "https://...",
            "company": "Company Name",
            "updated": "2026-01-19T12:00:00",
            "id": 123456789
        }
        """
        try:
            # Required fields
            title = self._safe_get(raw_job, "title")
            link = self._safe_get(raw_job, "link")
            
            if not title or not link:
                self.logger.debug(f"Skipping job with missing title or link: {raw_job}")
                return None
            
            # Parse salary if available
            salary_str = self._safe_get(raw_job, "salary", default="")
            salary_min, salary_max = self._parse_salary(salary_str)
            
            # Normalize job type
            job_type = self._normalize_job_type(
                self._safe_get(raw_job, "type", default="")
            )
            
            # Check if remote
            remote = self._is_remote(raw_job)
            
            return OpportunityCreate(
                title=title,
                company=self._safe_get(raw_job, "company"),
                location=self._safe_get(raw_job, "location"),
                description=self._safe_get(raw_job, "snippet"),
                salary_min=salary_min,
                salary_max=salary_max,
                salary_currency="USD",  # Jooble doesn't always specify
                job_type=job_type,
                remote=remote,
                url=link,
                source=self.source_name,
                external_id=str(self._safe_get(raw_job, "id", default="")),
                external_url=link
            )
            
        except Exception as e:
            self.logger.error(f"Error normalizing job: {e}, raw: {raw_job}")
            return None
