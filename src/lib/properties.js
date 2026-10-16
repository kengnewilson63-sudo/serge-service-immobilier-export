import { base44 } from '@/api/base44Client';
import { formatPrice } from '@/data/site';

const PRICE_SUFFIX = { location: ' / mois', evenement: ' / jour', vente: '' };

/** Libellé de prix affiché partout (dérivé du montant et du type de transaction). */
export const priceLabelFor = (p) => `${formatPrice(p.price)}${PRICE_SUFFIX[p.transaction] ?? ''}`;

/**
 * Les annonces vivent en base. Le champ `slug` sert d'identifiant public :
 * on l'expose comme `id` pour que les adresses /biens/<slug> restent valables,
 * et `recordId` conserve l'identifiant réel de l'enregistrement.
 */
export const toProperty = (r) => ({ ...r, recordId: r.id, id: r.slug, priceLabel: priceLabelFor(r) });

export const CARD_FIELDS = [
  'slug',
  'title',
  'type',
  'transaction',
  'region',
  'city',
  'neighborhood',
  'price',
  'terms',
  'rooms',
  'bathrooms',
  'area',
  'status',
  'featured',
  'contact',
  'images',
];

export const PAGE_SIZE = 24;

/** Traduit les filtres de l'interface en requête lue par le serveur. */
export const buildQuery = (f = {}) => {
  const q = {};
  if (f.transaction) q.transaction = f.transaction;
  if (f.type) q.type = f.type;
  if (f.region) q.region = f.region;
  if (f.city) q.city = f.city;
  if (f.neighborhood) q.neighborhood = f.neighborhood;
  if (f.status) q.status = f.status;
  if (f.maxPrice) q.price = { $lte: Number(f.maxPrice) };
  if (f.rooms) q.rooms = { $gte: Number(f.rooms) };
  if (f.minArea) q.area = { $gte: Number(f.minArea) };

  const kw = (f.keyword || '').trim();
  if (kw) {
    const rx = { $regex: kw, $options: 'i' };
    q.$or = [
      { title: rx },
      { type: rx },
      { neighborhood: rx },
      { city: rx },
      { description: rx },
      { features: rx },
    ];
  }
  return q;
};

export const fetchProperties = async (filters = {}, { limit = PAGE_SIZE, cursor } = {}) => {
  const page = await base44.entities.Property.filter(buildQuery(filters), {
    sort: 'position',
    limit,
    cursor,
    fields: CARD_FIELDS,
  });
  return { ...page, items: page.items.map(toProperty) };
};

export const countProperties = (filters = {}) => base44.entities.Property.count(buildQuery(filters));

export const getPropertyBySlug = async (slug) => {
  const { items } = await base44.entities.Property.filter({ slug }, { limit: 1 });
  return items.length ? toProperty(items[0]) : null;
};

export const fetchFeatured = async (limit = 6) => {
  const { items } = await base44.entities.Property.filter(
    { featured: true, status: 'disponible' },
    { sort: 'position', limit, fields: CARD_FIELDS }
  );
  return items.map(toProperty);
};

export const fetchRelated = async (property, limit = 3) => {
  const { items } = await base44.entities.Property.filter(
    { transaction: property.transaction, slug: { $ne: property.id } },
    { sort: 'position', limit, fields: CARD_FIELDS }
  );
  return items.map(toProperty);
};

/** Quartiers les plus fournis (comptage côté serveur) + une photo de chacun. */
export const fetchNeighborhoodStats = async (limit = 6) => {
  const { rows } = await base44.entities.Property.aggregate({
    query: { status: 'disponible' },
    groupBy: 'neighborhood',
    sort: '-count',
    limit,
  });
  if (!rows?.length) return [];

  const names = rows.map((r) => r.neighborhood);
  const { items } = await base44.entities.Property.filter(
    { status: 'disponible', neighborhood: { $in: names } },
    { fields: ['neighborhood', 'images'], limit: 200 }
  );

  const imageByName = {};
  items.forEach((r) => {
    if (!imageByName[r.neighborhood] && r.images?.[0]) imageByName[r.neighborhood] = r.images[0];
  });

  return rows.map((r) => ({ name: r.neighborhood, count: r.count, image: imageByName[r.neighborhood] }));
};

/** Chiffres du bandeau de confiance : biens disponibles et quartiers couverts. */
export const fetchCatalogStats = async () => {
  const [available, neighborhoods] = await Promise.all([
    base44.entities.Property.count({ status: 'disponible' }),
    base44.entities.Property.list({ distinct: 'neighborhood' }),
  ]);
  return { available, neighborhoods: (neighborhoods.items || []).length };
};

/** Valeurs proposées dans les menus de filtre. */
export const fetchFilterOptions = async () => {
  const [types, regions, cities, neighborhoods] = await Promise.all([
    base44.entities.Property.list({ distinct: 'type' }),
    base44.entities.Property.list({ distinct: 'region' }),
    base44.entities.Property.list({ distinct: 'city' }),
    base44.entities.Property.list({ distinct: 'neighborhood' }),
  ]);
  const sorted = (res) => (res.items || []).slice().sort((a, b) => String(a).localeCompare(String(b), 'fr'));
  return {
    types: sorted(types),
    regions: sorted(regions),
    cities: sorted(cities),
    neighborhoods: sorted(neighborhoods),
  };
};