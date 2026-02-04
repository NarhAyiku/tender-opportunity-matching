"""
Tests for Job Adapters

Run with: pytest tests/test_adapters.py -v
"""
import pytest
from unittest.mock import AsyncMock, patch, MagicMock

from app.services.job_adapters import get_adapter, AVAILABLE_SOURCES
from app.services.job_adapters.jooble import JoobleAdapter
from app.services.job_adapters.adzuna import AdzunaAdapter
from app.schemas.opportunity import OpportunityCreate


class TestAdapterRegistry:
    """Tests for the adapter registry."""
    
    def test_available_sources_not_empty(self):
        """Should have at least jooble and adzuna."""
        assert len(AVAILABLE_SOURCES) >= 2
        assert "jooble" in AVAILABLE_SOURCES
        assert "adzuna" in AVAILABLE_SOURCES
    
    def test_get_adapter_jooble(self):
        """Should return JoobleAdapter for 'jooble' source."""
        with patch.dict('os.environ', {'JOOBLE_API_KEY': 'test-key'}):
            adapter = get_adapter("jooble")
            assert isinstance(adapter, JoobleAdapter)
            assert adapter.source_name == "jooble"
    
    def test_get_adapter_adzuna(self):
        """Should return AdzunaAdapter for 'adzuna' source."""
        with patch.dict('os.environ', {
            'ADZUNA_APP_ID': 'test-id',
            'ADZUNA_APP_KEY': 'test-key'
        }):
            adapter = get_adapter("adzuna")
            assert isinstance(adapter, AdzunaAdapter)
            assert adapter.source_name == "adzuna"
    
    def test_get_adapter_unknown_source_raises(self):
        """Should raise ValueError for unknown source."""
        with pytest.raises(ValueError) as exc_info:
            get_adapter("unknown_source")
        
        assert "Unknown source" in str(exc_info.value)
        assert "unknown_source" in str(exc_info.value)


class TestJoobleAdapter:
    """Tests for JoobleAdapter."""
    
    @pytest.fixture
    def adapter(self):
        """Create adapter with test API key."""
        return JoobleAdapter(api_key="test-api-key")
    
    def test_init_without_api_key_raises(self):
        """Should raise if no API key provided."""
        with patch.dict('os.environ', {}, clear=True):
            with pytest.raises(ValueError) as exc_info:
                JoobleAdapter()
            assert "API key" in str(exc_info.value)
    
    def test_normalize_valid_job(self, adapter):
        """Should correctly normalize a valid Jooble job."""
        raw_job = {
            "title": "Software Engineer",
            "company": "Tech Corp",
            "location": "New York, NY",
            "snippet": "We are looking for a skilled engineer...",
            "salary": "100,000 - 150,000 USD",
            "type": "Full-time",
            "link": "https://example.com/job/123",
            "id": 123456789,
            "updated": "2026-01-19T12:00:00"
        }
        
        result = adapter.normalize(raw_job)
        
        assert result is not None
        assert isinstance(result, OpportunityCreate)
        assert result.title == "Software Engineer"
        assert result.company == "Tech Corp"
        assert result.location == "New York, NY"
        assert result.source == "jooble"
        assert result.external_id == "123456789"
        assert result.job_type == "fulltime"
        assert result.salary_min == 100000
        assert result.salary_max == 150000
    
    def test_normalize_missing_title_returns_none(self, adapter):
        """Should return None if title is missing."""
        raw_job = {
            "company": "Tech Corp",
            "link": "https://example.com/job/123"
        }
        
        result = adapter.normalize(raw_job)
        assert result is None
    
    def test_normalize_missing_link_returns_none(self, adapter):
        """Should return None if link is missing."""
        raw_job = {
            "title": "Software Engineer",
            "company": "Tech Corp"
        }
        
        result = adapter.normalize(raw_job)
        assert result is None
    
    def test_normalize_detects_remote(self, adapter):
        """Should detect remote jobs from location or title."""
        raw_job = {
            "title": "Remote Software Engineer",
            "company": "Tech Corp",
            "location": "Remote",
            "link": "https://example.com/job/123",
            "id": 123
        }
        
        result = adapter.normalize(raw_job)
        assert result.remote is True
    
    def test_normalize_handles_missing_optional_fields(self, adapter):
        """Should handle missing optional fields gracefully."""
        raw_job = {
            "title": "Software Engineer",
            "link": "https://example.com/job/123",
            "id": 123
        }
        
        result = adapter.normalize(raw_job)
        
        assert result is not None
        assert result.company is None
        assert result.location is None
        assert result.salary_min is None
        assert result.salary_max is None
    
    @pytest.mark.asyncio
    async def test_fetch_jobs_makes_api_call(self, adapter):
        """Should make POST request to Jooble API."""
        mock_response = {
            "totalCount": 1,
            "jobs": [{
                "title": "Test Job",
                "link": "https://example.com",
                "id": 1
            }]
        }
        
        with patch('httpx.AsyncClient') as mock_client:
            mock_instance = AsyncMock()
            mock_client.return_value.__aenter__.return_value = mock_instance
            mock_instance.post.return_value.status_code = 200
            mock_instance.post.return_value.json.return_value = mock_response
            
            jobs = await adapter.fetch_jobs("python developer", "remote", 10)
            
            assert len(jobs) == 1
            assert jobs[0].title == "Test Job"


