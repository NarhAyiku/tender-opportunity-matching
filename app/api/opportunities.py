"""
Opportunities API Router - Endpoints for browsing and managing job opportunities

These are the endpoints your mobile app's swipe interface will use.
"""
import csv
import io
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc

from app.database import SessionLocal
from app.models.opportunity import Opportunity
from app.schemas.opportunity import (
    OpportunityResponse,
    OpportunityListResponse,
    OpportunityCreate,
    OpportunityUpdate,
    BulkImportRequest,
    BulkImportResponse,
    BulkImportItem,
)


logger = logging.getLogger(__name__)


router = APIRouter(prefix="/opportunities", tags=["opportunities"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("", response_model=OpportunityListResponse)
def list_opportunities(
    # Pagination
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    
    # Filters
    search: Optional[str] = Query(None, description="Search in title and description"),
    source: Optional[str] = Query(None, description="Filter by source (jooble, adzuna, etc)"),
    location: Optional[str] = Query(None, description="Filter by location"),
    job_type: Optional[str] = Query(None, description="Filter by job type"),
    remote: Optional[bool] = Query(None, description="Filter remote jobs only"),
    include_stale: bool = Query(False, description="Include stale/outdated jobs"),
    
    # Salary filters
    min_salary: Optional[int] = Query(None, ge=0, description="Minimum salary"),
    max_salary: Optional[int] = Query(None, ge=0, description="Maximum salary"),
    
    db: Session = Depends(get_db)
):
    """
    List job opportunities with filtering and pagination.
    
    This is the main endpoint for your swipe feed.
    
    **Filters:**
    - `search`: Search in job title and description
    - `source`: Filter by source (jooble, adzuna, recruiter)
    - `location`: Filter by location (partial match)
    - `job_type`: fulltime, parttime, internship, contract
    - `remote`: true for remote jobs only
    - `include_stale`: Include potentially outdated jobs (default: false)
    - `min_salary` / `max_salary`: Salary range filter
    """
    query = db.query(Opportunity)
    
    # Exclude stale by default
    if not include_stale:
        query = query.filter(Opportunity.is_stale == False)
    
    # Apply filters
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Opportunity.title.ilike(search_term),
                Opportunity.description.ilike(search_term),
                (Opportunity.company_name.ilike(search_term) if hasattr(Opportunity, "company_name") else Opportunity.company.ilike(search_term)),
                (Opportunity.company.ilike(search_term) if hasattr(Opportunity, "company") else Opportunity.company_name.ilike(search_term)),
            )
        )
    
    if source:
        query = query.filter(Opportunity.source == source)
    
    if location:
        query = query.filter(Opportunity.location.ilike(f"%{location}%"))
    
    if job_type:
        query = query.filter(Opportunity.job_type == job_type)
    
    if remote is not None:
        query = query.filter(Opportunity.is_remote == remote)
    
    if min_salary is not None:
        query = query.filter(
            or_(
                Opportunity.salary_min >= min_salary,
                Opportunity.salary_max >= min_salary
            )
        )
    
    if max_salary is not None:
        query = query.filter(
            or_(
                Opportunity.salary_max <= max_salary,
                Opportunity.salary_min <= max_salary
            )
        )
    
    # Get total count
    total = query.count()
    
    # Order by most recent first
    query = query.order_by(desc(Opportunity.created_at))
    
    # Paginate
    offset = (page - 1) * per_page
    opportunities = query.offset(offset).limit(per_page).all()
    
    return OpportunityListResponse(
        total=total,
        page=page,
        per_page=per_page,
        opportunities=[OpportunityResponse.model_validate(o) for o in opportunities]
    )


@router.get("/feed", response_model=List[OpportunityResponse])
def get_swipe_feed(
    limit: int = Query(20, ge=1, le=50, description="Number of jobs to return"),
    exclude_ids: Optional[str] = Query(None, description="Comma-separated IDs to exclude"),
    
    # Preference filters (for AI matching)
    preferred_locations: Optional[str] = Query(None, description="Comma-separated preferred locations"),
    preferred_job_types: Optional[str] = Query(None, description="Comma-separated job types"),
    remote_preferred: Optional[bool] = Query(None, description="Prefer remote jobs"),
    
    db: Session = Depends(get_db)
):
    """
    Get jobs for the swipe feed.
    
    This endpoint is optimized for the mobile swipe interface.
    It excludes already-seen jobs and applies user preferences.
    
    **Usage:**
    1. Fetch initial batch: `GET /feed?limit=20`
    2. After swiping, fetch more: `GET /feed?limit=20&exclude_ids=1,2,3,4,5`
    """
    query = db.query(Opportunity).filter(Opportunity.is_stale == False)
    
    # Exclude already-seen jobs
    if exclude_ids:
        try:
            ids_to_exclude = [int(id.strip()) for id in exclude_ids.split(",")]
            query = query.filter(~Opportunity.id.in_(ids_to_exclude))
        except ValueError:
            pass  # Ignore invalid IDs
    
    # Apply preferences (simple filtering for MVP)
    if preferred_locations:
        locations = [loc.strip() for loc in preferred_locations.split(",")]
        location_filters = [Opportunity.location.ilike(f"%{loc}%") for loc in locations]
        query = query.filter(or_(*location_filters))
    
    if preferred_job_types:
        job_types = [jt.strip() for jt in preferred_job_types.split(",")]
        query = query.filter(Opportunity.job_type.in_(job_types))
    
    if remote_preferred is True:
        query = query.filter(Opportunity.is_remote == True)
    
    # Order by freshness and randomize a bit for variety
    query = query.order_by(desc(Opportunity.refreshed_at))
    
    opportunities = query.limit(limit).all()
    
    return [OpportunityResponse.model_validate(o) for o in opportunities]


