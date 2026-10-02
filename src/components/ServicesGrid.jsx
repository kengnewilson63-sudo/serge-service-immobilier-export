import {
  Briefcase,
  Building2,
  Home,
  Key,
  PartyPopper,
  Store,
  Trees,
  UserCheck,
} from 'lucide-react';
import Reveal from '@/components/Reveal';
import { SERVICES } from '@/data/site';

const ICONS = { Building2, Store, Home, Trees, Key, UserCheck, PartyPopper, Briefcase };

export default function ServicesGrid({ limit, tone = 'light' }) {
  const list = limit ? SERVICES.slice(0, limit) : SERVICES;
  const dark = tone === 'dark';

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((service, i) => {
        const Icon = ICONS[service.icon] || Home;
        return (
          <Reveal key={service.title} delay={i * 0.06}>
            <article
              className={`group h-full rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-1 ${
                dark
                  ? 'border-white/10 bg-white/5 hover:border-accent/50 hover:bg-white/10'
                  : 'border-border bg-card hover:border-primary/30 hover:shadow-lg'
              }`}
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                  dark ? 'bg-accent/15 text-accent' : 'bg-primary/8 text-primary'
                }`}
              >
                <Icon className="h-6 w-6" />
              </span>
              <h3 className={`mt-5 font-heading text-lg font-semibold ${dark ? 'text-white' : 'text-navy'}`}>
                {service.title}
              </h3>
              <p className={`mt-2.5 text-sm leading-relaxed ${dark ? 'text-white/65' : 'text-muted-foreground'}`}>
                {service.desc}
              </p>
            </article>
          </Reveal>
        );
      })}
    </div>
  );
}