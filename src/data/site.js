export const SITE = {
  name: 'Serge Service Immobilier',
  short: 'S.S.I',
  slogan: 'Votre espace, notre priorité.',
  tagline: 'Votre partenaire immobilier de confiance.',
  logo: 'https://media.base44.com/images/public/6abf782998bb3e8f408ffb22/cb1abc266_WhatsAppImage2026-10-02at171404.jpeg',
};

export const CONTACT = {
  phones: [
    { label: '681 28 45 14', tel: '+237681284514', wa: '237681284514' },
    { label: '695 92 90 01', tel: '+237695929001', wa: '237695929001' },
  ],
  email: 'contact@sergeserviceimmo.cm',
  hq: 'Douala — Cité des Palmiers (derrière le lycée)',
  branch: 'Douala — Logpom Bassong',
  socials: [
    { label: 'Facebook', href: 'https://www.facebook.com/' },
    { label: 'TikTok', href: 'https://www.tiktok.com/' },
  ],
};

export const PRIMARY = CONTACT.phones[0];
export const SECONDARY = CONTACT.phones[1];

export const waLink = (message, wa = PRIMARY.wa) =>
  `https://wa.me/${wa}?text=${encodeURIComponent(message)}`;

export const telLink = (tel) => `tel:${tel}`;

export const formatPrice = (value) =>
  new Intl.NumberFormat('fr-FR').format(value) + ' FCFA';

export const NAV_LINKS = [
  { label: 'Accueil', to: '/' },
  { label: 'Biens immobiliers', to: '/biens' },
  { label: 'Services', to: '/services' },
  { label: 'À propos', to: '/a-propos' },
  { label: 'Contact', to: '/contact' },
];

export const SERVICES = [
  {
    icon: 'Building2',
    title: "Location d'appartements",
    desc: "Des appartements vérifiés à Douala, du studio au duplex, avec visite organisée et accompagnement jusqu'à la remise des clés.",
  },
  {
    icon: 'Store',
    title: 'Chambres meublées & studios',
    desc: 'Solutions rapides et confortables pour étudiants, travailleurs et séjours de courte ou moyenne durée.',
  },
  {
    icon: 'Home',
    title: 'Vente de maisons et villas',
    desc: 'Sélection de maisons et villas pour habitation ou investissement, présentées avec toutes les informations utiles.',
  },
  {
    icon: 'Trees',
    title: 'Vente de terrains',
    desc: 'Terrains situés dans les zones en développement de Douala, avec accompagnement dans vos démarches.',
  },
  {
    icon: 'Key',
    title: 'Gestion immobilière',
    desc: "Confiez-nous votre bien : mise en location, suivi des occupants, entretien et reporting transparent.",
  },
  {
    icon: 'UserCheck',
    title: 'Accompagnement personnalisé',
    desc: "Un interlocuteur dédié vous guide de la recherche du logement jusqu'à la signature et l'installation.",
  },
  {
    icon: 'PartyPopper',
    title: 'Location événementielle',
    desc: "Salles des fêtes et espaces aménagés pour vos cérémonies, séminaires et événements privés.",
  },
  {
    icon: 'Briefcase',
    title: 'Locaux commerciaux & bureaux',
    desc: 'Espaces professionnels adaptés aux commerces, cliniques, crèches, restaurants et centres de formation.',
  },
];

export const NEIGHBORHOODS = [
  'Makepe',
  'Logpom',
  'Bonamoussadi',
  'Kotto',
  'Logbessou',
  'Bonapriso',
  'Bonabéri',
  'Yassa',
  'Akwa',
];

export const PROPERTY_TYPES = [
  'Appartement',
  'Studio',
  'Chambre',
  'Duplex',
  'Maison',
  'Terrain',
  'Local',
  'Salle des fêtes',
];

export const TRANSACTIONS = [
  { value: 'location', label: 'À louer' },
  { value: 'vente', label: 'À vendre' },
  { value: 'evenement', label: 'Événementiel' },
];