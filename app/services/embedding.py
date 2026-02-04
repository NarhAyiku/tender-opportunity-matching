"""
Embedding Service - Generate text embeddings using sentence-transformers

Uses a lightweight model (all-MiniLM-L6-v2) for fast inference.
Embeddings are 384-dimensional vectors.
"""
import logging
from typing import List, Optional, Union
from functools import lru_cache
import numpy as np

logger = logging.getLogger(__name__)

# Lazy load the model to avoid slow startup
_model = None


def get_model():
    """Lazy load the sentence transformer model."""
    global _model
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            logger.info("Loading sentence-transformers model...")
            # all-MiniLM-L6-v2 is fast and produces good results
            # 384-dimensional embeddings, ~80MB model
            _model = SentenceTransformer('all-MiniLM-L6-v2')
            logger.info("Model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise
    return _model


def generate_embedding(text: str) -> List[float]:
    """
    Generate embedding for a single text string.

    Args:
        text: Input text to embed

    Returns:
        List of floats (384-dimensional vector)
    """
    if not text or not text.strip():
        # Return zero vector for empty text
        return [0.0] * 384

    model = get_model()
    embedding = model.encode(text, convert_to_numpy=True)
    return embedding.tolist()


def generate_embeddings_batch(texts: List[str]) -> List[List[float]]:
    """
    Generate embeddings for multiple texts efficiently.

    Args:
        texts: List of input texts

    Returns:
        List of embedding vectors
    """
    if not texts:
        return []

    # Replace empty strings with placeholder
    processed_texts = [t if t and t.strip() else " " for t in texts]

    model = get_model()
    embeddings = model.encode(processed_texts, convert_to_numpy=True)
    return embeddings.tolist()


def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """
    Calculate cosine similarity between two vectors.

    Args:
        vec1: First vector
        vec2: Second vector

    Returns:
        Similarity score between -1 and 1 (higher is more similar)
    """
    if not vec1 or not vec2:
        return 0.0

    a = np.array(vec1)
    b = np.array(vec2)

    # Handle zero vectors
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)

    if norm_a == 0 or norm_b == 0:
        return 0.0

    return float(np.dot(a, b) / (norm_a * norm_b))


def cosine_similarity_batch(
    query_vec: List[float],
    candidate_vecs: List[List[float]]
) -> List[float]:
    """
    Calculate cosine similarity between a query and multiple candidates.

    Args:
        query_vec: Query vector
        candidate_vecs: List of candidate vectors

    Returns:
        List of similarity scores
    """
    if not query_vec or not candidate_vecs:
        return [0.0] * len(candidate_vecs) if candidate_vecs else []

    query = np.array(query_vec)
    candidates = np.array(candidate_vecs)

    # Normalize
    query_norm = np.linalg.norm(query)
    if query_norm == 0:
        return [0.0] * len(candidate_vecs)

    query_normalized = query / query_norm

    # Calculate norms for all candidates
    candidate_norms = np.linalg.norm(candidates, axis=1)

    # Handle zero vectors
    candidate_norms = np.where(candidate_norms == 0, 1, candidate_norms)
    candidates_normalized = candidates / candidate_norms[:, np.newaxis]

    # Batch dot product
    similarities = np.dot(candidates_normalized, query_normalized)

    return similarities.tolist()


# ============================================================================
# Profile and Opportunity Text Builders
# ============================================================================

