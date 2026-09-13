# Rapport final — Compte administrateur weborax.dev@gmail.com + Préparation/déploiement frontend Vercel

## 1. Système d'authentification existant (réutilisé, aucun nouveau mécanisme)
- **Stockage** : `users` (email unique, `password_hash` PBKDF2 `iterations:sel:hash` via `PasswordUtil`, `role` enum `STUDENT/PROFESSOR/ADMIN`, `enabled`).
- **Sessions** : `user_sessions` — token aléatoire 32 octets (URL-safe base64), validité 7 j, stocké en base (pas de JWT signé).
- **Vérification du rôle côté serveur** : `AuthFilter` (Bearer token → `CurrentUserHolder`) puis chaque ressource contrôle le rôle — `AdminResource.requireAdmin()` = `user.getRole() == Role.ADMIN`, sinon `ForbiddenException` (403). Les routes admin (`/admin/*`) sont **protégées côté backend** ; le frontend ne fait que masquer/afficher le menu (Header « Administration » + `ProtectedRoute roles={['ADMIN']}`).

## 2. Admin
- **Email configuré** : `weborax.dev@gmail.com` (id=1, compte seed fusionné — l'ancien `admin@coursconnect.fr` a été remappé vers cet email puis le doublon temporaire créé par le bootstrap a été supprimé → un seul compte ADMIN).
- **Rôle confirmé côté backend** : `role = ADMIN`, `enabled = true` (vérifié en base et via `POST /auth/login` → `role=ADMIN`).
- **Méthode de création/config (sécurisée, sans password hardcodé)** : nouveau `AdminBootstrap` (`@Startup @Singleton` EJB auto-découvert) qui lit les variables d'environnement **`ADMIN_EMAIL`** + **`ADMIN_PASSWORD`** (docker-compose `wildfly.environment` ← `.env` racine gitignoré) :
  - **idempotent** à chaque démarrage : recherche par email → crée si absent (uniquement si `ADMIN_PASSWORD` est fourni, sinon skip), sinon garantit `role=ADMIN` + `enabled`, et ré-applique le hash si `ADMIN_PASSWORD` est fournie.
  - `seed-data.sql` ne crée **plus d'admin par défaut** (l'admin `admin@coursconnect.fr` à mot de passe connu a été retiré) → aucune backdoor confidence dans les environnements frais.
- **Normalisation email** : `trim` + `lowercase` au fork des DTO (`setEmail`) + `AuthService.normalizeEmail` + bootstrap. Vérifié : login `"  WEBORAX.DEV@GMAIL.COM "` → **200**.
- **Sécurité** : aucun secret dans Git (`.env` ignoré, vérifié `git check-ignore .env`), aucun secret dans `VITE_*`, aucun `ADMIN_PASSWORD = "..."` dans le code.

## 3. Bug corrigé au passage (logout)
- `UserRepository.invalidateSession/invalidateAllSessions` utilisaient `em.createQuery("DELETE ...", UserSession.class)` → Hibernate 6 lance `IllegalQueryOperationException` (« Result type given for a non-SELECT Query ») → **logout 500** et session jamais invalidée. Correctif : `createQuery(...)` **sans type de résultat**. Vérifié : logout → 200 puis `GET /auth/me` avec le même token → **401**.

## 4. Tests admin (vérifiés en réel)
1. Login `weborax.dev@gmail.com` → 200, rôle ADMIN, session créée.
2. `/admin/stats`, `/admin/users`, `/admin/bookings`, `/admin/professors` (token admin) → 200.
3. `/admin/stats` sans token → **401**.
4. `/admin/stats` token étudiant (`omar.student@gmail.com`) → **403**.
5. Logout → 200 + token ensuite refusé (401).
6. Refresh de page : session conservée (token+user en localStorage `cc_token`/`cc_user`, réutilisé par `AuthContext`) — comportement existant inchangé.
7. Login email non normalisé → 200 (normalisé backend).

## 5. Frontend — build
- `npm run build` OK (Vite 5.4.21, **83 modules**, JS 348.73 kB / CSS 76.16 kB, gzip 95.98 / 13.59 kB) ; `tsc --noEmit` propre (ajout de `src/vite-env.d.ts` = types `vite/client` pour `import.meta.env`).
- Dev server Vite (5173) toujours OK : login + `/admin/stats` via proxy → 200.

