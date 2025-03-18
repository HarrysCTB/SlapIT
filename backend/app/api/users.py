from fastapi import APIRouter, Depends
from app.schemas.user import ProfileResponse
from app.models.user import ProfileCreate
from supabase import Client
from app.core.database import get_db
from app.services.user_service import create_profile

router = APIRouter()

@router.post("/profiles", response_model=ProfileResponse)
def create_profile_route(profile: ProfileCreate, supabase: Client = Depends(get_db)):
    """
    Endpoint pour créer un profil utilisateur.
    """
    created_profile = create_profile(
        supabase,
        auth_id=profile.auth_id,
        username=profile.username,
        avatar_url=profile.avatar_url,
        bio=profile.bio
    )
    return created_profile