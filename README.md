# CoursConnect

Plateforme de mise en relation élèves et professeurs particuliers.

## Stack

- **Frontend** : React + TypeScript + Vite
- **Backend** : Java 21 + Jakarta EE + WildFly
- **Base de données** : MySQL 8.0

## Lancement

```bash
docker-compose up -d
mvn clean install
# Déployer le WAR dans WildFly
cd frontend
npm install
npm run dev
```

## API

Documentation OpenAPI disponible sur `/api/openapi/ui` une fois le serveur démarré.
