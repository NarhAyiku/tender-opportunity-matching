import os
from fastapi import Header, HTTPException, status

ADMIN_API_KEY = os.getenv("ADMIN_API_KEY", "")
USER_API_KEY = os.getenv("USER_API_KEY", "")

def require_admin(x_api_key: str | None = Header(default=None, alias="X-API-Key")):
    if not ADMIN_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="ADMIN_API_KEY not set on server",
        )
    if x_api_key != ADMIN_API_KEY:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin API key")
    return True

def require_user(x_api_key: str | None = Header(default=None, alias="X-API-Key")):
    if not USER_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="USER_API_KEY not set on server",
        )
    if x_api_key != USER_API_KEY:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user API key")
    return True

def require_same_user(
    user_id: int,
    x_user_id: str | None = Header(default=None, alias="X-User-Id"),
):
    if x_user_id is None or not x_user_id.isdigit():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="X-User-Id header required")
    if int(x_user_id) != int(user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only access your own match results")
    return True
