import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import Reveal from '@/components/Reveal';
import SectionHeading from '@/components/SectionHeading';
import { PROPERTIES } from '@/data/properties';

export default function Neighborhoods() {
  const counts = PROPERTIES.reduce((acc, p) => {
    acc[p.neighborhood] = (acc[p.neighborhood] || 0) + 1;
    return acc;
  }, {});
  const list = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);

  return (
    <section className="py-20 sm:py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="Où nous intervenons"
          title="Les quartiers les plus demandés"
          subtitle="Douala et sa région — découvrez les biens disponibles quartier par quartier."
          align="center"
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map(([name, count], i) => (
            <Reveal key={name} delay={i * 0.06}>
              <Link
                to={`/biens?quartier=${encodeURIComponent(name)}`}
                className="group flex items-center justify-between rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/8 text-primary">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block font-heading text-base font-semibold text-navy">{name}</span>
                    <span className="text-xs text-muted-foreground">
                      {count} bien{count > 1 ? 's' : ''} disponible{count > 1 ? 's' : ''}
                    </span>
                  </span>
                </span>
                <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}