class TestAdzunaAdapter:
    """Tests for AdzunaAdapter."""
    
    @pytest.fixture
    def adapter(self):
        """Create adapter with test credentials."""
        return AdzunaAdapter(app_id="test-id", app_key="test-key", country="us")
    
    def test_init_without_credentials_raises(self):
        """Should raise if credentials not provided."""
        with patch.dict('os.environ', {}, clear=True):
            with pytest.raises(ValueError) as exc_info:
                AdzunaAdapter()
            assert "credentials" in str(exc_info.value).lower()
    
    def test_normalize_valid_job(self, adapter):
        """Should correctly normalize a valid Adzuna job."""
        raw_job = {
            "id": "987654321",
            "title": "Data Scientist",
            "description": "Join our data team...",
            "redirect_url": "https://example.com/apply",
            "company": {"display_name": "Data Corp"},
            "location": {"display_name": "San Francisco, CA"},
            "salary_min": 120000,
            "salary_max": 180000,
            "contract_type": "permanent",
            "created": "2026-01-19T10:00:00Z"
        }
        
        result = adapter.normalize(raw_job)
        
        assert result is not None
        assert isinstance(result, OpportunityCreate)
        assert result.title == "Data Scientist"
        assert result.company == "Data Corp"
        assert result.location == "San Francisco, CA"
        assert result.source == "adzuna"
        assert result.external_id == "987654321"
        assert result.salary_min == 120000
        assert result.salary_max == 180000
        assert result.job_type == "fulltime"  # permanent -> fulltime
    
    def test_normalize_handles_nested_company(self, adapter):
        """Should extract company name from nested structure."""
        raw_job = {
            "id": "123",
            "title": "Engineer",
            "redirect_url": "https://example.com",
            "company": {"display_name": "Nested Corp"}
        }
        
        result = adapter.normalize(raw_job)
        assert result.company == "Nested Corp"
    
    def test_normalize_handles_missing_company(self, adapter):
        """Should handle missing company gracefully."""
        raw_job = {
            "id": "123",
            "title": "Engineer",
            "redirect_url": "https://example.com"
        }
        
        result = adapter.normalize(raw_job)
        assert result.company is None
    
    def test_normalize_currency_by_country(self):
        """Should set correct currency based on country."""
        uk_adapter = AdzunaAdapter(app_id="id", app_key="key", country="gb")
        
        raw_job = {
            "id": "123",
            "title": "Engineer",
            "redirect_url": "https://example.com",
            "salary_min": 50000
        }
        
        result = uk_adapter.normalize(raw_job)
        assert result.salary_currency == "GBP"


class TestBaseAdapterHelpers:
    """Tests for BaseJobAdapter helper methods."""
    
    @pytest.fixture
    def adapter(self):
        return JoobleAdapter(api_key="test")
    
    def test_parse_salary_range(self, adapter):
        """Should parse salary range strings."""
        min_sal, max_sal = adapter._parse_salary("$50,000 - $70,000")
        assert min_sal == 50000
        assert max_sal == 70000
    
    def test_parse_salary_single_value(self, adapter):
        """Should handle single salary value."""
        min_sal, max_sal = adapter._parse_salary("60000")
        assert min_sal == 60000
        assert max_sal is None
    
    def test_parse_salary_empty_string(self, adapter):
        """Should handle empty string."""
        min_sal, max_sal = adapter._parse_salary("")
        assert min_sal is None
        assert max_sal is None
    
    def test_normalize_job_type_variations(self, adapter):
        """Should normalize various job type strings."""
        assert adapter._normalize_job_type("Full-time") == "fulltime"
        assert adapter._normalize_job_type("PART TIME") == "parttime"
        assert adapter._normalize_job_type("Internship") == "internship"
        assert adapter._normalize_job_type("Contract") == "contract"
        assert adapter._normalize_job_type("permanent") == "fulltime"
        assert adapter._normalize_job_type("unknown") is None
    
    def test_safe_get_nested(self, adapter):
        """Should safely get nested dict values."""
        data = {"company": {"info": {"name": "Test Corp"}}}
        
        result = adapter._safe_get(data, "company", "info", "name")
        assert result == "Test Corp"
        
        result = adapter._safe_get(data, "company", "missing", "field", default="N/A")
        assert result == "N/A"
