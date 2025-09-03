from typing import Optional
from pydantic import BaseModel, ConfigDict

class ProfileCreate(BaseModel):
    auth_id: str
    username: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None

class ProfileUpdate(BaseModel):
    # autoriser des champs partiels et ignorer les champs en trop (ex: auth_id envoyé par le client)
    model_config = ConfigDict(extra='ignore')
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None

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