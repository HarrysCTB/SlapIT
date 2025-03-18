from pydantic import BaseModel
import uuid

# 📌 Schéma pour créer une communauté
class CommunityCreate(BaseModel):
    name: str
    description: str | None = None
    admin_id: uuid.UUID

# 📌 Schéma de réponse pour une communauté
class CommunityResponse(CommunityCreate):
    id: uuid.UUID