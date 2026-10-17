import { Link } from 'react-router-dom';
import { Facebook, Mail, MapPin, MessageCircle, Music2, Phone } from 'lucide-react';
import Logo from '@/components/Logo';
import { useAuth } from '@/lib/AuthContext';
import { CONTACT, NAV_LINKS, SERVICES, SITE, telLink, waLink } from '@/data/site';

export default function Footer() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <footer className="bg-navy text-white/75">
      <div className="container-x grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-3">
            <Logo size="h-14 w-14" />
            <div>
              <p className="font-heading text-sm font-bold uppercase tracking-wide text-white">{SITE.name}</p>
              <p className="text-xs italic text-accent">{SITE.slogan}</p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-relaxed">
            Agence immobilière à Douala, spécialisée dans la location d'appartements et de chambres,
            la vente de terrains et l'accompagnement immobilier personnalisé.
          </p>
          <div className="mt-6 flex gap-3">
            {CONTACT.socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-accent hover:bg-accent hover:text-accent-foreground"
              >
                {s.label === 'Facebook' ? <Facebook className="h-4 w-4" /> : <Music2 className="h-4 w-4" />}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-heading text-sm font-semibold uppercase tracking-[0.18em] text-white">Navigation</h3>
          <ul className="mt-5 space-y-3 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="transition-colors hover:text-accent">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-heading text-sm font-semibold uppercase tracking-[0.18em] text-white">Nos services</h3>
          <ul className="mt-5 space-y-3 text-sm">
            {SERVICES.slice(0, 6).map((s) => (
              <li key={s.title}>
                <Link to="/services" className="transition-colors hover:text-accent">
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-heading text-sm font-semibold uppercase tracking-[0.18em] text-white">Contact</h3>
          <ul className="mt-5 space-y-4 text-sm">
            {CONTACT.phones.map((p) => (
              <li key={p.tel} className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <a href={telLink(p.tel)} className="transition-colors hover:text-accent">
                  {p.label} <span className="text-white/50">(Appel / WhatsApp)</span>
                </a>
              </li>
            ))}
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>
                <span className="block text-white/50">Siège social</span>
                {CONTACT.hq}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>
                <span className="block text-white/50">Agence secondaire</span>
                {CONTACT.branch}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <a href={`mailto:${CONTACT.email}`} className="transition-colors hover:text-accent">
                {CONTACT.email}
              </a>
            </li>
          </ul>
          <a
            href={waLink('Bonjour Serge Service Immobilier, je souhaiterais des informations.')}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1da851]"
          >
            <MessageCircle className="h-4 w-4" /> Discuter sur WhatsApp
          </a>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} {SITE.name} — Tous droits réservés.</p>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Link to="/admin" className="transition-colors hover:text-accent">Espace agence</Link>
            )}
            <p>{SITE.tagline}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}