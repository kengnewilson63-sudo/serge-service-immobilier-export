import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Hero from '@/components/home/Hero';
import FeaturedProperties from '@/components/home/FeaturedProperties';
import ValuesStrip from '@/components/home/ValuesStrip';
import Neighborhoods from '@/components/home/Neighborhoods';
import CtaBand from '@/components/home/CtaBand';
import ServicesGrid from '@/components/ServicesGrid';
import Reveal from '@/components/Reveal';
import SectionHeading from '@/components/SectionHeading';
import { Button } from '@/components/ui/button';
import Seo from '@/components/Seo';
import { HOME_JSON_LD, OG_IMAGE, ORGANIZATION_JSON_LD } from '@/lib/seo';

export default function Home() {
  return (
    <>
      <Seo
        title="Agence immobilière à Cité des Palmiers, Douala | Serge Service Immobilier"
        description="Agence immobilière à la Cité des Palmiers, Douala : location d'appartements, studios et chambres meublées, vente de maisons, villas et terrains (Makepe, Logpom, Bonamoussadi, Kotto, Bonabéri). Visite organisée et contact direct WhatsApp."
        keywords="agence immobilière Cité des Palmiers, agence immobilière Douala, immobilier Douala, appartement à louer Cité des Palmiers, appartement à louer Douala, studio meublé Douala, chambre meublée Douala, maison à vendre Douala, villa Douala, terrain à vendre Douala"
        image={OG_IMAGE.home}
        path="/"
        jsonLd={[HOME_JSON_LD, ORGANIZATION_JSON_LD]}
      />
      <Hero />
      <ValuesStrip />
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