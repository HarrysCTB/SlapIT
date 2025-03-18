from fastapi import APIRouter, HTTPException, Depends
import uuid
from app.core.database import get_db  # Fonction qui retourne l'instance Supabase (Client)
from supabase import Client
from app.models.sticker import StickerCreate
from app.schemas.sticker import StickerResponse

router = APIRouter()

@router.post("/", response_model=StickerResponse)
def add_sticker(sticker: StickerCreate, supabase: Client = Depends(get_db)):
    """
    Ajoute un nouveau sticker dans la table 'stickers'
    """
    data = {
    "id": str(uuid.uuid4()),           # Génère un UUID pour l'ID du sticker
    "community_id": sticker.community_id,
    "title": sticker.title,
    "description": sticker.description,
    "image_url": sticker.image_url,
    "long": sticker.long,
    "lat": sticker.lat,
    "auth_id": str(sticker.auth_id)
}
    
    response = supabase.table("stickers").insert(data).execute()
    # Vérification d'erreur : si l'insertion échoue, renvoyer une exception HTTP
    if not response.data:
        raise HTTPException(status_code=response.status_code, detail=str(response.data))
    
    return StickerResponse(**data)

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