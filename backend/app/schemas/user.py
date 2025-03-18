from pydantic import BaseModel

class ProfileResponse(BaseModel):
    auth_id: str
    username: str
    avatar_url: str | None = None
    bio: str | None = None
    created_at: str
    last_login: str | None = None
    community_id: str | None = None
    is_admin: bool
    total_stickers: int
    score: int