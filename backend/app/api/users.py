from fastapi import APIRouter, Depends, HTTPException, Query
from app.schemas.user import ProfileResponse
from app.models.user import ProfileCreate
from supabase import Client
from app.core.database import get_db
from app.services.user_service import create_profile
from postgrest.exceptions import APIError
from uuid import UUID

router = APIRouter()

@router.post("/", response_model=ProfileResponse)
def create_profile(profile: ProfileCreate, supabase: Client = Depends(get_db)):
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

from fastapi import APIRouter, Depends, HTTPException
from typing import Optional


@router.get("/{auth_id}", response_model=ProfileResponse)
def get_profile(auth_id: str, supabase: Client = Depends(get_db)):
    """
    Endpoint pour récupérer les informations d'un profil utilisateur.

    Args:
        auth_id: L'identifiant d'authentification de l'utilisateur
        supabase: Instance du client Supabase

    Returns:
        ProfileResponse: Les informations du profil

    Raises:
        HTTPException: Si le profil n'est pas trouvé
    """
    try:
        response = supabase.table('profiles') \
            .select("*") \
            .eq('auth_id', auth_id) \
            .single() \
            .execute()

        if not response.data:
            raise HTTPException(
                status_code=404,
                detail=f"Profil non trouvé pour l'auth_id: {auth_id}"
            )
            
        return response.data
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la récupération du profil: {str(e)}"
        )

@router.put("/{auth_id}", response_model=ProfileResponse)
def update_profile(auth_id: str, profile: ProfileCreate, supabase: Client = Depends(get_db)):
    payload = {
        "username": profile.username,
        "avatar_url": profile.avatar_url,
        "bio": profile.bio,
    }
    res = supabase.table("profiles").update(payload).eq("auth_id", auth_id).execute()

    # si rien modifié, tenter de lire l’existant (ou renvoyer 404)
    if not res.data:
        existing = supabase.table("profiles").select("*").eq("auth_id", auth_id).single().execute()
        if not existing.data:
            raise HTTPException(status_code=404, detail="Profil introuvable")
        return existing.data

    return res.data[0]

@router.get("/{auth_id}/stickers")
def get_stickers_for_user(
    auth_id: UUID,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    supabase: Client = Depends(get_db)
):
    """
    Récupérer tous les stickers d'un utilisateur donné (auth_id).
    """
    try:
        query = (
            supabase
            .table("stickers")
            .select("*")
            .eq("auth_id", str(auth_id))
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
        )
        res = query.execute()
        return res.data or []

    except APIError as e:
        raise HTTPException(status_code=400, detail=e.message or "Query failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))