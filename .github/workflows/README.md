# ⚙️ GitHub Actions – CI/CD Pipeline

## 📌 Description

Ce repository contient un workflow GitHub Actions utilisé pour automatiser le build, le push et le déploiement des services de l’application Chatroom.

Le pipeline implémente une approche CI/CD DevSecOps basée sur Docker et un runner self-hosted.

## 🚀 Workflow principal

Le workflow est défini dans :
.github/workflows/main.yml

## 🔁 Déclenchement

Le pipeline se déclenche automatiquement lors d’un push sur la branche `main`.

```yaml
on:
  push:
    branches: ["main"]
```

## 🏗️ CI – Build & Push Docker Images

Étapes exécutées sur un runner GitHub (`ubuntu-latest`) :

- Checkout du repository
- Login Docker Hub
- Build des images Docker
- Push sur Docker Hub

Images générées :

- tspdevsecops/chatroom-auth:latest
- tspdevsecops/chatroom-file:latest
- tspdevsecops/chatroom-backend:latest
- tspdevsecops/chatroom-frontend:latest

## 🔐 Secrets GitHub requis

- DOCKERHUB_USERNAME
- DOCKERHUB_TOKEN

## 🚀 CD – Déploiement automatique

Le déploiement s’effectue sur un runner self-hosted :

Étapes :

- Checkout du repository
- Pull des images Docker
- Redémarrage des services

Commandes utilisées :

```bash
docker compose pull
docker compose up -d --remove-orphans
```

## 🧠 Architecture du pipeline

Push on main
      ↓
GitHub Actions (CI)
      ↓
Build Docker Images
      ↓
Push Docker Hub
      ↓
Self-hosted Runner (CD)
      ↓
Docker Compose Deploy

## ⚠️ Prérequis

- Runner self-hosted configuré
- Docker installé
- Docker Compose installé

## 📌 Objectif

Automatiser complètement le cycle CI/CD :
- Build des services
- Publication des images Docker
- Déploiement automatique sans intervention manuelle
- Pipeline DevSecOps simple et efficace