def build_user_profile_text(user_data: dict) -> str:
    """
    Build a text representation of a user profile for embedding.

    Args:
        user_data: Dictionary with user profile fields

    Returns:
        Concatenated text representation
    """
    parts = []

    # Name and headline
    if user_data.get("name"):
        parts.append(f"Name: {user_data['name']}")
    if user_data.get("headline"):
        parts.append(f"Headline: {user_data['headline']}")

    # Bio and goals
    if user_data.get("bio"):
        parts.append(f"Bio: {user_data['bio']}")
    if user_data.get("goals"):
        parts.append(f"Career Goals: {user_data['goals']}")

    # Skills
    skills = user_data.get("skills", [])
    if skills:
        parts.append(f"Skills: {', '.join(skills)}")

    # Work experience
    experiences = user_data.get("work_experiences", [])
    if experiences:
        exp_texts = []
        for exp in experiences[:3]:  # Limit to 3 most recent
            title = exp.get("title", "")
            company = exp.get("company", "")
            desc = exp.get("description_bullets", [])
            if isinstance(desc, list):
                desc = " ".join(desc[:2])  # First 2 bullets
            exp_texts.append(f"{title} at {company}. {desc}")
        parts.append(f"Experience: {' | '.join(exp_texts)}")

    # Education
    education = user_data.get("education_entries", [])
    if education:
        edu_texts = []
        for edu in education[:2]:  # Limit to 2
            degree = edu.get("degree_type", "")
            field = edu.get("field_of_study", "")
            institution = edu.get("institution", "")
            edu_texts.append(f"{degree} in {field} from {institution}")
        parts.append(f"Education: {' | '.join(edu_texts)}")

    # Projects
    projects = user_data.get("projects", [])
    if projects:
        proj_texts = []
        for proj in projects[:2]:  # Limit to 2
            name = proj.get("name", "")
            desc = proj.get("description", "")[:100]  # Truncate
            proj_texts.append(f"{name}: {desc}")
        parts.append(f"Projects: {' | '.join(proj_texts)}")

    # Interests
    interests = user_data.get("interests", [])
    if interests:
        parts.append(f"Interests: {', '.join(interests)}")

    return " ".join(parts)


def build_opportunity_text(opp_data: dict) -> str:
    """
    Build a text representation of an opportunity for embedding.

    Args:
        opp_data: Dictionary with opportunity fields

    Returns:
        Concatenated text representation
    """
    parts = []

    # Title and company
    if opp_data.get("title"):
        parts.append(f"Title: {opp_data['title']}")
    company = opp_data.get("company_name") or opp_data.get("company")
    if company:
        parts.append(f"Company: {company}")

    # Location
    location = opp_data.get("location")
    if location:
        parts.append(f"Location: {location}")
    if opp_data.get("is_remote"):
        parts.append("Remote work available")

    # Description (truncate to avoid too long text)
    description = opp_data.get("description", "")
    if description:
        # Take first 500 chars of description
        parts.append(f"Description: {description[:500]}")

    # Required skills
    required_skills = opp_data.get("required_skills", [])
    if required_skills:
        parts.append(f"Required Skills: {', '.join(required_skills)}")

    # Preferred skills
    preferred_skills = opp_data.get("preferred_skills", [])
    if preferred_skills:
        parts.append(f"Preferred Skills: {', '.join(preferred_skills)}")

    # Job type and level
    if opp_data.get("job_type"):
        parts.append(f"Job Type: {opp_data['job_type']}")
    if opp_data.get("experience_level"):
        parts.append(f"Experience Level: {opp_data['experience_level']}")
    if opp_data.get("opportunity_type"):
        parts.append(f"Opportunity Type: {opp_data['opportunity_type']}")

    # Category
    if opp_data.get("category"):
        parts.append(f"Category: {opp_data['category']}")

    return " ".join(parts)


# ============================================================================
# High-level API
# ============================================================================

def get_user_embedding(user_data: dict) -> List[float]:
    """
    Generate embedding for a user profile.

    Args:
        user_data: User profile dictionary

    Returns:
        384-dimensional embedding vector
    """
    text = build_user_profile_text(user_data)
    return generate_embedding(text)


def get_opportunity_embedding(opp_data: dict) -> List[float]:
    """
    Generate embedding for an opportunity.

    Args:
        opp_data: Opportunity dictionary

    Returns:
        384-dimensional embedding vector
    """
    text = build_opportunity_text(opp_data)
    return generate_embedding(text)


def get_opportunity_embeddings_batch(opportunities: List[dict]) -> List[List[float]]:
    """
    Generate embeddings for multiple opportunities efficiently.

    Args:
        opportunities: List of opportunity dictionaries

    Returns:
        List of embedding vectors
    """
    texts = [build_opportunity_text(opp) for opp in opportunities]
    return generate_embeddings_batch(texts)
