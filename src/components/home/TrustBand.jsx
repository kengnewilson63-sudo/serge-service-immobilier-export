import { Building2, Handshake, MapPin, ShieldCheck } from 'lucide-react';
import Reveal from '@/components/Reveal';
import { PROPERTIES } from '@/data/properties';

export default function TrustBand() {
  const available = PROPERTIES.filter((p) => p.status === 'disponible').length;
  const neighborhoods = new Set(PROPERTIES.map((p) => p.neighborhood)).size;

  const stats = [
    { value: `${available}+`, label: 'Biens disponibles' },
    { value: `${neighborhoods}`, label: 'Quartiers couverts' },
    { value: '2', label: 'Agences à Douala' },
    { value: '1', label: 'Interlocuteur dédié' },
  ];

  const values = [
    { icon: Building2, title: 'Des biens vérifiés', desc: "Chaque logement est visité et documenté avant publication." },
    { icon: ShieldCheck, title: 'Des informations claires', desc: 'Prix, charges, équipements et conditions affichés sans surprise.' },
    { icon: Handshake, title: 'Un accompagnement', desc: "De la recherche jusqu'à l'installation, nous restons disponibles." },
    { icon: MapPin, title: 'Une présence locale', desc: 'Deux agences à Douala, au plus près de vos besoins.' },
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

        <div className="mt-14 grid gap-8 border-t border-border pt-12 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.06}>
              <div>
                <v.icon className="h-6 w-6 text-accent" />
                <h3 className="mt-4 font-heading text-base font-semibold text-navy">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}