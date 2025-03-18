from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.community import Community
from app.schemas.community import CommunityCreate, CommunityResponse
import uuid
from datetime import datetime, timezone
from supabase import Client

router = APIRouter()

@router.post("/", response_model=CommunityResponse)
def create_community(community: CommunityCreate, supabase: Client = Depends(get_db)):
    """
    Crée une communauté et l'inscrit dans la table communities.
    Ajoute également le créateur (admin) comme membre dans user_communities.
    """
    community_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc).isoformat()
    
    # Préparer les données pour la communauté
    data = {
        "id": community_id,  # Génération automatique de l'ID
        "name": community.name,
        "description": community.description,
        "admin_id": str(community.admin_id),
        "created_at": created_at
    }
    
    # Insertion dans la table communities
    response = supabase.table("communities").insert(data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail=f"Error creating community: {response}")
    
    # Insertion dans la table user_communities pour ajouter le créateur comme membre
    membership_data = {
        "user_id": str(community.admin_id),
        "community_id": community_id,
        "joined_at": created_at
    }
    mem_response = supabase.table("user_communities").insert(membership_data).execute()
    if not mem_response.data:
        raise HTTPException(status_code=400, detail=f"Community created but error adding user membership: {mem_response}")
    
    return CommunityResponse(**data)

@router.get("/{community_id}", response_model=CommunityResponse)
def get_community(community_id: str, supabase: Client = Depends(get_db)):
    """
    Récupère une communauté depuis Supabase.
    """
    response = supabase.table("communities").select("*").eq("id", community_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Communauté introuvable")
    # response.data renvoie une liste, on prend le premier élément
    community_data = response.data[0]
    return CommunityResponse(**community_data)

@router.post("/{community_id}/join")
def join_community(community_id: str, user_id: str, supabase: Client = Depends(get_db)):
    """
    Permet à un utilisateur de rejoindre une communauté.
    """
    data = {
        "user_id": user_id,
        "community_id": community_id,
        "joined_at": datetime.now(timezone.utc).isoformat()
    }
    response = supabase.table("user_communities").insert(data).execute()
    if not response.data:
        raise HTTPException(status_code=response.status_code, detail=str(response.data))
    return {"message": "User joined the community successfully"}

@router.delete("/{community_id}/quit")
def quit_community(community_id: str, user_id: str, supabase: Client = Depends(get_db)):
    """
    Permet à un utilisateur de quitter une communauté.
    """
    response = supabase.table("user_communities").delete().eq("community_id", community_id).eq("user_id", user_id).execute()
    if not response.data:
        raise HTTPException(status_code=response.status_code, detail=str(response.data))
    return {"message": "User left the community successfully"}

@router.delete("/{community_id}/kick")
def kick_user(community_id: str, admin_id: str, user_id: str, supabase: Client = Depends(get_db)):
    """
    Permet à l'administrateur d'une communauté d'expulser un utilisateur.
    """
    # Vérifier que la communauté existe et récupérer l'admin de la communauté
    community_response = supabase.table("communities").select("admin_id").eq("id", community_id).execute()
    if not community_response.data:
        raise HTTPException(status_code=404, detail="Community not found")

    community_admin = community_response.data[0]["admin_id"]
    if str(community_admin) != str(admin_id):
        raise HTTPException(status_code=403, detail="Only the admin can kick a user")

    # Supprimer la relation utilisateur/communauté
    response = supabase.table("user_communities").delete().eq("community_id", community_id).eq("user_id", user_id).execute()
    if not response.data:
        raise HTTPException(status_code=response.status_code, detail=str(response.data))
    return {"message": "User kicked from the community successfully"}