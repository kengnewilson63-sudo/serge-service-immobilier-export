import { useState } from 'react';
import { Building2, Clock, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import PageHero from '@/components/PageHero';
import Reveal from '@/components/Reveal';
import SectionHeading from '@/components/SectionHeading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Seo from '@/components/Seo';
import { CONTACT_JSON_LD, OG_IMAGE, breadcrumbJsonLd } from '@/lib/seo';
import { CONTACT, PRIMARY, SECONDARY, telLink, waLink } from '@/data/site';

const inputClass = 'h-12 border-input focus:border-primary focus:ring-2 focus:ring-primary/15';

export default function Contact() {
  const [form, setForm] = useState({ nom: '', telephone: '', sujet: '', message: '' });
  const [sent, setSent] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    const text = `Bonjour Serge Service Immobilier,\n\nNom : ${form.nom}\nTéléphone : ${form.telephone}\nSujet : ${form.sujet || 'Demande d\'information'}\n\n${form.message}`;
    window.open(waLink(text), '_blank', 'noopener,noreferrer');
    setSent(true);
  };

  const cards = [
    {
      icon: Phone,
      title: 'Téléphone & WhatsApp',
      lines: CONTACT.phones.map((p) => ({ text: `${p.label} (Appel / WhatsApp)`, href: telLink(p.tel) })),
    },
    { icon: Mail, title: 'Email', lines: [{ text: CONTACT.email, href: `mailto:${CONTACT.email}` }] },
    { icon: Building2, title: 'Siège social', lines: [{ text: CONTACT.hq }] },
    { icon: MapPin, title: 'Agence secondaire', lines: [{ text: CONTACT.branch }] },
  ];

  return (
    <>
      <Seo
        title="Contact — Agence immobilière à Douala | Serge Service Immobilier"
        description="Contactez Serge Service Immobilier à Douala pour une location, une vente ou une visite. Deux agences : Cité des Palmiers et Logpom Bassong. Appel et WhatsApp 681 28 45 14 / 695 92 90 01."
        keywords="contact agence immobilière Douala, téléphone agence immobilière Douala, WhatsApp immobilier Douala, visite appartement Douala, numéro agence immobilière Douala"
        image={OG_IMAGE.contact}
        path="/contact"
        jsonLd={[
          CONTACT_JSON_LD,
          breadcrumbJsonLd([
            { name: 'Accueil', path: '/' },
            { name: 'Contact', path: '/contact' },
          ]),
        ]}
      />
      <PageHero
        breadcrumb="Contact"
        eyebrow="Parlons de votre projet"
        title="Contactez Serge Service Immobilier"
        subtitle="Une question sur un bien, une demande de visite ou un projet immobilier ? Écrivez-nous ou appelez-nous directement."
      />

      <section className="py-16 sm:py-20">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <SectionHeading eyebrow="Coordonnées" title="Nous sommes à votre écoute" />
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {cards.map((c, i) => (
                <Reveal key={c.title} delay={i * 0.06}>
                  <div className="h-full rounded-2xl border border-border bg-card p-6">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/8 text-primary">
                      <c.icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 font-heading text-base font-semibold text-navy">{c.title}</h3>
                    <div className="mt-2 space-y-1">
                      {c.lines.map((l) => (
                        <p key={l.text} className="text-sm text-muted-foreground">
                          {l.href ? (
                            <a href={l.href} className="transition-colors hover:text-primary">{l.text}</a>
                          ) : (
                            l.text
                          )}
                        </p>
                      ))}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="bg-[#25D366] text-white hover:bg-[#1da851]">
                <a href={waLink("Bonjour Serge Service Immobilier, je souhaiterais des informations.")} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp {PRIMARY.label}
                </a>
              </Button>
              <Button asChild variant="outline" className="border-primary/25 text-primary hover:bg-primary/5">
                <a href={telLink(SECONDARY.tel)}>
                  <Phone className="mr-2 h-4 w-4" /> Appeler {SECONDARY.label}
                </a>
              </Button>
            </div>

            <div className="mt-8 flex items-start gap-3 rounded-2xl border border-border bg-secondary/50 p-6">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-heading text-sm font-semibold text-navy">Disponibilité</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Du lundi au samedi, de 8h à 18h. Visites sur rendez-vous.
                </p>
              </div>
            </div>
          </div>

          <Reveal delay={0.1}>
            <div className="rounded-3xl border border-border bg-card p-7 shadow-sm sm:p-9">
              <h2 className="font-heading text-xl font-bold text-navy">Envoyez-nous un message</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Remplissez le formulaire : votre message s'ouvrira directement dans WhatsApp, prêt à être envoyé.
              </p>

              <form onSubmit={submit} className="mt-7 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nom complet</span>
                    <Input required value={form.nom} onChange={set('nom')} placeholder="Votre nom" className={inputClass} />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Téléphone</span>
                    <Input required value={form.telephone} onChange={set('telephone')} placeholder="6XX XX XX XX" className={inputClass} />
                  </label>
                </div>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sujet</span>
                  <Input value={form.sujet} onChange={set('sujet')} placeholder="Ex. Visite d'un appartement à Makepe" className={inputClass} />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Message</span>
                  <Textarea
                    required
                    value={form.message}
                    onChange={set('message')}
                    rows={5}
                    placeholder="Décrivez votre recherche : type de bien, quartier, budget…"
                    className="border-input focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </label>

                <Button type="submit" size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  <Send className="mr-2 h-4 w-4" /> Envoyer via WhatsApp
                </Button>

                {sent && (
                  <p className="rounded-lg bg-primary/8 px-4 py-3 text-sm text-primary">
                    WhatsApp va s'ouvrir avec votre message pré-rempli. Il ne vous reste plus qu'à l'envoyer.
                  </p>
                )}
              </form>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}