## 6. Frontend — Vercel
- **Root Directory** : `frontend` ; **Build Command** : `npm run build` ; **Output Directory** : `dist` (lockfile `package-lock.json` conservé → `npm ci`/`npm install` conforme).
- `frontend/vercel.json` : rewrite SPA `/((?!api/|assets/|vite.svg).*)` → `/index.html` → les routes directes (`/recherche`, `/professeur/123`, `/student/reservations/:id`, `/professor/*`, `/admin`) ne retournent plus de 404 Vercel. **Pas de rewrite `/api`** : l'URL du backend production n'est pas inventée.
- Le frontend n'appelle **jamais** `localhost` en prod : `api.ts` utilise **`VITE_API_URL`** (fallback `'/api'` pour le dev/proxy), et le logout `AuthContext` passe aussi par `getApiBase()`.

## 7. Environment variables
| Variable | Côté | Public ? | Usage |
|---|---|---|---|
| `VITE_API_URL` | Frontend (Vercel) | OUI (exposée navigateur) | URL HTTPS du backend API (ex. `https://api.mondomaine.ma/api`) |
| `ADMIN_EMAIL` | Backend (WildFly) | NON | Email de l'admin provisionné par `AdminBootstrap` |
| `ADMIN_PASSWORD` | Backend (WildFly) | NON | Mot de passe admin (jamais en dur, jamais en `VITE_*`) |
| `CORS_ALLOWED_ORIGINS` | Backend (WildFly) | NON | Liste virgulée des origines autorisées (jamais `*` avec credentials) |

- Secrets (DATABASE_URL, JWT/SESSION secret, SMTP, etc.) : **restent côté backend**, absents de `VITE_*` et de Git.
- `.env.example` créés : `frontend/.env.example` (VITE_API_URL) + racine `.env.example` (ADMIN_EMAIL/ADMIN_PASSWORD/CORS_ALLOWED_ORIGINS). `.gitignore` : `.env.*` ignoré, `!.env.example` conservé (vérifié : `.env` ignoré, `.env.example` traçable).

## 8. Backend
- **URL API actuelle** (dev) : `http://localhost:8081/coursconnect-api/api` (WildFly 8081, contexte `/coursconnect-api`).
- **CORS** : nouveau `CorsConfig.resolveOrigin` — `CORS_ALLOWED_ORIGINS` multi-origines (liste virgulée), origine écho uniquement si autorisée ; `Access-Control-Allow-Credentials: true` ; méthodes/headers (Authorization, Content-Type) gérés ; OPTIONS → 204.
- **État du déploiement backend production : NON CONFIGURÉ** — c'est un service séparé (Java 21 / Jakarta EE 10 / WildFly / MySQL) qui doit avoir sa propre infrastructure de production. **Aucune URL production n'a été inventée.**

## 9. Déploiement
- **Frontend Vercel : PRÊT (non déployé)** — la préparation (vercel.json, VITE_API_URL, build) est terminée et vérifiée localement. Pour déployer réellement, il faut :
  1. **Token Vercel** (ou `vercel login`) — la CLI `vercel` n'est pas installée et `VERCEL_TOKEN` n'est pas défini sur la machine ;
  2. **URL HTTPS réelle du backend Java/Jakarta EE de production** → à mettre dans `VITE_API_URL` (Vercel → Settings → Environment Variables) et dans `CORS_ALLOWED_ORIGINS` du backend.
- Étapes : `cd frontend` → `vercel link` (ou import du dépôt GitHub, Root Directory `frontend`) → définir `VITE_API_URL` → `vercel deploy --prod`.
- Après déploiement, à tester depuis le vrai domaine : login admin/student/professor, routes directes SPA (pas de 404), aucun appel `localhost` dans le Network, CORS OK.

## 10. Fichiers modifiés / créés
- Backend : `config/CorsConfig.java` (créé), `config/CorsFilter.java`, `config/AuthFilter.java`, `service/AdminBootstrap.java` (créé), `service/AuthService.java`, `dto/{LoginDTO,RegisterStudentDTO,RegisterProfessorDTO}.java`, `repository/UserRepository.java` (fix logout).
- Infra : `docker-compose.yml` (env ADMIN_EMAIL/ADMIN_PASSWORD/CORS_ALLOWED_ORIGINS), `sql/seed-data.sql` (admin par défaut retiré), `.env` (local, gitignoré), `.env.example` (créé).
- Frontend : `services/api.ts` (VITE_API_URL + `getApiBase`), `contexts/AuthContext.tsx` (logout via base), `src/vite-env.d.ts` (créé), `vercel.json` (créé), `frontend/.env.example` (créé), `.gitignore`.

## 11. Points restants (infos utilisateur requises)
- **URL réelle du backend de production** (HTTPS) — pour `VITE_API_URL` et `CORS_ALLOWED_ORIGINS`.
- **Connexion/token Vercel** — pour lancer le déploiement réel.
- Backend production (WildFly/MySQL) : infrastructure à provisionner séparément (non couverte ici).
- Vérification visuelle navigateur (breakpoints) de la précédente tâche dashboard, toujours en attente.