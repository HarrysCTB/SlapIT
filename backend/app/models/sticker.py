from pydantic import BaseModel
from typing import Optional
import uuid

class StickerCreate(BaseModel):
    community_id: str
    title: str
    description: Optional[str] = None
    image_url: str
    long: float
    lat: float
    auth_id: uuid.UUID
    