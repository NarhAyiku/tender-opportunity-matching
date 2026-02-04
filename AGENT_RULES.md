# TENDER Platform — Agent Rules & Coding Standards

> This document serves as the canonical reference for AI coding agents and developers working on the TENDER platform. All code contributions should follow these patterns and conventions.

---

## 1. Project Overview

**TENDER** is a swipe-based (Tinder-style) opportunity matching platform for students and graduates. Users upload CVs and documents, swipe on opportunities (jobs, scholarships, grants, internships), and upon liking, their documents are sent to the company.

**Tech Stack:**
- Backend: FastAPI (Python), SQLAlchemy ORM, SQLite (dev) / PostgreSQL (prod)
- Mobile App: React 18 + JavaScript (JSX), Vite, Supabase Auth, Tailwind CSS v4
- Web Frontend: React 19 + TypeScript (TSX), Vite, Zustand, Axios, Tailwind CSS v4
- Auth: JWT + pbkdf2_sha256 password hashing

**Development Philosophy:**
- Ship fast, iterate with feedback
- Build only what moves the needle
- Execution-focused, not perfection-focused

---

## 2. General Principles

- **Don't break existing endpoints.** Every API change must be backward-compatible or explicitly coordinated.
- **Ask before refactoring core logic.** Don't reorganize auth, database setup, or routing without discussing it first.
- **Prefer editing existing files** over creating new ones. Only create new files when introducing a genuinely new domain or feature.
- **Read `progress.txt` before starting work.** It tracks what's done, in progress, and blocked across all milestones.
- **Update `progress.txt` when completing tasks.** Mark items `[x]` and add dated notes.
- **Reference `CLAUDE.md`** for the backlog, TDR-XXX feature codes, and technical patterns.
- **Reference `PRD.md` and `SRS.md`** for detailed product requirements and milestone definitions.
- **Log significant work** in `WORK_LOG.md` using the template at the top of that file.

---

## 3. Backend Rules (FastAPI / Python)

### 3.1 File Organization

```
app/
├── main.py              # FastAPI app init, router registration, CORS, startup
├── database.py          # SQLAlchemy engine, SessionLocal, Base
├── security.py          # JWT, password hashing, auth dependencies
├── config.py            # File upload paths, size limits, allowed extensions
├── api/                 # One router per domain
│   ├── auth.py          # /auth/* endpoints
│   ├── users.py         # /users/* endpoints
│   ├── opportunities.py # /opportunities/* endpoints
│   └── ...
├── models/              # One SQLAlchemy model per domain
│   ├── user.py
│   ├── opportunity.py
│   └── ...
├── schemas/             # One Pydantic schema module per domain
│   ├── profile.py
│   ├── opportunity.py
│   └── ...
└── services/            # Business logic (matching, parsing, adapters)
    ├── matching.py
    ├── document_parser.py
    └── job_adapters/    # External source adapters (base + concrete)
```

**Rules:**
- One router file per API domain in `app/api/`
- One model file per database domain in `app/models/`
- One schema file per domain in `app/schemas/`
- Business logic goes in `app/services/`, not in route handlers
- Keep route handlers thin: validate input, call service, return response

### 3.2 Naming Conventions

| Element | Convention | Examples |
|---------|-----------|----------|
| Files | snake_case | `document_parser.py`, `job_sync.py` |
| Functions / variables | snake_case | `get_current_user`, `calculate_match_score` |
| Function prefixes | Intent-based | `calculate_*`, `check_*`, `validate_*`, `get_*`, `create_*` |
| Classes | PascalCase | `User`, `MatchingService`, `MatchResult` |
| Enums | PascalCase, inherits `(str, Enum)` | `SwipeAction`, `SwipeStatus` |
| Constants | ALL_CAPS | `SECRET_KEY`, `DEFAULT_WEIGHTS`, `MAX_FILE_SIZE` |
| DB tables | plural snake_case | `users`, `user_swipes`, `parsed_documents` |
| API prefixes | plural lowercase | `/auth`, `/users`, `/opportunities`, `/swipes` |

### 3.3 API Endpoint Patterns

**Router setup:**
```python
router = APIRouter(prefix="/resource", tags=["resource"])
```

