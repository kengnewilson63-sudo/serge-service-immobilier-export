import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Hero from '@/components/home/Hero';
import TrustBand from '@/components/home/TrustBand';
import FeaturedProperties from '@/components/home/FeaturedProperties';
import Neighborhoods from '@/components/home/Neighborhoods';
import CtaBand from '@/components/home/CtaBand';
import ServicesGrid from '@/components/ServicesGrid';
import Reveal from '@/components/Reveal';
import SectionHeading from '@/components/SectionHeading';
import { Button } from '@/components/ui/button';
import Seo from '@/components/Seo';

export default function Home() {
  return (
    <>
      <Seo
        title="Serge Service Immobilier — Location & vente immobilière à Douala"
        description="Appartements, studios et chambres meublées à louer, maisons, villas et terrains à vendre à Douala. Serge Service Immobilier vous accompagne de la recherche à la remise des clés."
        path="/"
      />
      <Hero />
      <TrustBand />
      <FeaturedProperties />

      <section className="py-20 sm:py-24">
        <div className="container-x">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              eyebrow="Ce que nous faisons"
              title="Des services immobiliers complets"
              subtitle="Location, vente, terrains, gestion et accompagnement personnalisé — à Douala et dans le Littoral."
            />
            <Reveal>
              <Button asChild variant="outline" className="border-primary/25 text-primary hover:bg-primary/5">
                <Link to="/services">
                  Tous nos services <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </Reveal>
          </div>
          <div className="mt-12">
            <ServicesGrid limit={6} />
          </div>
        </div>
      </section>

      <Neighborhoods />
      <CtaBand />
    </>
  );
}