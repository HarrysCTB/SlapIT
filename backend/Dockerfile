# Utilise une image Python officielle (ici la version 3.10-slim)
FROM python:3.10-slim

# Définit le répertoire de travail
WORKDIR /app

# Copie le fichier requirements.txt et installe les dépendances
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copie l'ensemble du code de l'application dans le conteneur
COPY . .

# Expose le port 8000 (port par défaut de uvicorn)
EXPOSE 8000

# Démarre l'application avec uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "4200"]