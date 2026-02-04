"""
Adzuna Job Adapter - Fetches and normalizes jobs from Adzuna API
API Docs: https://developer.adzuna.com/
"""
import os
import httpx
from typing import List, Optional, Dict, Any
import logging

from app.services.job_adapters.base import BaseJobAdapter
from app.schemas.opportunity import OpportunityCreate


logger = logging.getLogger(__name__)


class AdzunaAdapter(BaseJobAdapter):
    """
    Adapter for Adzuna job search API.
    
    Adzuna covers 16+ countries with good salary data.
    Free tier available, partnership option for revenue sharing.
    """
    
    source_name = "adzuna"
    base_url = "https://api.adzuna.com/v1/api/jobs"
    
    # Supported countries (use 2-letter codes)
    SUPPORTED_COUNTRIES = [
        "us", "gb", "au", "at", "be", "br", "ca", "de", "es", "fr",
        "in", "it", "mx", "nl", "nz", "pl", "ru", "sg", "za"
    ]
    
    def __init__(
        self,
        app_id: Optional[str] = None,
        app_key: Optional[str] = None,
        country: str = "us"
    ):
        super().__init__()
        self.app_id = app_id or os.getenv("ADZUNA_APP_ID")
        self.app_key = app_key or os.getenv("ADZUNA_APP_KEY")
        self.country = country or os.getenv("ADZUNA_COUNTRY", "us")
        
        if not self.app_id or not self.app_key:
            raise ValueError(
                "Adzuna credentials not provided. "
                "Set ADZUNA_APP_ID and ADZUNA_APP_KEY environment variables."
            )
        
        if self.country not in self.SUPPORTED_COUNTRIES:
            self.logger.warning(
                f"Country '{self.country}' may not be supported. "
                f"Supported: {self.SUPPORTED_COUNTRIES}"
            )
    
    async def fetch_jobs(
        self,
        keywords: str,
        location: Optional[str] = None,
        limit: int = 50
    ) -> List[OpportunityCreate]:
        """
        Fetch jobs from Adzuna API.
        
        Args:
            keywords: Search terms
            location: Location filter
            limit: Max jobs to return (max 50 per page)
            
        Returns:
            List of normalized OpportunityCreate objects
        """
        jobs = []
        page = 1
        per_page = min(limit, 50)  # Adzuna max is 50 per page
        
        max_pages = (limit // per_page) + 1
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            while len(jobs) < limit and page <= max_pages:
                try:
                    response = await self._make_request(
                        client, keywords, location, page, per_page
                    )
                    
                    if not response:
                        break
                    
                    raw_jobs = response.get("results", [])
                    
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
        
        self.logger.info(f"Fetched {len(jobs)} jobs from Adzuna for '{keywords}'")
        return jobs
    
    async def _make_request(
        self,
        client: httpx.AsyncClient,
        keywords: str,
        location: Optional[str],
        page: int,
        per_page: int
    ) -> Optional[Dict[str, Any]]:
        """
        Make a single request to Adzuna API.
        """
        url = f"{self.base_url}/{self.country}/search/{page}"
        
        params = {
            "app_id": self.app_id,
            "app_key": self.app_key,
            "what": keywords,
            "results_per_page": per_page,
            "content-type": "application/json"
        }
        
        if location:
            params["where"] = location
        
        try:
            response = await client.get(url, params=params)
            
            if response.status_code == 200:
                return response.json()
            
            self.logger.warning(
                f"Adzuna API returned {response.status_code}: {response.text}"
            )
            return None
            
        except httpx.RequestError as e:
            self.logger.error(f"Request error: {e}")
            return None
    
    def normalize(self, raw_job: Dict[str, Any]) -> Optional[OpportunityCreate]:
        """
        Convert Adzuna job format to our standard OpportunityCreate.
        
        Adzuna job structure:
        {
            "id": "123456789",
            "title": "Job Title",
            "description": "Full job description...",
            "redirect_url": "https://...",
            "created": "2026-01-19T12:00:00Z",
            "company": {
                "display_name": "Company Name"
            },
            "location": {
                "display_name": "City, State",
                "area": ["State", "City"]
            },
            "salary_min": 50000,
            "salary_max": 70000,
            "contract_type": "permanent",
            "category": {
                "label": "IT Jobs",
                "tag": "it-jobs"
            }
        }
        """
        try:
            # Required fields
            title = self._safe_get(raw_job, "title")
            redirect_url = self._safe_get(raw_job, "redirect_url")
            
            if not title or not redirect_url:
                self.logger.debug(f"Skipping job with missing title or URL: {raw_job}")
                return None
            
            # Get company name from nested structure
            company = self._safe_get(raw_job, "company", "display_name")
            
            # Get location from nested structure
            location = self._safe_get(raw_job, "location", "display_name")
            
            # Salary (Adzuna provides these directly as numbers!)
            salary_min = self._safe_get(raw_job, "salary_min")
            salary_max = self._safe_get(raw_job, "salary_max")
            
            # Convert to int if present
            if salary_min:
                salary_min = int(salary_min)
            if salary_max:
                salary_max = int(salary_max)
            
            # Normalize contract type
            contract_type = self._safe_get(raw_job, "contract_type", default="")
            job_type = self._normalize_job_type(contract_type)
            
            # Check if remote
            remote = self._is_remote({
                "title": title,
                "location": location or "",
                "description": self._safe_get(raw_job, "description", default="")
            })
            
            # Determine currency based on country
            currency_map = {
                "us": "USD", "gb": "GBP", "au": "AUD", "ca": "CAD",
                "de": "EUR", "fr": "EUR", "es": "EUR", "it": "EUR",
                "nl": "EUR", "at": "EUR", "be": "EUR", "in": "INR",
                "br": "BRL", "mx": "MXN", "pl": "PLN", "ru": "RUB",
                "sg": "SGD", "za": "ZAR", "nz": "NZD"
            }
            currency = currency_map.get(self.country, "USD")
            
            return OpportunityCreate(
                title=title,
                company=company,
                location=location,
                description=self._safe_get(raw_job, "description"),
                salary_min=salary_min,
                salary_max=salary_max,
                salary_currency=currency,
                job_type=job_type,
                remote=remote,
                url=redirect_url,
                source=self.source_name,
                external_id=str(self._safe_get(raw_job, "id", default="")),
                external_url=redirect_url
            )
            
        except Exception as e:
            self.logger.error(f"Error normalizing job: {e}, raw: {raw_job}")
            return None
