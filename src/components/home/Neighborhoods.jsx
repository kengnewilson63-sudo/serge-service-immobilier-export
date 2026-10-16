import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Reveal from '@/components/Reveal';
import SectionHeading from '@/components/SectionHeading';
import { Image } from '@/components/ui/image';
import { fetchNeighborhoodStats } from '@/lib/properties';

export default function Neighborhoods() {
  const [list, setList] = useState([]);

  useEffect(() => {
    fetchNeighborhoodStats(6).then(setList);
  }, []);

  return (
    <section className="py-20 sm:py-24">
      <div className="container-x">
        <SectionHeading
          eyebrow="Où nous intervenons"
          title="Les quartiers les plus demandés"
          subtitle="Douala et sa région — découvrez les biens disponibles quartier par quartier."
          align="center"
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((n, i) => (
            <Reveal key={n.name} delay={i * 0.06}>
              <Link
                to={`/biens?quartier=${encodeURIComponent(n.name)}`}
                className="group relative block overflow-hidden rounded-2xl border border-border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <Image
                  src={n.image}
                  alt={`Biens immobiliers à ${n.name}, Douala`}
                  className="aspect-[4/3] w-full transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/45 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
                  <div>
                    <p className="font-heading text-lg font-bold text-white">{n.name}</p>
                    <p className="text-xs font-medium text-white/75">
                      {n.count} bien{n.count > 1 ? 's' : ''} disponible{n.count > 1 ? 's' : ''}
                    </p>
                  </div>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground transition-transform duration-300 group-hover:translate-x-1">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}