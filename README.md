# Serge Service Immobilier

Application composée de deux parties :

| Partie | Techno | Dossier | Port |
| --- | --- | --- | --- |
| Frontend | React + Vite | `src/` | 5173 |
| Backend | Spring Boot + PostgreSQL | `backend/` | 8080 |

> Le backend n'est **pas** celui de Base44 : c'est un serveur Java autonome. `base44 dev`
> ne le lance pas — utilisez les commandes ci-dessous.

## Prérequis

- Node.js 20+ et npm
- Java 21 et Maven
- Docker Desktop (pour la base PostgreSQL)

## Lancer le projet

Guide complet (local, serveur, domaine, HTTPS, sauvegardes, SEO) : **[DEPLOIEMENT.md](DEPLOIEMENT.md)**.

### Version la plus simple — tout sur un seul port

Le backend sert le site, l'API et les photos : une fois le site compilé, il n'y a
plus qu'un seul serveur à lancer.

```bash
docker compose up -d                    # PostgreSQL (port 5433)
npm install && npm run build            # compile le site
rm -rf backend/frontend && cp -R dist backend/frontend
cd backend && mvn spring-boot:run       # site + API sur http://localhost:8080
```

- Site : http://localhost:8080
- **Administration : http://localhost:8080/admin**
- Photos : servies sous `/uploads/…`
- SEO : `/sitemap.xml` et `/robots.txt`

### Développement avec rechargement à chaud

```bash
docker compose up -d                    # PostgreSQL
cd backend && mvn spring-boot:run       # backend sur :8080
npm run dev                             # frontend sur :5173
```

Connexion admin : `ADMIN_EMAIL` / `ADMIN_PASSWORD` de `backend/.env`
(valeurs par défaut : `admin@serge-immobilier.com` / `changez-ce-mot-de-passe`).
Le compte est créé au premier démarrage uniquement.

## API

| Méthode | Route | Accès |
| --- | --- | --- |
| `GET` | `/api/properties` | public |
| `GET` | `/api/properties/{slug}` | public |
| `POST` | `/api/properties` | admin (JWT) |
| `PUT` | `/api/properties/{id}` | admin (JWT) |
| `DELETE` | `/api/properties/{id}` | admin (JWT) |
| `POST` | `/api/auth/login` | public |
| `POST` | `/api/auth/register` | public |
| `POST` | `/api/auth/password-reset-request` | public |
| `POST` | `/api/auth/password-reset` | public |
| `POST` | `/api/uploads` | admin (JWT) |
| `GET` | `/uploads/{fichier}` | public |
| `GET` | `/api/auth/me` | connecté |

### Photos

L'upload est géré par le backend : la photo est écrite dans `backend/uploads/` (10 Mo max,
JPEG/PNG/WEBP/GIF) et servie sous `/uploads/<fichier>`.

### Base de données

Le schéma est versionné par **Flyway** (`backend/src/main/resources/db/migration/`).
`ddl-auto: validate` : Hibernate vérifie le schéma mais ne le modifie pas. Pour une nouvelle
migration, ajoutez `V2__ma_modification.sql` — elle sera appliquée au démarrage.

### Mot de passe oublié

Renseignez `SMTP_*` pour un envoi réel. Sans SMTP, le lien est renvoyé dans `devResetUrl`
et affiché dans la page — uniquement si `MAIL_EXPOSE_RESET_LINK=true` (développement).

## Vérifications

```bash
npm run lint            # frontend
npm run typecheck       # frontend (types JSDoc)
cd backend && mvn test  # backend (nécessite Docker : PostgreSQL éphémère)
```

## Liens Base44

- Agent skills : https://docs.base44.com/developers/backend/overview/skills.md
- Support : https://app.base44.com/support