**Endpoint signature pattern:**
```python
@router.get("/{id}", response_model=ResourceResponse)
def get_resource(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resource = db.query(Resource).filter(Resource.id == id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    return resource
```

**Rules:**
- Always specify `response_model` on endpoints
- Use `Depends(get_current_user)` for authenticated endpoints
- Use `Depends(get_db)` for database access
- Pagination: `page: int = Query(1, ge=1)`, `per_page: int = Query(20, ge=1, le=100)`
- Search: `search: Optional[str] = Query(None)`
- List responses use wrapper schemas: `{ total, page, per_page, items: [...] }`

**HTTP status codes:**
| Code | Usage |
|------|-------|
| 200 | Successful GET/PUT |
| 201 | Successful POST (resource created) — not currently used, 200 is fine |
| 400 | Validation errors, duplicate records |
| 401 | Missing or invalid JWT token |
| 403 | Authenticated but unauthorized (wrong user, not admin) |
| 404 | Resource not found |
| 429 | Rate limit exceeded (e.g., daily swipe limit) |

### 3.4 Database Patterns

**Model definition:**
```python
class MyModel(Base):
    __tablename__ = "my_models"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    data = Column(JSON, default=list)           # Flexible arrays/dicts
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", backref="my_models")

    __table_args__ = (
        UniqueConstraint('user_id', 'external_id', name='uq_user_external'),
    )
```

**Rules:**
- Always include `id`, `created_at`, `updated_at` columns
- Use `JSON` columns (SQLite-compatible) for flexible arrays like skills, work_experiences
- Index foreign keys and frequently queried columns
- Use `UniqueConstraint` in `__table_args__` for composite uniqueness
- Handle `IntegrityError` with rollback:
  ```python
  try:
      db.add(record)
      db.commit()
  except IntegrityError:
      db.rollback()
      raise HTTPException(status_code=400, detail="Already exists")
  ```

**Session management:**
```python
# Defined in security.py, used everywhere via Depends(get_db)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**Query patterns:**
- Filter: `db.query(Model).filter(Model.field == value)`
- OR: `filter(or_(Model.title.ilike(q), Model.description.ilike(q)))`
- NOT IN: `filter(Model.id.not_in(subquery))`
- Count: `db.query(func.count(Model.id)).filter(...).scalar()`
- Pagination: `.offset(skip).limit(limit)`

### 3.5 Schema Patterns (Pydantic v2)

```python
# Request — required fields
class ResourceCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr

# Update — all fields optional
class ResourceUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None

# Response — includes computed fields
class ResourceResponse(BaseModel):
    id: int
    name: str
    created_at: datetime

    class Config:
        from_attributes = True    # enables ORM → Pydantic conversion

# Enum — always inherit (str, Enum) for JSON serialization
class SwipeAction(str, Enum):
    LIKE = "like"
    DISLIKE = "dislike"
    SAVE = "save"
```

**Rules:**
- Separate Create / Update / Response schemas per domain
- Use `Field(...)` for required fields with constraints
- Use `Optional[T] = None` for all update fields
- Use `from_attributes = True` (Pydantic v2) not `orm_mode` (v1)
- Conversion: `payload.model_dump(exclude_unset=True)` for partial updates
- Nested schemas: define sub-schemas (e.g., `WorkExperience`) and use `List[WorkExperience]`

### 3.6 Service Layer

- Services live in `app/services/`
- Encapsulate business logic that is reusable across endpoints
- Accept data dicts (not ORM model instances) as input
- Use singleton pattern for stateful services:
  ```python
  _service = None
  def get_service() -> MyService:
      global _service
      if _service is None:
          _service = MyService()
      return _service
  ```
- Use adapter pattern for external integrations (`job_adapters/base.py` → concrete adapters)
- Use `@dataclass` for structured return types (e.g., `MatchResult`)

### 3.7 Auth & Security

- **JWT** via `OAuth2PasswordBearer(tokenUrl="/auth/login")`
- **Password hashing:** `CryptContext(schemes=["pbkdf2_sha256"])`
- **Token expiry:** 15 minutes (`ACCESS_TOKEN_EXPIRE_MINUTES`)
- **Token payload:** `{"sub": str(user_id), "exp": expiry_datetime}`

**Auth dependencies (all in `security.py`):**
| Dependency | Purpose |
|-----------|---------|
| `get_current_user` | Decode JWT, return User or raise 401 |
| `require_user` | Alias for get_current_user |
| `require_admin` | Check `is_admin` flag, raise 403 if not |
| `require_same_user` | Check `current_user.id == user_id`, raise 403 if not |

**Rules:**
- Never hardcode `SECRET_KEY` — use `os.getenv("SECRET_KEY", fallback)` for dev only
- Always validate `is_active` on the user after token decode
- Login endpoint uses `OAuth2PasswordRequestForm` (form data, not JSON)
- Return `{"access_token": token, "token_type": "bearer"}` from login/signup

### 3.8 Error Handling

```python
# Standard pattern
raise HTTPException(status_code=404, detail="Opportunity not found")

