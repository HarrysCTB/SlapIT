from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from uuid import UUID, uuid4
from app.core.database import get_db
from postgrest.exceptions import APIError
from supabase import Client
from app.models.sticker import StickerCreate
from app.schemas.sticker import StickerResponse

router = APIRouter()

@router.post("/", response_model=StickerResponse)
def add_sticker(sticker: StickerCreate, supabase = Depends(get_db)):
    # Normalisation/validation rapide
    community_id = str(sticker.community_id) if isinstance(sticker.community_id, UUID) else str(sticker.community_id or "")
    auth_id      = str(sticker.auth_id)      if isinstance(sticker.auth_id, UUID)      else str(sticker.auth_id or "")

    if not community_id:
        raise HTTPException(status_code=400, detail="community_id is required")
    if not auth_id:
        raise HTTPException(status_code=400, detail="auth_id is required")

    new_id = str(uuid4())
    data = {
        "id": new_id,
        "community_id": community_id,
        "title": sticker.title.strip(),
        "description": (sticker.description or "").strip(),
        "image_url": str(sticker.image_url),
        "long": float(sticker.long),
        "lat": float(sticker.lat),
        "auth_id": auth_id,
    }

    try:
        supabase.table("stickers").insert(data).execute()  # ✅ pas de .select() ici
    except APIError as e:
        # souvent FK cassée (auth_id/communauté inexistante) ou UUID invalide
        raise HTTPException(status_code=400, detail=e.message or "Insert failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # ✅ 200 pour KrakenD
    return JSONResponse(status_code=200, content={"ok": True, "id": new_id})

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