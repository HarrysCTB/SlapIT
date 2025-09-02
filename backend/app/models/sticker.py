from pydantic import BaseModel, field_validator
from typing import Optional
from uuid import UUID

class StickerCreate(BaseModel):
    community_id: UUID
    title: str
    description: Optional[str] = ""
    image_url: str
    long: float
    lat: float
    auth_id: UUID

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        v = (v or "").strip()
        if not v:
            raise ValueError("title is required")
        return v