@router.get("/{opportunity_id}", response_model=OpportunityResponse)
def get_opportunity(
    opportunity_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a single opportunity by ID.
    """
    opportunity = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    
    return OpportunityResponse.model_validate(opportunity)


@router.post("", response_model=OpportunityResponse)
def create_opportunity(
    opportunity: OpportunityCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new opportunity manually.
    
    This is typically used by the recruiter portal.
    """
    # Check for duplicates
    if opportunity.external_id:
        existing = db.query(Opportunity).filter(
            and_(
                Opportunity.source == opportunity.source,
                Opportunity.external_id == opportunity.external_id
            )
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=409,
                detail="Opportunity with this source and external_id already exists"
            )
    
    db_opportunity = Opportunity(**opportunity.model_dump())
    db.add(db_opportunity)
    db.commit()
    db.refresh(db_opportunity)
    
    return OpportunityResponse.model_validate(db_opportunity)


@router.patch("/{opportunity_id}", response_model=OpportunityResponse)
def update_opportunity(
    opportunity_id: int,
    updates: OpportunityUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing opportunity.
    """
    opportunity = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    
    # Apply updates
    update_data = updates.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(opportunity, field, value)
    
    db.commit()
    db.refresh(opportunity)
    
    return OpportunityResponse.model_validate(opportunity)


@router.delete("/{opportunity_id}")
def delete_opportunity(
    opportunity_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete an opportunity.
    """
    opportunity = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()

    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    db.delete(opportunity)
    db.commit()

    return {"status": "deleted", "id": opportunity_id}


# ==============================================================================
# BULK IMPORT ENDPOINTS
# ==============================================================================

VALID_JOB_TYPES = {"fulltime", "parttime", "internship", "contract", "temporary", None}
VALID_OPPORTUNITY_TYPES = {"job", "internship", "scholarship", "grant"}
VALID_EXPERIENCE_LEVELS = {"entry", "mid", "senior", "executive"}


def _validate_opportunity(item: BulkImportItem, index: int) -> List[str]:
    """Validate a single opportunity item. Returns list of error messages."""
    errors = []

    if not item.title or len(item.title.strip()) == 0:
        errors.append(f"Item {index}: title is required")

    if item.job_type and item.job_type not in VALID_JOB_TYPES:
        errors.append(f"Item {index}: invalid job_type '{item.job_type}'. Valid: {VALID_JOB_TYPES}")

    if item.opportunity_type not in VALID_OPPORTUNITY_TYPES:
        errors.append(f"Item {index}: invalid opportunity_type '{item.opportunity_type}'. Valid: {VALID_OPPORTUNITY_TYPES}")

    if item.experience_level not in VALID_EXPERIENCE_LEVELS:
        errors.append(f"Item {index}: invalid experience_level '{item.experience_level}'. Valid: {VALID_EXPERIENCE_LEVELS}")

    if item.salary_min is not None and item.salary_min < 0:
        errors.append(f"Item {index}: salary_min cannot be negative")

    if item.salary_max is not None and item.salary_max < 0:
        errors.append(f"Item {index}: salary_max cannot be negative")

    if item.salary_min is not None and item.salary_max is not None:
        if item.salary_min > item.salary_max:
            errors.append(f"Item {index}: salary_min cannot be greater than salary_max")

    return errors


@router.post("/bulk", response_model=BulkImportResponse)
def bulk_import_opportunities(
    request: BulkImportRequest,
    db: Session = Depends(get_db)
):
    """
    Bulk import opportunities from JSON.

    **Request Body:**
    ```json
    {
        "opportunities": [
            {
                "title": "Software Engineer",
                "company": "TechCorp",
                "location": "San Francisco, CA",
                "description": "Build amazing products...",
                "url": "https://example.com/apply",
                "salary_min": 80000,
                "salary_max": 120000,
                "job_type": "fulltime",
                "is_remote": true,
                "external_id": "tc-12345"
            }
        ],
        "skip_duplicates": true
    }
    ```

    **Validation:**
    - `title` is required
    - `job_type` must be: fulltime, parttime, internship, contract, temporary
    - `opportunity_type` must be: job, internship, scholarship, grant
    - `experience_level` must be: entry, mid, senior, executive
    - Salaries must be non-negative, min <= max

    **Returns:**
    - Count of inserted and skipped items
    - List of validation errors
    """
    inserted = 0
    skipped = 0
    all_errors: List[str] = []

    for i, item in enumerate(request.opportunities):
        # Validate
        errors = _validate_opportunity(item, i)
        if errors:
            all_errors.extend(errors)
            skipped += 1
            continue

        # Check for duplicates
        if request.skip_duplicates and item.external_id:
            existing = db.query(Opportunity).filter(
                and_(
                    Opportunity.source == item.source,
                    Opportunity.external_id == item.external_id
                )
            ).first()

            if existing:
                skipped += 1
                continue

        # Create opportunity
        try:
            db_opportunity = Opportunity(
                title=item.title,
                company=item.company or item.company_name,
                company_name=item.company_name or item.company,
                location=item.location,
                description=item.description,
                url=item.url,
                application_url=item.url,
                salary_min=item.salary_min,
                salary_max=item.salary_max,
                salary_currency=item.salary_currency,
                job_type=item.job_type,
                is_remote=item.is_remote or item.remote,
                opportunity_type=item.opportunity_type,
                experience_level=item.experience_level,
                source=item.source,
                external_id=item.external_id,
            )
            db.add(db_opportunity)
            inserted += 1
        except Exception as e:
            all_errors.append(f"Item {i}: database error - {str(e)}")
            skipped += 1

    # Commit all at once
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database commit failed: {str(e)}")

    status = "success" if not all_errors else "partial" if inserted > 0 else "failed"

    return BulkImportResponse(
        status=status,
        total_received=len(request.opportunities),
        inserted=inserted,
        skipped=skipped,
        errors=all_errors[:50]  # Limit errors in response
    )


@router.post("/bulk/csv", response_model=BulkImportResponse)
async def bulk_import_csv(
    file: UploadFile = File(..., description="CSV file with job data"),
    skip_duplicates: bool = Query(True, description="Skip items with duplicate external_id"),
    db: Session = Depends(get_db)
):
    """
    Bulk import opportunities from CSV file.

    **CSV Format:**
    ```csv
    title,company,location,description,url,salary_min,salary_max,job_type,is_remote,external_id
    Software Engineer,TechCorp,San Francisco,Build products...,https://...,80000,120000,fulltime,true,tc-123
    Data Analyst,DataCo,Remote,Analyze data...,https://...,70000,90000,fulltime,true,dc-456
    ```

    **Required columns:** title

    **Optional columns:** company, company_name, location, description, url, salary_min,
    salary_max, salary_currency, job_type, is_remote, remote, opportunity_type,
    experience_level, source, external_id
    """
    # Validate file type
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")

    # Read file content
    try:
        contents = await file.read()
        decoded = contents.decode('utf-8')
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read file: {str(e)}")

    # Parse CSV
    try:
        reader = csv.DictReader(io.StringIO(decoded))
        rows = list(reader)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid CSV format: {str(e)}")

    if not rows:
        raise HTTPException(status_code=400, detail="CSV file is empty")

    if len(rows) > 500:
        raise HTTPException(status_code=400, detail="Maximum 500 rows allowed per import")

    # Convert rows to BulkImportItem
    opportunities = []
    parse_errors = []

    for i, row in enumerate(rows):
        try:
            # Parse boolean fields
            is_remote = row.get('is_remote', '').lower() in ('true', '1', 'yes')
            remote = row.get('remote', '').lower() in ('true', '1', 'yes')

            # Parse numeric fields
            salary_min = None
            salary_max = None

            if row.get('salary_min'):
                try:
                    salary_min = float(row['salary_min'].replace(',', ''))
                except ValueError:
                    pass

            if row.get('salary_max'):
                try:
                    salary_max = float(row['salary_max'].replace(',', ''))
                except ValueError:
                    pass

            item = BulkImportItem(
                title=row.get('title', '').strip(),
                company=row.get('company', '').strip() or None,
                company_name=row.get('company_name', '').strip() or None,
                location=row.get('location', '').strip() or None,
                description=row.get('description', '').strip() or None,
                url=row.get('url', '').strip() or None,
                salary_min=salary_min,
                salary_max=salary_max,
                salary_currency=row.get('salary_currency', 'USD').strip() or 'USD',
                job_type=row.get('job_type', '').strip() or None,
                is_remote=is_remote or remote,
                remote=remote or is_remote,
                opportunity_type=row.get('opportunity_type', 'job').strip() or 'job',
                experience_level=row.get('experience_level', 'entry').strip() or 'entry',
                source=row.get('source', 'csv_import').strip() or 'csv_import',
                external_id=row.get('external_id', '').strip() or None,
            )
            opportunities.append(item)
        except Exception as e:
            parse_errors.append(f"Row {i + 1}: parse error - {str(e)}")

    if not opportunities:
        return BulkImportResponse(
            status="failed",
            total_received=len(rows),
            inserted=0,
            skipped=len(rows),
            errors=parse_errors
        )

    # Use the JSON bulk import logic
    bulk_request = BulkImportRequest(
        opportunities=opportunities,
        skip_duplicates=skip_duplicates
    )

    result = bulk_import_opportunities(bulk_request, db)

    # Add parse errors to result
    result.errors = parse_errors + result.errors

    return result
