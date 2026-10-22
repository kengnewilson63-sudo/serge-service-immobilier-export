# Dossier photos du site

Toutes les photos fixes du site sont ici. Pour remplacer une photo, il suffit
d'écraser le fichier par le tien **en gardant le même nom**.

## Arborescence

```
public/images/
├── logo.jpg            → logo de l'agence (aussi favicon + partage)
├── hero.jpg            → grande photo de l'accueil (1600×900 conseillé)
└── biens/
    └── bien-1.jpg      → photo de secours si une annonce n'a pas de photo
```

Il n'y a donc que **3 images à remplacer**. Les pages Services et À propos
n'utilisent plus de photos : elles sont volontairement plus légères (icônes et
texte uniquement).

Les photos des annonces (celles publiées depuis `/admin`) ne passent **pas** par
ce dossier : elles sont uploadées dans `backend/uploads/` et restent dans la base.

## Tailles recommandées

| Emplacement | Taille |
|---|---|
| `hero.jpg` | 1600 × 900 px |
| `logo.jpg` | 512 × 512 px (JPEG ou PNG) |
| `biens/bien-1.jpg` | 1200 × 750 px |

Une photo au-delà de ces tailles ralentit le site (mauvais pour le référencement).
Évite aussi les photos de moins de 600 px de large : Google les juge de mauvaise qualité.

## Arborescence

```
public/images/
├── logo.jpeg                              → logo de l'agence (aussi favicon + partage)
├── hero.jpg                               → grande photo de l'accueil (1600×900 conseillé)
├── apropos/
│   └── agence.jpg                         → photo "À propos"
├── agence/                                → bandeau « confiance » de l'accueil
│   ├── biens-verifies.jpg
│   ├── informations-claires.jpg
│   ├── accompagnement.jpg
│   └── presence-locale.jpg
├── services/                              → une photo par service
│   ├── location-appartements.jpg
│   ├── chambres-meublees.jpg
│   ├── vente-maisons.jpg
│   ├── vente-terrains.jpg
│   ├── gestion-immobiliere.jpg
│   ├── accompagnement.jpg
│   ├── evenementiel.jpg
│   └── locaux-commerciaux.jpg
└── biens/
    └── bien-1.jpg                         → photo de secours si une annonce n'a pas de photo
```

Les photos des annonces (celles publiées depuis `/admin`) ne passent **pas** par
ce dossier : elles sont uploadées dans `backend/uploads/` et restent dans la base.

Astuce : Google décrit parfois une image avec le nom du fichier. Renommer
`hero.jpg` en `agence-immobiliere-cite-des-palmiers-douala.jpg` (et mettre à jour
`IMAGES.hero` dans `src/data/site.js`) aide au référencement de la photo.

## Formats

- `logo.jpeg` doit rester en **JPEG ou PNG** (le favicon du `index.html` est déclaré `image/jpeg`).
- Les autres peuvent être en `.jpg` ; si tu veux du WebP, renomme aussi le fichier
  dans `src/data/site.js` (`IMAGES`, `localImage(...)`).

## Tailles recommandées

| Emplacement | Taille |
|---|---|
| `hero.jpg` | 1600 × 900 px |
| `services/*` et `agence/*` | 1200 × 750 px |
| `apropos/agence.jpg` | 1200 × 900 px |

Une photo au-delà de ces tailles ralentit le site (mauvais pour le référencement).
Évite aussi les photos de moins de 600 px de large : Google les juge de mauvaise qualité.