# With headers (auth)
raise HTTPException(
    status_code=401,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)
```

**Rules:**
- Use `HTTPException` for all client-facing errors
- Always include a human-readable `detail` message
- Use `logging.getLogger(__name__)` for server-side logging
- Implement graceful degradation: if AI matching fails, fall back to basic scoring
- Catch `IntegrityError` explicitly for constraint violations
- Don't catch broad `Exception` silently — log it first

### 3.9 Testing

- Framework: `pytest` with `FastAPI TestClient`
- Test files in `app/tests/`
- Fixtures: `setup_db` (recreate tables per test), `client` (TestClient instance)
- Helper functions for test data setup (e.g., `create_user(email, password)`)
- Pattern: arrange (create data) → act (call endpoint) → assert (check response)
- Test both success and error paths (401, 403, 404, 400)

---

## 4. Frontend Rules — mobile-app (React / JavaScript)

### 4.1 Tech Stack
- React 18 + JavaScript (JSX)
- Vite (build tool)
- Supabase (authentication backend — OAuth, email/password)
- Fetch API (HTTP client, wrapped in `services/api.js`)
- Context API (`AuthContext`) for global auth state
- `useState` for local component state
- Tailwind CSS v4 via `@tailwindcss/vite` plugin
- Framer Motion for animations
- react-tinder-card for swipe gestures
- Lucide React for icons

### 4.2 File Organization

```
mobile-app/src/
├── pages/              # One file per route (Feed, Profile, Login, Signup, etc.)
├── components/
│   ├── ui/             # Design system primitives (Button, Card, Skeleton, Toast)
│   ├── OpportunityCard.jsx
│   ├── BottomNav.jsx
│   ├── ErrorBoundary.jsx
│   └── ProtectedRoute.jsx
├── context/
│   └── AuthContext.jsx # Global auth state (user, profile, login/logout)
├── services/
│   ├── api.js          # Fetch wrapper, domain-organized exports
│   └── errorLogger.js  # Centralized error logging with levels/categories
├── lib/
│   └── supabase.js     # Supabase client initialization
├── styles/             # CSS token files (tokens.css, theme.css, etc.)
├── App.jsx             # Router setup
├── main.jsx            # App mount point
└── index.css           # Tailwind imports + custom animations
```

### 4.3 Component Patterns

- **Functional components only** — no class components
- **Hooks:** `useState`, `useEffect`, `useAuth()` (custom from AuthContext)
- **`forwardRef`** for components that need ref access (e.g., swipe cards)
- **`ErrorBoundary`** wraps the entire app at the top level
- **`ProtectedRoute`** checks `isAuthenticated` from `useAuth()`
- **Props:** destructure in function signature

### 4.4 Styling Rules

- Tailwind utility classes as the primary styling method
- CSS custom properties defined in `src/styles/tokens.css` for design tokens
- Mobile-first: `#root` is constrained to `max-width: 480px`
- Animations via Framer Motion (entry/exit transitions on cards)
- Icons via Lucide React (consistent sizing)
- Import order in `index.css`:
  ```css
  @import "tailwindcss";
  @import "./styles/tokens.css";
  @import "./styles/theme.css";
  @import "./styles/auth.css";
  @import "./styles/components.css";
  ```

### 4.5 API & Auth

