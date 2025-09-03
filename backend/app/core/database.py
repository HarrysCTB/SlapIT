# app/core/database.py
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
TESTING = os.getenv("TESTING") == "1"

_supabase: Client | None = None

if not TESTING:
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("❌ Erreur : Les variables SUPABASE_URL et SUPABASE_KEY ne sont pas définies !")
    _supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_db() -> Client:
    """
    Renvoie le client Supabase. En mode TESTING, on NE doit pas appeler ce getter :
    les tests doivent override cette dépendance avec un client factice.
    """
    if TESTING:
        # Sécurité: si un test oublie d’override, on échoue explicitement.
        raise RuntimeError("get_db() appelé en mode TESTING. Mocke cette dépendance via app.dependency_overrides.")
    assert _supabase is not None, "Client Supabase non initialisé"
    return _supabase