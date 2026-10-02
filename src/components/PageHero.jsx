import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function PageHero({ eyebrow, title, subtitle, breadcrumb }) {
  return (
    <section className="relative overflow-hidden bg-navy py-16 text-white sm:py-20">
      <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary/25 blur-3xl" />
      <div className="absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

      <div className="container-x relative">
        {breadcrumb && (
          <nav className="mb-5 flex items-center gap-1.5 text-xs text-white/55">
            <Link to="/" className="transition-colors hover:text-accent">Accueil</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white/80">{breadcrumb}</span>
          </nav>
        )}
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">{eyebrow}</p>
        )}
        <h1 className="mt-4 max-w-3xl font-heading text-3xl font-extrabold leading-tight tracking-tight text-balance sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/70">{subtitle}</p>
        )}
      </div>
    </section>
  );
}