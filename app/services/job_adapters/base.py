"""
Base Job Adapter - Abstract interface for all job source adapters
"""
from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
import logging

from app.schemas.opportunity import OpportunityCreate


logger = logging.getLogger(__name__)


class BaseJobAdapter(ABC):
    """
    Abstract base class for job source adapters.
    
    All adapters (Jooble, Adzuna, etc.) must inherit from this class
    and implement the required methods.
    """
    
    # Subclasses must define these
    source_name: str = "unknown"
    base_url: str = ""
    
    def __init__(self):
        self.logger = logging.getLogger(f"{__name__}.{self.source_name}")
    
    @abstractmethod
    async def fetch_jobs(
        self,
        keywords: str,
        location: Optional[str] = None,
        limit: int = 50
    ) -> List[OpportunityCreate]:
        """
        Fetch jobs from the source API.
        
        Args:
            keywords: Search terms (e.g., "software engineer")
            location: Location filter (e.g., "New York" or "remote")
            limit: Maximum number of jobs to fetch
            
        Returns:
            List of OpportunityCreate objects ready for database insertion
        """
        pass
    
    @abstractmethod
    def normalize(self, raw_job: Dict[str, Any]) -> Optional[OpportunityCreate]:
        """
        Convert a raw job from the source API into our standard format.
        
        Args:
            raw_job: Raw job data from the source API
            
        Returns:
            OpportunityCreate object, or None if normalization fails
        """
        pass
    
    def _safe_get(self, data: Dict, *keys, default=None):
        """
        Safely get nested dictionary values.
        
        Usage:
            self._safe_get(job, "company", "display_name", default="Unknown")
        """
        for key in keys:
            if isinstance(data, dict):
                data = data.get(key, default)
            else:
                return default
        return data if data is not None else default
    
    def _parse_salary(self, salary_str: str) -> tuple[Optional[int], Optional[int]]:
        """
        Attempt to parse salary from a string.
        
        Args:
            salary_str: Salary string like "$50,000 - $70,000" or "50000"
            
        Returns:
            Tuple of (min_salary, max_salary), either can be None
        """
        if not salary_str:
            return None, None
        
        import re
        
        # Remove currency symbols and commas
        cleaned = re.sub(r'[£$€,]', '', str(salary_str))
        
        # Try to find numbers
        numbers = re.findall(r'\d+', cleaned)
        
        if len(numbers) >= 2:
            return int(numbers[0]), int(numbers[1])
        elif len(numbers) == 1:
            return int(numbers[0]), None
        
        return None, None
    
    def _normalize_job_type(self, job_type: str) -> Optional[str]:
        """
        Normalize job type strings to our standard values.
        """
        if not job_type:
            return None
        
        job_type_lower = job_type.lower()
        
        mapping = {
            "full-time": "fulltime",
            "full time": "fulltime",
            "fulltime": "fulltime",
            "permanent": "fulltime",
            "part-time": "parttime",
            "part time": "parttime",
            "parttime": "parttime",
            "intern": "internship",
            "internship": "internship",
            "contract": "contract",
            "contractor": "contract",
            "temporary": "temporary",
            "temp": "temporary",
            "freelance": "contract",
        }
        
        for key, value in mapping.items():
            if key in job_type_lower:
                return value
        
        return None
    
    def _is_remote(self, job_data: Dict[str, Any]) -> bool:
        """
        Determine if a job is remote based on various fields.
        """
        # Check location field
        location = str(self._safe_get(job_data, "location", default="")).lower()
        if "remote" in location:
            return True
        
        # Check title
        title = str(self._safe_get(job_data, "title", default="")).lower()
        if "remote" in title:
            return True
        
        # Check description snippet
        description = str(self._safe_get(job_data, "description", default="")).lower()
        if "remote" in description[:500]:  # Check first 500 chars
            return True
        
        return False
