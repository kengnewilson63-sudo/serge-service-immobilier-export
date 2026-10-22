import { CONTACT, SERVICES } from '@/data/site';

// L'URL publique du site : indispensable pour le SEO (canonical, sitemap, JSON-LD).
// En production, définissez VITE_SITE_URL=https://votre-domaine.cm
const env = /** @type {any} */ (import.meta).env || {};

export const SITE_URL = String(
  env.VITE_SITE_URL || (env.DEV ? '' : 'https://serge-home-flow.base44.app')
).replace(/\/+$/, '');

/**
 * Origine publique du site. En développement, '' → les pages canoniques restent des
 * chemins relatifs (/biens) au lieu de pointer vers le site encore en ligne.
 */
const origin = () => SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
/** Origine publique utilisée par toutes les balises de référencement. */
export const siteOrigin = origin;
export const SITE_NAME = 'Serge Service Immobilier';

/**
 * Rend absolue une URL de photo. Un chemin /uploads/… (photo envoyée au backend) est
 * rendu absolu dès que l'URL du site est connue ; sinon l'image reste servie par le
 * même serveur que la page.
 */
export const absoluteUrl = (url) => {
  if (!url) return '';
  if (/^(https?:|data:)/i.test(url)) return url;
  const path = url.startsWith('/') ? url : `/${url}`;
  const base = origin();
  return base ? `${base}${path}` : path;
};

// Images de partage (Open Graph) : fichiers du dossier public/images/.
const img = (path) => `${origin()}/images/${path}`;

export const OG_IMAGE = {
  home: img('hero.jpg'),
  biens: img('biens/bien-1.jpg'),
  services: img('hero.jpg'),
  apropos: img('biens/bien-1.jpg'),
  contact: img('logo.jpg'),
};

const availability = (status) =>
  status === 'disponible' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut';

const address = (p) => ({
  '@type': 'PostalAddress',
  addressLocality: p.city,
  addressRegion: p.region,
  addressCountry: 'CM',
});

const offer = (p) => ({
  '@type': 'Offer',
  price: p.price,
  priceCurrency: 'XAF',
  availability: availability(p.status),
});

export const listingJsonLd = (p) => ({
  '@context': 'https://schema.org',
  '@type': 'RealEstateListing',
  name: p.title,
  url: `${origin()}/biens/${p.id}`,
  image: (p.images || []).map(absoluteUrl),
  description: p.description,
  numberOfRooms: p.rooms || undefined,
  floorSize: { '@type': 'QuantitativeValue', value: p.area, unitCode: 'MTK' },
  address: address(p),
  offers: offer(p),
});

export const listingsJsonLd = (items = []) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Biens immobiliers à Douala — Serge Service Immobilier',
  numberOfItems: items.length,
  itemListElement: items.map((p, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: {
      '@type': 'RealEstateListing',
      name: p.title,
      url: `${origin()}/biens/${p.id}`,
      image: absoluteUrl(p.images?.[0]),
      address: address(p),
      offers: offer(p),
    },
  })),
});

export const webPageJsonLd = ({ type = 'WebPage', name, description, path }) => ({
  '@context': 'https://schema.org',
  '@type': type,
  '@id': `${origin()}${path}#page`,
  url: `${origin()}${path}`,
  name,
  description,
  inLanguage: 'fr',
  isPartOf: { '@id': `${origin()}/#website` },
  about: { '@id': `${origin()}/#agence` },
  publisher: { '@id': `${origin()}/#agence` },
});

export const breadcrumbJsonLd = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: `${origin()}${item.path}`,
  })),
});

export const SERVICES_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Services immobiliers à Douala — Serge Service Immobilier',
  numberOfItems: SERVICES.length,
  itemListElement: SERVICES.map((s, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: {
      '@type': 'Service',
      name: s.title,
      description: s.desc,
      serviceType: s.title,
      provider: { '@id': `${origin()}/#agence` },
      areaServed: [
        { '@type': 'City', name: 'Douala' },
        { '@type': 'AdministrativeArea', name: 'Littoral' },
      ],
    },
  })),
};

export const HOME_JSON_LD = webPageJsonLd({
  type: 'WebPage',
  name: 'Immobilier à Douala — location et vente de biens',
  description:
    "Location d'appartements, studios et chambres meublées, vente de maisons, villas et terrains à Douala (Makepe, Logpom, Bonamoussadi, Kotto, Bonabéri).",
  path: '/',
});

export const PROPERTIES_PAGE_JSON_LD = webPageJsonLd({
  type: 'CollectionPage',
  name: 'Biens immobiliers à louer et à vendre à Douala',
  description:
    'Catalogue de biens à Douala : appartements, studios, chambres meublées, duplex, maisons, villas, terrains et locaux commerciaux.',
  path: '/biens',
});

export const SERVICES_PAGE_JSON_LD = webPageJsonLd({
  type: 'CollectionPage',
  name: 'Services immobiliers à Douala',
  description:
    "Location, vente, gestion immobilière, locaux commerciaux et location événementielle à Douala et dans le Littoral.",
  path: '/services',
});

export const ABOUT_JSON_LD = webPageJsonLd({
  type: 'AboutPage',
  name: 'À propos de Serge Service Immobilier',
  description:
    'Agence immobilière basée à Douala, spécialisée dans la location, la vente et la gestion de biens dans tout le Littoral.',
  path: '/a-propos',
});

export const CONTACT_JSON_LD = webPageJsonLd({
  type: 'ContactPage',
  name: 'Contact — Serge Service Immobilier à Douala',
  description:
    'Deux agences à Douala : Cité des Palmiers et Logpom Bassong. Appel et WhatsApp au 681 28 45 14 et 695 92 90 01.',
  path: '/contact',
});

/** Fiche agence (RealEstateAgent) — insérée sur la page d'accueil avec le WebPage. */
export const ORGANIZATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': ['RealEstateAgent', 'LocalBusiness'],
  '@id': `${origin()}/#agence`,
  name: SITE_NAME,
  alternateName: 'S.S.I',
  url: `${origin()}/`,
  image: img('logo.jpg'),
  logo: img('logo.jpg'),
  telephone: CONTACT.phones.map((p) => p.tel),
  email: CONTACT.email,
  priceRange: '55 000 - 250 000 000 XAF',
  currenciesAccepted: 'XAF',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Cité des Palmiers, derrière le lycée',
    addressLocality: 'Douala',
    addressRegion: 'Littoral',
    addressCountry: 'CM',
  },
  geo: { '@type': 'GeoCoordinates', latitude: 4.0511, longitude: 9.7679 },
  areaServed: [
    { '@type': 'City', name: 'Douala' },
    { '@type': 'AdministrativeArea', name: 'Littoral' },
  ],
  knowsLanguage: ['fr', 'en'],
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '08:00',
      closes: '18:00',
    },
  ],
};