- Token stored in `localStorage` as `"tender_token"`
- API module (`services/api.js`) exports domain objects: `auth`, `feed`, `swipes`, `applications`, `preferences`
- Auth headers injected manually per request
- Error logging via `errorLogger.js` with levels (`INFO`, `WARNING`, `ERROR`, `CRITICAL`) and categories (`AUTH`, `API`, `NETWORK`, `UI`)
- Retry logic: 3 retries with exponential backoff for Supabase abort errors in Feed

---

## 5. Frontend Rules — tender-frontend (React / TypeScript)

### 5.1 Tech Stack
- React 19 + TypeScript (TSX)
- Vite (build tool)
- Zustand (state management — no Context API)
- Axios (HTTP client with interceptors)
- Direct FastAPI JWT auth (no Supabase)
- Tailwind CSS v4 via PostCSS
- Lucide React for icons
- Fonts: Inter (sans), Outfit (display)

### 5.2 File Organization

```
tender-frontend/src/
├── pages/              # One file per route
├── components/
│   ├── layout/         # AppLayout, BottomNav, ProtectedRoute
│   ├── swipe/          # SwipeCard, SwipeDeck, SwipeActions
│   ├── recruiter/      # Recruiter dashboard components
│   ├── profile/        # ParsedDataReview, etc.
│   └── common/         # Shared UI (Spinner, etc.)
├── stores/             # Zustand stores (one per domain)
│   ├── index.ts        # Re-exports all stores
│   ├── authStore.ts
│   ├── feedStore.ts
│   └── ...
├── api/                # Axios modules (one per domain)
│   ├── client.ts       # Axios instance + interceptors
│   ├── auth.ts
│   ├── feed.ts
│   └── ...
├── types/              # TypeScript interfaces (one per domain)
│   ├── index.ts
│   ├── user.ts
│   ├── opportunity.ts
│   └── ...
├── config/             # App configuration
├── lib/                # Utility functions
├── tests/              # Unit tests for stores
├── App.tsx
├── main.tsx
└── index.css           # Tailwind + custom utilities
```

### 5.3 Component Patterns

- **Functional components, fully typed:**
  ```typescript
  interface MyComponentProps {
    title: string;
    onAction: () => void;
  }

  export function MyComponent({ title, onAction }: MyComponentProps) {
    // ...
  }
  ```
- **Zustand selectors** for state access (not Context hooks)
- **Composition over inheritance** — build complex UI from small composable pieces

### 5.4 Styling Rules

- Tailwind utility classes as primary styling method
- Theme extended in `tailwind.config.js`:
  - Primary color: Emerald green (`#059669` base)
  - Custom shadows: `shadow-glass`, `shadow-float`
  - Custom animations: `float`, `pulse-slow`
- Touch-friendly utilities for mobile: `touch-pan-y`, `no-select`
- Responsive: mobile-first with `md:` breakpoint for desktop

### 5.5 API & Auth

- Axios instance in `src/api/client.ts` with:
  - **Request interceptor:** auto-injects `Authorization: Bearer {token}`
  - **Response interceptor:** catches 401 → clears token, redirects to login
- Token stored in `localStorage` as `"token"`
- Login sends `OAuth2PasswordRequestForm` (URL-encoded form data, not JSON)
- API URL from `VITE_API_URL` env var or defaults to `http://localhost:8000`
- Vite proxy rewrites `/api/*` → backend URL (strips `/api` prefix)

### 5.6 State Management (Zustand)

- One store per domain: `useAuthStore`, `useFeedStore`, `useApplicationsStore`, `useRecruiterStore`
- Store structure:
  ```typescript
  interface FeedStore {
    opportunities: Opportunity[];
    currentIndex: number;
    isLoading: boolean;
    error: string | null;
    fetchFeed: () => Promise<void>;
    swipe: (action: string) => Promise<void>;
  }
  ```
- Async actions use try-catch with store-level error state
- `initialize()` action on auth store checks localStorage on app load

### 5.7 TypeScript Rules

- Define interfaces for all props, API responses, and store state
- Types live in `src/types/` organized by domain
- Use `interface` for object shapes, `type` for unions/computed types
- Export all types from `src/types/index.ts` barrel file

---

## 6. UI/UX Guidelines

