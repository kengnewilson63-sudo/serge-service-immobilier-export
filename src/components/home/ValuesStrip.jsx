import { Handshake, MapPin, ShieldCheck } from 'lucide-react';
import { CONTACT } from '@/data/site';

// Bandeau compact : les arguments de l'agence en une ligne, sans photos.
const VALUES = [
  { icon: ShieldCheck, label: 'Biens vérifiés' },
  { icon: Handshake, label: 'Accompagnement personnalisé' },
  { icon: MapPin, label: 'Présence à Douala' },
];

export default function ValuesStrip() {
  return (
    <section className="border-b border-border bg-card">
      <div className="container-x flex flex-wrap items-center justify-center gap-x-10 gap-y-4 py-6 text-sm font-medium text-muted-foreground">
        {VALUES.map((v) => (
          <span key={v.label} className="flex items-center gap-2">
            <v.icon className="h-4 w-4 text-primary" />
            {v.label}
          </span>
        ))}
        <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-2 hover:text-primary">
          <MapPin className="h-4 w-4 text-primary" />
          {CONTACT.hq}
        </a>
      </div>
    </section>
  );
}
