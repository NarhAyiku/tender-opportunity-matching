"""
AI Matching Service - Combines multiple signals for opportunity matching

Scoring Components:
1. Semantic Similarity (40%) - Embedding cosine similarity
2. Skills Match (30%) - Jaccard similarity on skills
3. Preferences Match (20%) - Location, salary, job type preferences
4. Experience Level Match (10%) - Entry/Mid/Senior alignment

The weights can be adjusted based on user feedback and A/B testing.
"""
import logging
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass

from app.services.embedding import (
    get_user_embedding,
    get_opportunity_embedding,
    get_opportunity_embeddings_batch,
    cosine_similarity,
    cosine_similarity_batch,
)

logger = logging.getLogger(__name__)


# Default weights for scoring components
DEFAULT_WEIGHTS = {
    "semantic": 0.40,      # Embedding similarity
    "skills": 0.30,        # Skill overlap
    "preferences": 0.20,   # User preferences match
    "experience": 0.10,    # Experience level alignment
}


@dataclass
class MatchResult:
    """Result of matching an opportunity to a user."""
    opportunity_id: int
    overall_score: float
    semantic_score: float
    skills_score: float
    preferences_score: float
    experience_score: float
    matched_skills: List[str]
    match_reasons: List[str]


class MatchingService:
    """
    Service for AI-powered opportunity matching.
    """

    def __init__(self, weights: Optional[Dict[str, float]] = None):
        """
        Initialize the matching service.

        Args:
            weights: Custom weights for scoring components
        """
        self.weights = weights or DEFAULT_WEIGHTS.copy()
        self._user_embedding_cache: Dict[int, List[float]] = {}

    def calculate_skills_score(
        self,
        user_skills: List[str],
        required_skills: List[str],
        preferred_skills: List[str] = None
    ) -> Tuple[float, List[str]]:
        """
        Calculate skills match using Jaccard similarity.

        Args:
            user_skills: User's skills
            required_skills: Required skills for the opportunity
            preferred_skills: Nice-to-have skills

        Returns:
            Tuple of (score, matched_skills)
        """
        user_set = set(s.lower() for s in (user_skills or []))
        required_set = set(s.lower() for s in (required_skills or []))
        preferred_set = set(s.lower() for s in (preferred_skills or []))

        # No requirements = perfect match
        if not required_set and not preferred_set:
            return 1.0, []

        # Calculate overlap
        required_match = user_set & required_set
        preferred_match = user_set & preferred_set

        # Weighted score: required skills matter more
        if required_set:
            required_score = len(required_match) / len(required_set)
        else:
            required_score = 1.0

        if preferred_set:
            preferred_score = len(preferred_match) / len(preferred_set)
        else:
            preferred_score = 1.0

        # Weight: 70% required, 30% preferred
        score = 0.7 * required_score + 0.3 * preferred_score

        # Return matched skills (use original case from user's skills)
        matched = []
        for skill in (user_skills or []):
            if skill.lower() in required_match or skill.lower() in preferred_match:
                matched.append(skill)

        return round(score, 3), matched

    def calculate_preferences_score(
        self,
        user_preferences: dict,
        opportunity: dict
    ) -> Tuple[float, List[str]]:
        """
        Calculate how well an opportunity matches user preferences.

        Args:
            user_preferences: User's job preferences
            opportunity: Opportunity data

        Returns:
            Tuple of (score, reasons)
        """
        if not user_preferences:
            return 0.5, []  # Neutral score if no preferences

        scores = []
        reasons = []

        # Location match
        preferred_locations = user_preferences.get("preferred_locations", [])
        opp_location = (opportunity.get("location") or "").lower()
        opp_is_remote = opportunity.get("is_remote", False)
        willing_to_relocate = user_preferences.get("willing_to_relocate", "no")

        if preferred_locations:
            location_match = False
            for loc in preferred_locations:
                loc_str = ""
                if isinstance(loc, dict):
                    loc_str = f"{loc.get('city', '')} {loc.get('country', '')}".lower()
                else:
                    loc_str = str(loc).lower()

                if loc_str in opp_location or opp_location in loc_str:
                    location_match = True
                    reasons.append(f"Location matches: {opp_location}")
                    break

            # Remote jobs match everyone who prefers remote
            work_arrangements = user_preferences.get("work_arrangements", [])
            if opp_is_remote and "remote" in [w.lower() for w in work_arrangements]:
                location_match = True
                reasons.append("Remote work available")

            if location_match:
                scores.append(1.0)
            elif willing_to_relocate == "yes":
                scores.append(0.7)
            elif willing_to_relocate == "maybe":
                scores.append(0.5)
            else:
                scores.append(0.2)
        else:
            scores.append(0.5)  # Neutral

        # Salary match
        user_min = user_preferences.get("salary_min")
        user_max = user_preferences.get("salary_max")
        opp_min = opportunity.get("salary_min")
        opp_max = opportunity.get("salary_max")

        if user_min is not None and (opp_min is not None or opp_max is not None):
            opp_salary = opp_max or opp_min or 0
            if opp_salary >= user_min:
                scores.append(1.0)
                reasons.append(f"Salary meets expectations")
            elif opp_salary >= user_min * 0.9:  # Within 10%
                scores.append(0.8)
            elif opp_salary >= user_min * 0.8:  # Within 20%
                scores.append(0.6)
            else:
                scores.append(0.3)
        else:
            scores.append(0.5)  # Neutral if salary not specified

        # Work arrangement match
        work_arrangements = [w.lower() for w in user_preferences.get("work_arrangements", [])]
        opp_arrangement = (opportunity.get("work_arrangement") or "").lower()

        if work_arrangements:
            if opp_arrangement in work_arrangements:
                scores.append(1.0)
                reasons.append(f"Work arrangement: {opp_arrangement}")
            elif opp_is_remote and "remote" in work_arrangements:
                scores.append(1.0)
                reasons.append("Remote work available")
            else:
                scores.append(0.3)
        else:
            scores.append(0.5)

        # Opportunity type match
        preferred_types = [t.lower() for t in user_preferences.get("opportunity_types", [])]
        opp_type = (opportunity.get("opportunity_type") or "job").lower()

        if preferred_types:
            if opp_type in preferred_types:
                scores.append(1.0)
            else:
                scores.append(0.2)
        else:
            scores.append(0.5)

        # Company size match (if specified)
        preferred_sizes = [s.lower() for s in user_preferences.get("company_sizes", [])]
        opp_size = (opportunity.get("company_size") or "").lower()

        if preferred_sizes and opp_size:
            if opp_size in preferred_sizes:
                scores.append(1.0)
            else:
                scores.append(0.5)

        # Average all scores
        final_score = sum(scores) / len(scores) if scores else 0.5
        return round(final_score, 3), reasons

    def calculate_experience_score(
        self,
        user_data: dict,
        opportunity: dict
    ) -> float:
        """
        Calculate experience level alignment.

        Args:
            user_data: User profile data
            opportunity: Opportunity data

        Returns:
            Score between 0 and 1
        """
        opp_level = (opportunity.get("experience_level") or "entry").lower()

        # Estimate user's experience level from work history
        work_experiences = user_data.get("work_experiences", [])
        years = 0

        for exp in work_experiences:
            # Rough estimate: count each experience as 1-3 years
            is_current = exp.get("is_current", False)
            years += 2 if is_current else 1.5

        # Map years to level
        if years <= 2:
            user_level = "entry"
        elif years <= 5:
            user_level = "mid"
        elif years <= 10:
            user_level = "senior"
        else:
            user_level = "executive"

        # Score based on alignment
        level_order = ["entry", "mid", "senior", "executive"]

        try:
            user_idx = level_order.index(user_level)
            opp_idx = level_order.index(opp_level)
            diff = abs(user_idx - opp_idx)

            if diff == 0:
                return 1.0
            elif diff == 1:
                return 0.7  # Adjacent level
            elif diff == 2:
                return 0.4
            else:
                return 0.2
        except ValueError:
            return 0.5  # Unknown level

    def match_opportunity(
        self,
        user_data: dict,
        user_preferences: Optional[dict],
        opportunity: dict,
        user_embedding: Optional[List[float]] = None
    ) -> MatchResult:
        """
        Calculate match score for a single opportunity.

        Args:
            user_data: User profile data
            user_preferences: User's job preferences
            opportunity: Opportunity data
            user_embedding: Pre-computed user embedding (optional)

        Returns:
            MatchResult with scores and reasons
        """
        # Get user embedding
        if user_embedding is None:
            user_embedding = get_user_embedding(user_data)

        # Get opportunity embedding
        opp_embedding = get_opportunity_embedding(opportunity)

        # Calculate semantic similarity
        semantic_score = cosine_similarity(user_embedding, opp_embedding)
        # Normalize from [-1, 1] to [0, 1]
        semantic_score = (semantic_score + 1) / 2

        # Calculate skills score
        skills_score, matched_skills = self.calculate_skills_score(
            user_data.get("skills", []),
            opportunity.get("required_skills", []),
            opportunity.get("preferred_skills", [])
        )

        # Calculate preferences score
        preferences_score, match_reasons = self.calculate_preferences_score(
            user_preferences or {},
            opportunity
        )

        # Calculate experience score
        experience_score = self.calculate_experience_score(user_data, opportunity)

        # Weighted overall score
        overall_score = (
            self.weights["semantic"] * semantic_score +
            self.weights["skills"] * skills_score +
            self.weights["preferences"] * preferences_score +
            self.weights["experience"] * experience_score
        )

        # Build match reasons
        if semantic_score > 0.7:
            match_reasons.insert(0, "Strong profile match")
        if skills_score > 0.7 and matched_skills:
            match_reasons.insert(0, f"Skills match: {', '.join(matched_skills[:3])}")

        return MatchResult(
            opportunity_id=opportunity.get("id", 0),
            overall_score=round(overall_score, 3),
            semantic_score=round(semantic_score, 3),
            skills_score=round(skills_score, 3),
            preferences_score=round(preferences_score, 3),
            experience_score=round(experience_score, 3),
            matched_skills=matched_skills,
            match_reasons=match_reasons[:5]  # Limit reasons
        )

    def match_opportunities_batch(
        self,
        user_data: dict,
        user_preferences: Optional[dict],
        opportunities: List[dict]
    ) -> List[MatchResult]:
        """
        Match multiple opportunities efficiently using batch embedding.

        Args:
            user_data: User profile data
            user_preferences: User's job preferences
            opportunities: List of opportunity data

        Returns:
            List of MatchResults sorted by score (best first)
        """
        if not opportunities:
            return []

        # Get user embedding once
        user_embedding = get_user_embedding(user_data)

        # Get all opportunity embeddings in batch
        opp_embeddings = get_opportunity_embeddings_batch(opportunities)

        # Calculate semantic similarities in batch
        semantic_scores = cosine_similarity_batch(user_embedding, opp_embeddings)
        # Normalize from [-1, 1] to [0, 1]
        semantic_scores = [(s + 1) / 2 for s in semantic_scores]

        results = []
        for i, opp in enumerate(opportunities):
            # Calculate skills score
            skills_score, matched_skills = self.calculate_skills_score(
                user_data.get("skills", []),
                opp.get("required_skills", []),
                opp.get("preferred_skills", [])
            )

            # Calculate preferences score
            preferences_score, match_reasons = self.calculate_preferences_score(
                user_preferences or {},
                opp
            )

            # Calculate experience score
            experience_score = self.calculate_experience_score(user_data, opp)

            # Weighted overall score
            semantic_score = semantic_scores[i]
            overall_score = (
                self.weights["semantic"] * semantic_score +
                self.weights["skills"] * skills_score +
                self.weights["preferences"] * preferences_score +
                self.weights["experience"] * experience_score
            )

            # Build match reasons
            reasons = match_reasons.copy()
            if semantic_score > 0.7:
                reasons.insert(0, "Strong profile match")
            if skills_score > 0.7 and matched_skills:
                reasons.insert(0, f"Skills match: {', '.join(matched_skills[:3])}")

            results.append(MatchResult(
                opportunity_id=opp.get("id", 0),
                overall_score=round(overall_score, 3),
                semantic_score=round(semantic_score, 3),
                skills_score=round(skills_score, 3),
                preferences_score=round(preferences_score, 3),
                experience_score=round(experience_score, 3),
                matched_skills=matched_skills,
                match_reasons=reasons[:5]
            ))

        # Sort by overall score (best first)
        results.sort(key=lambda x: x.overall_score, reverse=True)

        return results


# Singleton instance
_matching_service: Optional[MatchingService] = None


def get_matching_service(weights: Optional[Dict[str, float]] = None) -> MatchingService:
    """Get or create the matching service singleton."""
    global _matching_service
    if _matching_service is None or weights is not None:
        _matching_service = MatchingService(weights)
    return _matching_service
