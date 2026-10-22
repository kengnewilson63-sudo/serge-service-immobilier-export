# Déploiement — Serge Service Immobilier
## 0. Livraison sur Render (hébergement déjà en place)
Le service Render `serge-service-immobilier` construit l'image depuis le `Dockerfile`
et **redéploie automatiquement à chaque `git push` sur `main`** (`autoDeploy: true`).
Donc, pour livrer :
```bash
git add -A
git commit -m "Version de livraison"
git push origin main
```
Puis, sur https://dashboard.render.com → service `serge-service-immobilier` → **Events** :
attendre que le déploiement passe au vert (le 1er build prend ~10-15 min).
Vérifications une fois en ligne (remplacer l'adresse par celle du service) :
```bash
BASE=https://serge-service-immobilier.onrender.com
curl -i $BASE/actuator/health      # 200 {"status":"UP"}
curl -i $BASE/                    # 200 text/html (le site)
curl -i $BASE/sitemap.xml         # 200 application/xml
curl -i $BASE/api/properties      # 200 JSON (les annonces)
```
Puis ouvrir `$BASE` et `$BASE/admin` dans le navigateur :
- connexion avec `ADMIN_EMAIL` / `ADMIN_PASSWORD` (variables saisies dans Render) ;
- **Environnement** dans le tableau de bord Render :
  `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` (Neon), `ADMIN_PASSWORD`, `SETUP_CODE`
  doivent être renseignés (ce sont des secrets, `sync: false` dans `render.yaml`).
- `APP_PUBLIC_URL` est fourni automatiquement par Render (domaine du service).
> ⚠️ Plan gratuit : le service s'endort après ~15 min sans visite (le premier
> chargement peut prendre ~50 s) et le conteneur est recréé à chaque déploiement.
> Les photos envoyées depuis `/admin` sont donc perdues à chaque redéploiement
> (seule la base Neon garde les annonces). Pour un rendu définitif : plan payant
> + disque Render monté sur `/app/uploads`.
## 1. En local (développement)

| Ce que vous lancez | Commande | Adresse |
|---|---|---|
| Base PostgreSQL | `docker compose up -d` | `localhost:5433` |
| Backend (API + photos) | `cd backend && mvn spring-boot:run` | http://localhost:8080 |
| Frontend (rechargement à chaud) | `npm run dev` | http://localhost:5173 |

Espace admin : http://localhost:5173/admin

## 2. En local comme en production (un seul serveur)

Le backend Spring Boot sert **tout** : le site, l'API et les photos. Plus besoin de Vite.

```bash
npm run build                       # compile le site dans dist/
rm -rf backend/frontend
cp -R dist backend/frontend         # le backend sert ce dossier
cd backend && mvn spring-boot:run
```

Le site est sur http://localhost:8080 et l'administration sur
**http://localhost:8080/admin** — c'est la même application.

## 3. En ligne (serveur / VPS)

Il faut une machine avec **Docker** (4 Go de RAM suffisent) et un **domaine**.

### Ce qui doit être vrai avant d'envoyer le lien au client

- [ ] Les annonces de démonstration sont remplacées par de vraies annonces (via `/admin`)
- [ ] `ADMIN_PASSWORD` et `JWT_SECRET` sont **nouveaux** et forts (jamais `serge123`)
- [ ] `APP_PUBLIC_URL` et `VITE_SITE_URL` pointent sur le vrai domaine
- [ ] HTTPS actif (Caddy le fait automatiquement, voir plus bas)
- [ ] `MAIL_EXPOSE_RESET_LINK=false` : le lien de réinitialisation ne s'affiche jamais
- [ ] Une sauvegarde de la base **et** du dossier `uploads/` est en place

```bash
# 1. Copier le projet sur le serveur (git clone ou scp)
git clone <votre-depot> && cd serge-service-immobilier-export

# 2. Créer le fichier de configuration de production
cp .env.production.example .env
nano .env
```

Le fichier `.env` réel n'est **jamais** versionné (voir `.gitignore`) : il contient
les mots de passe et le secret JWT du serveur.

Remplacez dans `.env` toutes les valeurs `REMPLACER_...` :

