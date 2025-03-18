from fastapi import HTTPException
from supabase import Client
from datetime import datetime, timezone

def create_profile(supabase: Client, auth_id: str, username: str, avatar_url: str = None, bio: str = None):
    data = {
        "auth_id": str(auth_id),
        "username": username,
        "avatar_url": avatar_url,
        "bio": bio,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "last_login": None,
        "community_id": None,
        "is_admin": False,
        "total_stickers": 0,
        "score": 0
    }
    response = supabase.table("profiles").insert(data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail=f"Erreur lors de la création du profil: {response}")
    return response.data[0]