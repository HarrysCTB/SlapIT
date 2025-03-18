from pydantic import BaseModel
import uuid
from datetime import datetime

class Community(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None = None
    admin_id: uuid.UUID
    created_at: datetime