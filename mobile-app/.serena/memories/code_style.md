# Code Style & Conventions

## Python (Backend)

### General
- Use type hints for function parameters and return types
- Use Pydantic models for request/response validation
- Follow PEP 8 naming conventions
- snake_case for variables, functions, modules
- PascalCase for classes

### FastAPI Patterns
```python
# Route handler with dependencies
@router.get("/items/{id}")
def get_item(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ...
```

### SQLAlchemy Models
- Models inherit from Base
- Use relationship() for foreign keys
- Store complex data as JSON columns

## JavaScript/React (Frontend)

### General
- Use functional components with hooks
- Use JSX (not TSX in mobile-app)
- File names: PascalCase for components, camelCase for utilities

### Component Structure
```jsx
// Component file structure
import React from 'react'
import { dependency } from 'package'
import { localDep } from '../local'

export function ComponentName({ props }) {
  // Hooks first
  const [state, setState] = useState()
  
  // Effects
  useEffect(() => {}, [])
  
  // Handlers
  const handleClick = () => {}
  
  // Render
  return (
    <div>...</div>
  )
}

export default ComponentName
```

### Styling
- Use Tailwind CSS utility classes
- CSS variables for design tokens (in theme.css)
- clsx for conditional classes

### API Calls
- Use the api.js service module
- Handle errors with try/catch
- Store auth token in localStorage