```dotenv
JWT_SECRET=une-chaine-aleatoire-de-64-caracteres   # openssl rand -base64 48
ADMIN_PASSWORD=un-mot-de-passe-fort
ADMIN_EMAIL=admin@serge-immobilier.com
# Accès de secours à l'espace admin (e-mail + code, sans mot de passe personnel)
SETUP_CODE=un-code-que-vous-choisissez
# Inscription publique : garder false
ALLOW_REGISTRATION=false
# Vérification Google Search Console (balise HTML), facultatif
GOOGLE_SITE_VERIFICATION=
APP_PUBLIC_URL=https://votre-domaine.cm
VITE_SITE_URL=https://votre-domaine.cm
VITE_API_BASE_URL=
POSTGRES_PASSWORD=un-mot-de-passe-postgres-fort
MAIL_EXPOSE_RESET_LINK=false
# Pour recevoir les e-mails de réinitialisation :
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=votre-adresse@gmail.com
SMTP_PASSWORD=mot-de-passe-application
```

> Les variables `SETUP_CODE`, `ALLOW_REGISTRATION` et `GOOGLE_SITE_VERIFICATION`
> sont désormais réellement transmises au conteneur par `docker-compose.prod.yml`
> (avant, elles étaient ignorées silencieusement).

Les photos fixes (logo, accueil, services) sont dans **`public/images/`** — voir
`public/images/README.md`. Pour changer une photo, remplacez le fichier en gardant
le même nom, puis relancez le build : rien d'autre à modifier dans le code.

Lancer :

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Le site tourne sur le port **5170** du serveur. Vérification :

```bash
curl http://localhost:5170/actuator/health   # {"status":"UP"}
curl http://localhost:5170/sitemap.xml
```

> `VITE_API_BASE_URL=` (vide) est **obligatoire** : le site et l'API partagent
> la même adresse, les appels seront relatifs (`/api/...`).

### Accès admin en ligne

L'espace admin est à la même adresse que le site, avec `/admin` :

```
https://votre-domaine.cm/admin
```

Connexion avec `ADMIN_EMAIL` / `ADMIN_PASSWORD` — le compte est créé automatiquement
au premier démarrage. Seuls les comptes ayant le rôle `ADMIN` entrent ; la page
renvoie « Espace réservé à l'agence » pour les autres.
En cas d'oubli du mot de passe, la page `/login` propose **« J'ai un code d'accès »** :
entrez l'e-mail admin et le `SETUP_CODE` défini dans `.env`. Le code est vérifié par le
serveur ; laissez `SETUP_CODE` vide pour désactiver ce mode.

`/admin` est en `noindex` et bloqué dans `robots.txt` : Google ne l'indexera pas.

### Domaine + HTTPS (recommandé)

