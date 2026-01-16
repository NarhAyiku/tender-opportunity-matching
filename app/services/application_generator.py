"""
Application preview data generator service.
For MVP, uses template-based generation. Full AI form-filling will come later.
"""
from typing import Dict, Any
from app.models.user import User
from app.models.opportunity import Opportunity


def generate_cover_letter_template(user: User, opportunity: Opportunity) -> str:
    """Generate a basic cover letter template based on user profile and opportunity."""
    # Extract user info
    name = user.name
    headline = user.headline or "Student/Graduate"
    skills = user.skills or []
    top_skills = ", ".join(skills[:5]) if skills else "various skills"
    
    # Extract opportunity info
    company = opportunity.company_name or "the company"
    title = opportunity.title
    required_skills = opportunity.required_skills or []
    
    # Build cover letter
    cover_letter = f"""Dear Hiring Manager,

I am writing to express my interest in the {title} position at {company}. As a {headline}, I am excited about the opportunity to contribute to your team.

My background includes experience with {top_skills}, which aligns well with the requirements for this role. I am particularly drawn to {company} because of [your interest/reason - edit this section].

I am confident that my skills and passion make me a strong candidate for this position. I would welcome the opportunity to discuss how I can contribute to your team.

Thank you for considering my application.

Best regards,
{name}"""
    
    return cover_letter


def generate_preview_data(user: User, opportunity: Opportunity) -> Dict[str, Any]:
    """
    Generate preview data for an application.
    Returns a dictionary with cover letter and form fields.
    """
    cover_letter = generate_cover_letter_template(user, opportunity)
    
    # For MVP, we'll just generate the cover letter
    # In the future, this could include pre-filled form fields
    preview_data = {
        "cover_letter": cover_letter,
        "form_fields": {
            # Placeholder for future form field generation
            "notes": f"Interested in {opportunity.title} at {opportunity.company_name}"
        },
        "generated_at": None,  # Will be set when creating swipe
        "version": "1.0"  # For tracking template versions
    }
    
    return preview_data
