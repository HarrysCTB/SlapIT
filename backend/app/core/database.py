import os
from supabase import create_client, Client
from dotenv import load_dotenv
import logging

# 📌 Charger les variables d’environnement depuis le fichier .env
load_dotenv()

# 📌 Récupérer la configuration Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# 📌 Vérifier que les variables sont bien définies
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("❌ Erreur : Les variables SUPABASE_URL et SUPABASE_KEY ne sont pas définies !")

# 📌 Créer une instance unique de Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# 📌 Fonction pour récupérer la connexion à Supabase
def get_db() -> Client:
    """
    Retourne une connexion à la base de données Supabase.
    """
    return supabase