from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import communities
from app.api import users
from app.api import stickers
import datetime

app = FastAPI(title="SlapIt API", version="1.0.0")

# 📌 Configuration CORS avec ALLOWED_ORIGINS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(communities.router, prefix="/communities", tags=["Communities"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(stickers.router, prefix="/stickers", tags=["Stickers"])

@app.get("/")
def root():
    return {"message": "Bienvenue sur l'API SlapIt 🚀"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.datetime.now().isoformat(),
        "version": "1.0.0"
    }