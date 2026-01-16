# Schemas package
from .profile import (
    WorkExperience,
    EducationEntry,
    Project,
    LanguageSkill,
    Award,
    UserProfileResponse,
    UserProfileUpdate,
    calculate_profile_completion,
)

from .preferences import (
    LocationPreference,
    UserPreferencesCreate,
    UserPreferencesUpdate,
    UserPreferencesResponse,
)

from .opportunity import (
    OpportunityCreate,
    OpportunityUpdate,
    OpportunityResponse,
    OpportunityCardResponse,
)

from .swipe import (
    SwipeAction,
    SwipeCreate,
    SwipeResponse,
    SwipeWithOpportunity,
)

from .application import (
    ApplicationStatus,
    ApplicationEventType,
    ApplicationCreate,
    ApplicationUpdate,
    ApplicationResponse,
    ApplicationListItem,
    ApplicationDetail,
    ApplicationEventCreate,
    ApplicationEventResponse,
)