### Visual Standards
- **No default purple gradients** unless brand-approved
- **No sparkles/emojis** in hero headings or section titles
- **Consistent type scale** with defined line-height; avoid oversized headings with thin body text
- **Consistent weight hierarchy** — don't mix too many font weights

### Component Standards
- **2–3 border-radius values max** across the app (e.g., `rounded-lg`, `rounded-2xl`, `rounded-full`)
- **Subtle hovers** — 2–4px lift max, no glowing/neon effects
- **Icons sized proportionally** — don't mix icon sizes in the same context
- **Remove non-functional elements** — no placeholder social icons or fake testimonials

### Loading & Feedback
- **Loading states for all async actions** — use Skeleton components for heavy data, spinners for buttons
- **Progress indicators on buttons** when an action is in-flight
- **Toast notifications** for success/error feedback

### Animations
- **Purposeful only** — every animation should serve a UX goal (guide attention, confirm action)
- **Easing curves:** use `cubic-bezier` curves, no linear transitions
- **Intentional staggering** for lists/cards

### Copy & Content
- **Avoid vague slogans** and overused em-dashes
- **No fake testimonials** or generic AI-generated faces as placeholders
- **Clear, specific microcopy** — button labels, empty states, error messages

### Design System
- **Create/use the design system first** — every spacing, color, radius, weight, and animation should reference shared tokens
- mobile-app: CSS custom properties in `src/styles/tokens.css`
- tender-frontend: Tailwind theme extension in `tailwind.config.js`

---

## 7. Git Workflow

- **Feature branches** for non-trivial changes (branch from `main`)
- **PRs merged to `main`** — no direct commits to main for multi-file changes
- **Commit messages:** concise, describe what changed and why
- **Reference TDR-XXX codes** in commits when applicable (e.g., `TDR-004: Add swipe status field`)
- **Never commit:** `.env`, credentials, API keys, `uploads/` directory contents, `node_modules/`, `__pycache__/`
- **Don't force push** to `main`

---

## 8. Configuration & Environment

### Backend
- Environment variables via `os.getenv("KEY", "default")` — defaults are for dev only
- `.env` file loaded by `python-dotenv` in `main.py`
- File upload settings in `app/config.py` (paths, size limits, allowed extensions)
- Upload directories auto-created on import via `ensure_upload_dirs()`

### Frontend (both apps)
- Environment variables via `VITE_` prefix (e.g., `VITE_API_URL`)
- Vite dev server proxies `/api/*` to backend (configured in `vite.config.js` / `vite.config.ts`)
- Backend default: `http://localhost:8000` (FastAPI) or `http://127.0.0.1:8000`

### Key Environment Variables
| Variable | Where | Purpose |
|----------|-------|---------|
| `SECRET_KEY` | Backend | JWT signing key |
| `VITE_API_URL` | Frontend | Backend API base URL |
| `VITE_SUPABASE_URL` | mobile-app | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | mobile-app | Supabase anonymous key |

---

## 9. Cross-Cutting Concerns

### Two Frontend Apps
This project has **two separate frontend codebases**:
- **`mobile-app/`** — JavaScript, Supabase auth, Context API, Fetch
- **`tender-frontend/`** — TypeScript, JWT auth, Zustand, Axios

When implementing a feature, check whether it needs to be built in one or both. They share the same backend but have different auth flows and state management.

### Routing (both apps)
| Route | Purpose | Auth Required |
|-------|---------|--------------|
| `/login` | Authentication | No |
| `/signup` | Registration | No |
| `/feed` | Swipe interface (main screen) | Yes |
| `/applications` | Application list | Yes |
| `/saved` | Saved opportunities | Yes |
| `/profile` | User profile | Yes |
| `/preferences` | User preferences | Yes |
| `/upload` | Document upload (tender-frontend only) | Yes |
| `/recruiter` | Recruiter dashboard (tender-frontend only) | Yes |

### File References
| File | What It Contains |
|------|-----------------|
| `CLAUDE.md` | Project overview, backlog (TDR-XXX), tech patterns |
| `PRD.md` | Detailed product requirements, milestones 1–6 |
| `SRS.md` | Software requirements specification |
| `SRS-Architecture.md` | System architecture, data models, API design |
| `progress.txt` | Live progress tracker — read before starting, update when done |
| `WORK_LOG.md` | Session-by-session development history |
