import { PROPERTIES } from '@/data/properties';

export const SITE_URL = 'https://serge-home-flow.base44.app';

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

export const LISTINGS_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Biens immobiliers à Douala — Serge Service Immobilier',
  numberOfItems: PROPERTIES.length,
  itemListElement: PROPERTIES.map((p, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: {
      '@type': 'RealEstateListing',
      name: p.title,
      url: `${SITE_URL}/biens/${p.id}`,
      image: p.images[0],
      address: address(p),
      offers: offer(p),
    },
  })),
};