import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import PropertyCard from '@/components/PropertyCard';
import Reveal from '@/components/Reveal';
import SectionHeading from '@/components/SectionHeading';
import { Button } from '@/components/ui/button';
import { fetchFeatured } from '@/lib/properties';

export default function FeaturedProperties() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    fetchFeatured(6).then(setFeatured);
  }, []);

  return (
    <section className="bg-secondary/40 py-20 sm:py-24">
      <div className="container-x">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Sélection de l'agence"
            title="Nos biens en vedette"
            subtitle="Une sélection d'appartements, studios et espaces à découvrir dès maintenant à Douala."
          />
          <Reveal>
            <Button asChild variant="outline" className="border-primary/25 text-primary hover:bg-primary/5">
              <Link to="/biens">
                Voir tous les biens <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((property, i) => (
            <Reveal key={property.recordId} delay={i * 0.07}>
              <PropertyCard property={property} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}