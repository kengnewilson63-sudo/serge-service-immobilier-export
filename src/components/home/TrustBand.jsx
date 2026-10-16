import { useEffect, useState } from 'react';
import { Building2, Handshake, MapPin, ShieldCheck } from 'lucide-react';
import Reveal from '@/components/Reveal';
import { Image } from '@/components/ui/image';
import { fetchCatalogStats } from '@/lib/properties';

// Visuels générés — ambiance camerounaise (Douala)
const m = (id) => `https://media.base44.com/images/public/6abf782998bb3e8f408ffb22/${id}_generated_image.png`;

export default function TrustBand() {
  const [catalog, setCatalog] = useState(null);

  useEffect(() => {
    fetchCatalogStats().then(setCatalog);
  }, []);

  const stats = [
    { value: catalog ? `${catalog.available}+` : '—', label: 'Biens disponibles' },
    { value: catalog ? `${catalog.neighborhoods}` : '—', label: 'Quartiers couverts' },
    { value: '2', label: 'Agences à Douala' },
    { value: '1', label: 'Interlocuteur dédié' },
  ];

  const values = [
    {
      icon: Building2,
      title: 'Des biens vérifiés',
      desc: 'Chaque logement est visité et documenté avant publication.',
      image: m('2b44faf5c'),
    },
    {
      icon: ShieldCheck,
      title: 'Des informations claires',
      desc: 'Prix, charges, équipements et conditions affichés sans surprise.',
      image: m('0f3779e62'),
    },
    {
      icon: Handshake,
      title: 'Un accompagnement',
      desc: "De la recherche jusqu'à l'installation, nous restons disponibles.",
      image: m('40c7f9b98'),
    },
    {
      icon: MapPin,
      title: 'Une présence locale',
      desc: 'Deux agences à Douala, au plus près de vos besoins.',
      image: m('324a3d92b'),
    },
  ];

  return (
    <section className="border-b border-border bg-card">
      <div className="container-x py-14">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.06}>
              <div className="text-center lg:text-left">
                <p className="font-heading text-4xl font-extrabold text-primary">{s.value}</p>
                <p className="mt-1 text-sm font-medium text-muted-foreground">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-14 grid gap-6 border-t border-border pt-12 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.06}>
              <article className="group h-full overflow-hidden rounded-2xl border border-border bg-background transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={v.image}
                    alt={v.title}
                    className="h-full w-full transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-navy/10 to-transparent" />
                  <span className="absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-xl bg-navy/85 text-accent backdrop-blur">
                    <v.icon className="h-5 w-5" />
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-heading text-base font-semibold text-navy">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.desc}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}