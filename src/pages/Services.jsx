import { ArrowRight, PhoneCall, Search, Eye, Key } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHero from '@/components/PageHero';
import ServicesGrid from '@/components/ServicesGrid';
import Reveal from '@/components/Reveal';
import SectionHeading from '@/components/SectionHeading';
import CtaBand from '@/components/home/CtaBand';
import { Button } from '@/components/ui/button';
import Seo from '@/components/Seo';

const STEPS = [
  { icon: Search, title: '1. Vous recherchez', desc: 'Parcourez le catalogue et filtrez selon votre budget, votre quartier et vos besoins.' },
  { icon: PhoneCall, title: '2. Vous nous contactez', desc: "Un message WhatsApp ou un appel suffit : nous vous répondons et vous conseillons." },
  { icon: Eye, title: '3. Vous visitez', desc: "Nous organisons la visite du bien au moment qui vous convient." },
  { icon: Key, title: '4. Vous emménagez', desc: "Nous vous accompagnons jusqu'à la remise des clés et votre installation." },
];

export default function Services() {
  return (
    <>
      <Seo
        title="Nos services immobiliers à Douala | Serge Service Immobilier"
        description="Location d'appartements, studios et chambres meublées, vente de maisons, villas et terrains, gestion immobilière, locaux commerciaux et location événementielle à Douala."
        path="/services"
      />
      <PageHero
        breadcrumb="Services"
        eyebrow="Nos prestations"
        title="Un accompagnement immobilier complet à Douala"
        subtitle="De la recherche d'un appartement à la vente d'un terrain, en passant par la gestion de votre patrimoine : nous couvrons l'ensemble de vos besoins immobiliers."
      />

      <section className="py-20 sm:py-24">
        <div className="container-x">
          <ServicesGrid />
        </div>
      </section>

      <section className="bg-secondary/40 py-20 sm:py-24">
        <div className="container-x">
          <SectionHeading
            eyebrow="Comment ça marche"
            title="Un parcours simple, en quatre étapes"
            subtitle="Notre objectif : vous faire gagner du temps et vous offrir une recherche de logement claire et sans stress."
            align="center"
          />

          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.07}>
                <div className="relative h-full rounded-2xl border border-border bg-card p-7">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/8 text-primary">
                    <step.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 font-heading text-base font-semibold text-navy">{step.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/biens">
                Découvrir nos biens <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}