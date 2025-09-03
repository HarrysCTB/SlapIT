from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from uuid import UUID
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.community import Community
from app.schemas.community import CommunityCreate, CommunityResponse
import uuid
from datetime import datetime, timezone
from supabase import Client
from typing import List
from postgrest import APIError
from fastapi.responses import JSONResponse

router = APIRouter()

class JoinRequest(BaseModel):
    user_id: UUID

@router.post("/", response_model=CommunityResponse)
def create_community(community: CommunityCreate, supabase: Client = Depends(get_db)):
    """
    Crée une communauté et met à jour :
    1. La table communities avec la nouvelle communauté
    2. La table user_communities pour le créateur
    3. La table profiles pour mettre à jour le community_id et is_admin du créateur
    """
    community_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc).isoformat()

    # Préparer les données pour la communauté
    data = {
        "id": community_id,
        "name": community.name,
        "description": community.description,
        "admin_id": str(community.admin_id),
        "created_at": created_at
    }

    # Insertion dans la table communities
    response = supabase.table("communities").insert(data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail=f"Erreur lors de la création de la communauté: {response}")

    # Insertion dans la table user_communities
    membership_data = {
        "user_id": str(community.admin_id),
        "community_id": community_id,
        "joined_at": created_at
    }
    mem_response = supabase.table("user_communities").insert(membership_data).execute()
    if not mem_response.data:
        raise HTTPException(status_code=400, detail="Communauté créée mais erreur lors de l'ajout du membre")

    # Mise à jour du profil de l'utilisateur avec le community_id et is_admin
    profile_response = supabase.table("profiles") \
        .update({
            "community_id": community_id,
            "is_admin": True
        }) \
        .eq("auth_id", str(community.admin_id)) \
        .execute()
    
    if not profile_response.data:
        raise HTTPException(
            status_code=400,
            detail="Erreur lors de la mise à jour du profil administrateur"
        )

    return CommunityResponse(**data)

@router.post("/{community_id}/join")
def join_community(
    community_id: UUID,
    req: JoinRequest,
    supabase: Client = Depends(get_db),
):
    """
    Permet à un utilisateur de rejoindre une communauté.
    - community_id : UUID dans le path
    - user_id : UUID dans le body JSON
    """
    user_id = str(req.user_id)
    community_id_str = str(community_id)

    data = {
        "user_id": user_id,
        "community_id": community_id_str,
        "joined_at": datetime.now(timezone.utc).isoformat(),
    }

    try:
        # 🔹 1. Ajout dans la table de relation
        supabase.table("user_communities").insert(data).execute()

        # 🔹 2. Update du profile pour stocker la communauté active
        supabase.table("profiles").update({"community_id": community_id_str}).eq("auth_id", user_id).execute()

    except APIError as e:
        raise HTTPException(status_code=400, detail=e.message or "Insert failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return JSONResponse(status_code=200, content={"ok": True, "community_id": community_id_str})

@router.delete("/{community_id}/quit")
def quit_community(community_id: str, user_id: str, supabase: Client = Depends(get_db)):
    """
    Permet à un utilisateur de quitter une communauté et met à jour son profil.
    1. Supprime l'entrée dans user_communities
    2. Met à jour le community_id du profil à null
    """
    # Supprime l'utilisateur de la communauté
    response = supabase.table("user_communities") \
        .delete() \
        .eq("community_id", community_id) \
        .eq("user_id", user_id) \
        .execute()
        
    if not response.data:
        raise HTTPException(
            status_code=response.status_code,
            detail="Erreur lors de la suppression de l'utilisateur de la communauté"
        )

    # Met à jour le profil de l'utilisateur (community_id à null)
    profile_response = supabase.table("profiles") \
        .update({"community_id": None}) \
        .eq("auth_id", str(user_id)) \
        .execute()

    if not profile_response.data:
        raise HTTPException(
            status_code=400,
            detail="L'utilisateur a quitté la communauté mais erreur lors de la mise à jour du profil"
        )

    return {"message": "Vous avez quitté la communauté avec succès"}

@router.delete("/{community_id}/kick")
def kick_user(community_id: str, admin_id: str, user_id: str, supabase: Client = Depends(get_db)):
    """
    Permet à l'administrateur d'une communauté d'expulser un utilisateur.
    1. Vérifie les droits de l'admin
    2. Supprime l'utilisateur de la communauté
    3. Met à jour le profil de l'utilisateur expulsé
    """
    # Vérifier que la communauté existe et récupérer l'admin
    community_response = supabase.table("communities").select("admin_id").eq("id", community_id).execute()
    if not community_response.data:
        raise HTTPException(status_code=404, detail="Communauté introuvable")

    community_admin = community_response.data[0]["admin_id"]
    if str(community_admin) != str(admin_id):
        raise HTTPException(status_code=403, detail="Seul l'administrateur peut expulser un utilisateur")

    # Supprimer la relation utilisateur/communauté
    response = supabase.table("user_communities") \
        .delete() \
        .eq("community_id", community_id) \
        .eq("user_id", user_id) \
        .execute()

    if not response.data:
        raise HTTPException(
            status_code=response.status_code,
            detail="Erreur lors de l'expulsion de l'utilisateur"
        )

    # Mettre à jour le profil de l'utilisateur expulsé
    profile_response = supabase.table("profiles") \
        .update({"community_id": None}) \
        .eq("auth_id", str(user_id)) \
        .execute()

    if not profile_response.data:
        raise HTTPException(
            status_code=400,
            detail="L'utilisateur a été expulsé mais erreur lors de la mise à jour de son profil"
        )

    return {"message": "L'utilisateur a été expulsé avec succès"}


@router.get("/{community_id}/users")
def get_users_from_community(community_id: str, supabase: Client = Depends(get_db)):
    """
    Récupère tous les profils des utilisateurs d'une communauté spécifique.
    Retourne une liste de profils.
    """
    try:
        # Vérifie si la communauté existe
        community_response = supabase.table("communities") \
            .select("id") \
            .eq("id", community_id) \
            .execute()

        if not community_response.data:
            raise HTTPException(status_code=404, detail="Communauté introuvable")

        # Récupère les profils des utilisateurs dans cette communauté
        users_response = supabase.table("profiles") \
            .select("*") \
            .eq("community_id", community_id) \
            .execute()

        return { "community_users": users_response.data }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur : {str(e)}")