from pydantic import BaseModel
import uuid

class ProfileCreate(BaseModel):
    auth_id: uuid.UUID
    username: str
    avatar_url: str | None = None
    bio: str | None = None