import { Award, Building2, Handshake, MapPin, ShieldCheck, Users } from 'lucide-react';
import PageHero from '@/components/PageHero';
import Reveal from '@/components/Reveal';
import SectionHeading from '@/components/SectionHeading';
import CtaBand from '@/components/home/CtaBand';
import Seo from '@/components/Seo';
import { ABOUT_JSON_LD, OG_IMAGE, breadcrumbJsonLd } from '@/lib/seo';
import { Image } from '@/components/ui/image';
import { useEffect, useState } from 'react';
import { CONTACT, SITE } from '@/data/site';
import { fetchCatalogStats } from '@/lib/properties';

const IMG = 'https://media.base44.com/images/public/6abf782998bb3e8f408ffb22/40c7f9b98_generated_image.png';

const VALUES = [
  { icon: ShieldCheck, title: 'Confiance', desc: "Des biens visités et des informations vérifiées avant toute publication." },
  { icon: Users, title: 'Proximité', desc: 'Une équipe accessible, qui connaît Douala et ses quartiers.' },
  { icon: Handshake, title: 'Accompagnement', desc: "Un interlocuteur dédié du premier contact jusqu'à votre installation." },
  { icon: Award, title: 'Professionnalisme', desc: 'Un suivi rigoureux et une communication transparente à chaque étape.' },
];

export default function About() {
  const [neighborhoods, setNeighborhoods] = useState(null);

  useEffect(() => {
    fetchCatalogStats().then((stats) => setNeighborhoods(stats.neighborhoods));
  }, []);

  return (
    <>
      <Seo
        title="À propos — Agence immobilière à Douala | Serge Service Immobilier"
        description="Serge Service Immobilier (S.S.I) est une agence immobilière basée à Douala, spécialisée dans la location, la vente et la gestion de biens à Makepe, Logpom, Bonamoussadi, Kotto et dans tout le Littoral."
        keywords="agence immobilière Douala, Serge Service Immobilier, S.S.I, agence immobilière Cameroun, courtier immobilier Douala, agence immobilière Littoral"
        image={OG_IMAGE.apropos}
        path="/a-propos"
        jsonLd={[
          ABOUT_JSON_LD,
          breadcrumbJsonLd([
            { name: 'Accueil', path: '/' },
            { name: 'À propos', path: '/a-propos' },
          ]),
        ]}
      />
      <PageHero
        breadcrumb="À propos"
        eyebrow="Qui sommes-nous"
        title="Serge Service Immobilier, votre partenaire à Douala"
        subtitle={SITE.slogan}
      />

      <section className="py-20 sm:py-24">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <div className="relative">
              <div className="overflow-hidden rounded-3xl">
                <Image src={IMG} alt="Serge Service Immobilier à Douala" className="aspect-[4/3] w-full" />
              </div>
              <div className="absolute -bottom-6 -right-4 hidden rounded-2xl border border-border bg-card p-6 shadow-xl sm:block">
                <p className="font-heading text-3xl font-extrabold text-primary">{neighborhoods ?? '—'}</p>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Quartiers couverts
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <SectionHeading
              eyebrow="Notre histoire"
              title="Une agence locale, au service des habitants de Douala"
            />
            <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>
                Basée à Douala, <strong className="text-navy">Serge Service Immobilier</strong> accompagne les
                particuliers et les familles dans la recherche d'un logement : appartements, studios et
                chambres meublées à louer, mais aussi maisons, villas et terrains à vendre.
              </p>
              <p>
                Nous mettons un point d'honneur à présenter des biens réels, avec des informations claires :
                prix, conditions, équipements et environnement. Notre priorité est de rendre la recherche
                simple et le contact direct.
              </p>
              <p>
                Notre présence dans plusieurs quartiers — Makepe, Logpom, Bonamoussadi, Kotto, Logbessou et
                bien d'autres — nous permet de vous proposer des biens au plus près de vos besoins.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-secondary/40 py-20 sm:py-24">
        <div className="container-x">
          <SectionHeading eyebrow="Nos valeurs" title="Ce qui guide notre travail" align="center" />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.07}>
                <div className="h-full rounded-2xl border border-border bg-card p-7">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/8 text-primary">
                    <v.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 font-heading text-base font-semibold text-navy">{v.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="container-x">
          <SectionHeading
            eyebrow="Nous trouver"
            title="Nos agences à Douala"
            subtitle="Passez nous voir : notre équipe vous accueille dans ses deux agences."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {[
              { icon: Building2, label: 'Siège social', value: CONTACT.hq },
              { icon: MapPin, label: 'Agence secondaire', value: CONTACT.branch },
            ].map((a, i) => (
              <Reveal key={a.label} delay={i * 0.08}>
                <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-7">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-gold">
                    <a.icon className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{a.label}</p>
                    <p className="mt-1 font-heading text-lg font-semibold text-navy">{a.value}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}