Avec [Caddy](https://caddyserver.com/), le certificat HTTPS est automatique.
Installez Caddy, puis `/etc/caddy/Caddyfile` :

```caddyfile
votre-domaine.cm, www.votre-domaine.cm {
    reverse_proxy localhost:5170
    encode gzip
}
```

```bash
sudo systemctl reload caddy
```

Puis mettez `APP_PUBLIC_URL` et `VITE_SITE_URL` en `https://votre-domaine.cm`
et relancez `docker compose -f docker-compose.prod.yml up -d --build`.

### Sauvegardes (photos + base)

```bash
# Base de données
docker exec $(docker compose -f docker-compose.prod.yml ps -q db) \
  pg_dump -U serge serge_immobilier > sauvegarde-$(date +%F).sql

# Photos
docker run --rm -v ssi_uploads:/data -v "$PWD":/backup alpine \
  tar czf /backup/uploads-$(date +%F).tar.gz -C /data .
```

Les photos vivent dans le volume `ssi_uploads` : un redéploiement ne les efface pas.
(Passer à S3 plus tard : il suffit de remplacer `FileStorageService`.)

## 4. Référencement (SEO)

Déjà en place :

- **`/sitemap.xml`** généré par le serveur : pages fixes + toutes les annonces disponibles.
- **`/robots.txt`** : autorise le site public, bloque `/admin`, `/login`, `/api/`.
- **`noindex`** automatique sur les annonces vendues ou déjà prises, et sur les pages privées.
- **Balisage structuré** JSON-LD (`RealEstateListing`, `Offer`, fil d'Ariane) sur chaque annonce.
- **URLs propres** : `/biens/studio-makepe-douala`, titre/description/Open Graph dynamiques.
- Panneau **Référencement** dans `/admin` avec les liens Search Console / Bing.

À faire une fois en ligne :

1. Ouvrir [Google Search Console](https://search.google.com/search-console), valider le domaine
   (enregistrement DNS TXT, **ou** coller la valeur de la balise HTML dans
   `GOOGLE_SITE_VERIFICATION` du `.env` puis redémarrer), puis soumettre
   `https://votre-domaine.cm/sitemap.xml`.
2. Faire de même sur [Bing Webmaster](https://www.bing.com/webmasters).
3. Créer/revendiquer la fiche **Google Business Profile** (agence à Douala) : c'est ce
   qui apporte le plus de visites pour un site immobilier local.
4. Mettre les vrais profils réseaux sociaux dans `src/data/site.js` (Facebook, TikTok)
   pour compléter les données structurées.

### Être trouvé sur « agence immobilière Cité des Palmiers »
Le site cible déjà cette requête : titre de la page d'accueil, description, mots-clés,
fiche `RealEstateAgent` (adresse « Cité des Palmiers »), titres des annonces et sitemap
avec les photos. Pour arriver dans le top 5 d'une recherche locale, le site ne suffit
pas :
1. **Google Business Profile** avec la même adresse (« Cité des Palmiers, derrière le
   lycée »), les mêmes téléphones que dans `src/data/site.js`, des photos et des avis
   clients. C'est le critère n°1 pour la recherche « près de moi » / par quartier.
2. Des **avis Google** réguliers (les 5 dernières semaines comptent le plus).
3. Le quartier écrit de façon identique partout : « Cité des Palmiers » (pas « Cité
   Palmiers » ou « Cité des palmiers »).
4. Quelques liens locaux (pages Facebook, annuaires camerounais, partenaires).
5. Publier régulièrement des annonces : chaque annonce est une page indexable.
Comptez plusieurs semaines après l'indexation avant de voir la position monter.

Limite à connaître : le site est une application React — le contenu est rendu dans le
navigateur. Google exécute le JavaScript, mais si vous voulez un SEO maximal
(prix visibles dans les résultats, partage social parfaitement fiable), la suite
logique est le rendu côté serveur (Next.js). Le sitemap, les métadonnées et le
JSON-LD sont déjà prêts pour cette migration.

## 5. Administration : qui peut publier ?

| Action | Qui |
|---|---|
| Voir le site et les annonces | tout le monde |
| Voir l'écran `/admin` | tout le monde (page vide sans session) |
| Publier / modifier / supprimer une annonce | **admin uniquement** (vérifié côté serveur) |
| Envoyer une photo | admin uniquement |
| Créer un accès / changer un rôle | admin uniquement |

Le contrôle est côté serveur (`@PreAuthorize("hasAuthority('ADMIN')")`), pas seulement
masqué dans l'interface : un visiteur ne peut pas publier même en appelant l'API directement.

### Donner l'accès à quelqu'un

1. Connectez-vous à `/admin` avec le compte administrateur.
2. Panneau **Comptes & accès** : nom, e-mail, mot de passe (8 caractères minimum), rôle.
3. Transmettez les identifiants à la personne. Elle se connecte sur `/login` puis ouvre `/admin`.

Rôles :

- **Administrateur** : publie, modifie, supprime les annonces et gère les comptes.
- **Simple** : peut se connecter, mais ne peut rien publier.

L'inscription publique est **désactivée** (`ALLOW_REGISTRATION=false`) : personne ne peut se
créer un compte tout seul. Pour la réactiver : `ALLOW_REGISTRATION=true` (les comptes créés
sont alors « Simple », jamais administrateur).

Alternative en ligne de commande (base de données) :

```sql
-- promouvoir un compte existant
UPDATE app_users SET role = 'ADMIN' WHERE email = 'personne@exemple.com';
-- retirer les droits
UPDATE app_users SET role = 'USER'  WHERE email = 'personne@exemple.com';
```

### Si vous avez oublié le mot de passe admin

Redémarrez avec un mot de passe temporaire :

```bash
ADMIN_PASSWORD=MotDePasseTemporaire123 docker compose -f docker-compose.prod.yml up -d
```

Puis changez-le depuis `/forgot-password` (avec SMTP configuré).

> Le mot de passe de `ADMIN_PASSWORD` ne sert qu'à la **création** du compte : un mot de
> passe déjà en base n'est jamais écrasé au redémarrage.
