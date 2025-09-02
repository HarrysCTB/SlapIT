from fastapi import APIRouter, HTTPException, Depends
from uuid import UUID
from app.core.database import get_db
from postgrest.exceptions import APIError
from supabase import Client
from app.models.sticker import StickerCreate
from app.schemas.sticker import StickerResponse
import uuid

router = APIRouter()

@router.post("/", response_model=StickerResponse)
def add_sticker(sticker: StickerCreate, supabase = Depends(get_db)):
    # Normalisation
    community_id_str = str(sticker.community_id) if isinstance(sticker.community_id, UUID) else None
    if community_id_str is None:
        # si tu le veux obligatoire :
        raise HTTPException(status_code=400, detail="community_id is required")

    data = {
        "id": str(uuid.uuid4()),
        "community_id": community_id_str,
        "title": sticker.title.strip(),
        "description": (sticker.description or "").strip(),
        "image_url": str(sticker.image_url),
        "long": float(sticker.long),
        "lat": float(sticker.lat),
        "auth_id": str(sticker.auth_id),
    }

    try:
        supabase.table("stickers").insert(data).execute()
    except APIError as e:
        # Remonter une erreur propre (ex: uuid invalide)
        raise HTTPException(status_code=400, detail=e.message or "Insert failed")

    return {
        "id": data["id"],
        **{k: data[k] for k in ("community_id","title","description","image_url","long","lat","auth_id")}
    }

@router.get("/{sticker_id}", response_model=StickerResponse)
def get_sticker(sticker_id: str, supabase: Client = Depends(get_db)):
    """
    Récupère un sticker par son identifiant
    """
    response = supabase.table("stickers").select("*").eq("id", sticker_id).execute()
    if not response.data or len(response.data) == 0:
        raise HTTPException(status_code=404, detail="Sticker not found")

    # response.data est une liste, on prend le premier élément
    return StickerResponse(**response.data[0])

@router.delete("/{sticker_id}")
def delete_sticker(sticker_id: str, supabase: Client = Depends(get_db)):
    """
    Supprime un sticker par son identifiant
    """
    response = supabase.table("stickers").delete().eq("id", sticker_id).execute()
    if not response.data:
        raise HTTPException(status_code=response.status_code, detail=str(response.data))
    return {"message": "Sticker deleted successfully"}