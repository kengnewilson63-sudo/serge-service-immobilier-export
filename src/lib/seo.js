import { SERVICES } from '@/data/site';

export const SITE_URL = 'https://serge-home-flow.base44.app';
export const SITE_NAME = 'Serge Service Immobilier';

export const OG_IMAGE = {
  home: 'https://media.base44.com/images/public/6abf782998bb3e8f408ffb22/e6a16752c_generated_image.png',
  biens: 'https://media.base44.com/images/public/6abf782998bb3e8f408ffb22/350ddceba_WhatsAppImage2026-10-02at1734262.jpeg',
  services: 'https://media.base44.com/images/public/6abf782998bb3e8f408ffb22/748c05530_generated_image.png',
  apropos: 'https://media.base44.com/images/public/6abf782998bb3e8f408ffb22/40c7f9b98_generated_image.png',
  contact: 'https://media.base44.com/images/public/6abf782998bb3e8f408ffb22/cb1abc266_WhatsAppImage2026-10-02at171404.jpeg',
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
  url: `${SITE_URL}/biens/${p.id}`,
  image: p.images,
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
      url: `${SITE_URL}/biens/${p.id}`,
      image: p.images?.[0],
      address: address(p),
      offers: offer(p),
    },
  })),
});

export const webPageJsonLd = ({ type = 'WebPage', name, description, path }) => ({
  '@context': 'https://schema.org',
  '@type': type,
  '@id': `${SITE_URL}${path}#page`,
  url: `${SITE_URL}${path}`,
  name,
  description,
  inLanguage: 'fr',
  isPartOf: { '@id': `${SITE_URL}/#website` },
  about: { '@id': `${SITE_URL}/#agence` },
  publisher: { '@id': `${SITE_URL}/#agence` },
});

export const breadcrumbJsonLd = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: `${SITE_URL}${item.path}`,
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
      provider: { '@id': `${SITE_URL}/#agence` },
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