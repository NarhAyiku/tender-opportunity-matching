"""
Tests for Job Sync Service

Run with: pytest tests/test_sync.py -v
"""
import pytest
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, patch, MagicMock

from app.services.job_sync import JobSyncService
from app.schemas.opportunity import OpportunityCreate


class TestJobSyncService:
    """Tests for JobSyncService."""
    
    @pytest.fixture
    def mock_db(self):
        """Create a mock database session."""
        db = MagicMock()
        db.query.return_value.filter.return_value.first.return_value = None
        db.query.return_value.count.return_value = 0
        return db
    
    @pytest.fixture
    def sync_service(self, mock_db):
        """Create sync service with mock db."""
        return JobSyncService(mock_db)
    
    @pytest.fixture
    def sample_jobs(self):
        """Sample jobs for testing."""
        return [
            OpportunityCreate(
                title="Software Engineer",
                company="Tech Corp",
                location="Remote",
                description="Build cool stuff",
                url="https://example.com/job1",
                source="jooble",
                external_id="job-001"
            ),
            OpportunityCreate(
                title="Data Scientist",
                company="Data Inc",
                location="New York",
                description="Analyze data",
                url="https://example.com/job2",
                source="adzuna",
                external_id="job-002"
            )
        ]
    
    @pytest.mark.asyncio
    async def test_sync_jobs_returns_response(self, sync_service, sample_jobs):
        """Should return SyncResponse with counts."""
        with patch.object(sync_service, '_fetch_from_source', new_callable=AsyncMock) as mock_fetch:
            with patch.object(sync_service, '_save_jobs', new_callable=AsyncMock) as mock_save:
                with patch.object(sync_service, '_mark_stale_jobs', new_callable=AsyncMock) as mock_stale:
                    mock_fetch.return_value = sample_jobs
                    mock_save.return_value = (2, 0)  # 2 inserted, 0 updated
                    mock_stale.return_value = 0
                    
                    result = await sync_service.sync_jobs(
                        keywords="python developer",
                        sources=["jooble"]
                    )
                    
                    assert result.status == "success"
                    assert result.inserted == 2
                    assert result.updated == 0
                    assert result.stale_marked == 0
                    assert len(result.errors) == 0
    
    @pytest.mark.asyncio
    async def test_sync_jobs_handles_errors(self, sync_service):
        """Should handle adapter errors gracefully."""
        with patch.object(sync_service, '_fetch_from_source', new_callable=AsyncMock) as mock_fetch:
            with patch.object(sync_service, '_save_jobs', new_callable=AsyncMock) as mock_save:
                with patch.object(sync_service, '_mark_stale_jobs', new_callable=AsyncMock) as mock_stale:
                    mock_fetch.side_effect = Exception("API error")
                    mock_save.return_value = (0, 0)
                    mock_stale.return_value = 0
                    
                    result = await sync_service.sync_jobs(
                        keywords="test",
                        sources=["jooble"]
                    )
                    
                    assert result.status == "partial"
                    assert len(result.errors) > 0
                    assert "API error" in result.errors[0]
    
    @pytest.mark.asyncio
    async def test_sync_jobs_invalid_source(self, sync_service):
        """Should report error for invalid source."""
        with patch.object(sync_service, '_save_jobs', new_callable=AsyncMock) as mock_save:
            with patch.object(sync_service, '_mark_stale_jobs', new_callable=AsyncMock) as mock_stale:
                mock_save.return_value = (0, 0)
                mock_stale.return_value = 0
                
                result = await sync_service.sync_jobs(
                    keywords="test",
                    sources=["invalid_source"]
                )
                
                assert len(result.errors) > 0
                assert "Unknown source" in result.errors[0]
    
    @pytest.mark.asyncio
    async def test_fetch_from_source_calls_adapter(self, sync_service):
        """Should call the correct adapter."""
        with patch('app.services.job_sync.get_adapter') as mock_get_adapter:
            mock_adapter = MagicMock()
            mock_adapter.fetch_jobs = AsyncMock(return_value=[])
            mock_get_adapter.return_value = mock_adapter
            
            await sync_service._fetch_from_source("jooble", "test", None, 50)
            
            mock_get_adapter.assert_called_once_with("jooble")
            mock_adapter.fetch_jobs.assert_called_once_with("test", None, 50)
    
    @pytest.mark.asyncio
    async def test_save_jobs_inserts_new(self, mock_db, sample_jobs):
        """Should insert new jobs."""
        sync_service = JobSyncService(mock_db)
        
        # Simulate no existing jobs
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        inserted, updated = await sync_service._save_jobs(sample_jobs)
        
        # Should have called db.add() for each job
        assert mock_db.add.call_count == 2
        assert mock_db.commit.called
    
    @pytest.mark.asyncio
    async def test_save_jobs_updates_existing(self, mock_db, sample_jobs):
        """Should update existing jobs instead of inserting."""
        sync_service = JobSyncService(mock_db)
        
        # Simulate existing job
        existing_job = MagicMock()
        mock_db.query.return_value.filter.return_value.first.return_value = existing_job
        
        inserted, updated = await sync_service._save_jobs(sample_jobs)
        
        # Should have updated existing job, not added new
        assert existing_job.mark_refreshed.called
    
    def test_get_sync_status(self, mock_db):
        """Should return sync status."""
        sync_service = JobSyncService(mock_db)
        
        mock_db.query.return_value.count.return_value = 100
        mock_db.query.return_value.filter.return_value.count.return_value = 90
        mock_db.query.return_value.group_by.return_value.all.return_value = [
            ("jooble", 60),
            ("adzuna", 40)
        ]
        
        status = sync_service.get_sync_status()
        
        assert status["total_jobs"] == 100
        assert "by_source" in status


class TestSyncServiceIntegration:
    """Integration tests (require actual adapters but mock HTTP)."""
    
    @pytest.mark.asyncio
    async def test_full_sync_flow(self):
        """Test complete sync flow with mocked HTTP."""
        # This would be an integration test with a test database
        # For MVP, we'll skip this and test manually
        pass
