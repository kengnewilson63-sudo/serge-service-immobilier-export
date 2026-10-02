import { MessageCircle, Phone } from 'lucide-react';
import ContactButtons from '@/components/ContactButtons';
import Reveal from '@/components/Reveal';
import { CONTACT, SITE } from '@/data/site';

export default function CtaBand() {
  return (
    <section className="relative overflow-hidden bg-navy py-20 text-white">
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />

      <div className="container-x relative">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">{SITE.slogan}</p>
          <h2 className="mt-5 font-heading text-3xl font-bold leading-tight text-balance sm:text-4xl">
            Un logement vous intéresse ? Parlons-en dès maintenant.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/70">
            Écrivez-nous sur WhatsApp ou appelez directement l'agence. Nous vous répondons et organisons
            la visite du bien qui vous convient.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <ContactButtons />
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-x-10 gap-y-3 text-sm text-white/70 sm:flex-row">
            {CONTACT.phones.map((p) => (
              <span key={p.tel} className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-accent" /> {p.label}
              </span>
            ))}
            <span className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-accent" /> Réponse rapide sur WhatsApp
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}