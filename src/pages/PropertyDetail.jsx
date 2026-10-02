import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Bath,
  BedDouble,
  Building2,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Mail,
  MapPin,
  Maximize,
  Phone,
  Tag,
} from 'lucide-react';
import ContactButtons from '@/components/ContactButtons';
import PropertyCard from '@/components/PropertyCard';
import Reveal from '@/components/Reveal';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Image } from '@/components/ui/image';
import { PROPERTIES, getPropertyById } from '@/data/properties';
import { CONTACT, formatPrice, telLink, waLink } from '@/data/site';

const TRANSACTION_LABEL = { location: 'À louer', vente: 'À vendre', evenement: 'Événementiel' };
const STATUS_LABEL = { disponible: 'Disponible', loue: 'Loué', vendu: 'Vendu' };

export default function PropertyDetail() {
  const { id } = useParams();
  const property = getPropertyById(id);
  const [active, setActive] = useState(0);

  if (!property) {
    return (
      <section className="container-x flex flex-col items-center py-32 text-center">
        <h1 className="font-heading text-2xl font-bold text-navy">Ce bien n'existe pas ou n'est plus disponible</h1>
        <p className="mt-3 text-sm text-muted-foreground">Il a peut-être été retiré du catalogue.</p>
        <Button asChild className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90">
          <Link to="/biens">Retour au catalogue</Link>
        </Button>
      </section>
    );
  }

  const related = PROPERTIES.filter((p) => p.id !== property.id && p.transaction === property.transaction).slice(0, 3);
  const visitMessage = `Bonjour, je souhaiterais demander une visite pour « ${property.title} » situé à ${property.neighborhood}, ${property.city} (${property.priceLabel}). Quelles sont vos disponibilités ?`;

  const specs = [
    { icon: Building2, label: 'Type', value: property.type },
    { icon: BedDouble, label: 'Chambres', value: property.rooms > 0 ? property.rooms : '—' },
    { icon: Bath, label: "Salles d'eau", value: property.bathrooms > 0 ? property.bathrooms : '—' },
    { icon: Maximize, label: 'Superficie', value: `${property.area} m²` },
  ];

  return (
    <>
      <section className="border-b border-border bg-secondary/40 py-5">
        <div className="container-x flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-primary">Accueil</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to="/biens" className="transition-colors hover:text-primary">Biens immobiliers</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-navy">{property.neighborhood}</span>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="container-x">
          <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-navy px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                  {TRANSACTION_LABEL[property.transaction]}
                </span>
                <span className="rounded-full bg-accent px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-accent-foreground">
                  {STATUS_LABEL[property.status]}
                </span>
              </div>

              <h1 className="mt-4 font-heading text-2xl font-extrabold leading-tight tracking-tight text-navy text-balance sm:text-3xl lg:text-4xl">
                {property.title}
              </h1>
              <p className="mt-3 flex items-center gap-2 text-sm font-medium text-primary">
                <MapPin className="h-4 w-4" />
                {property.neighborhood} · {property.city} · {property.region}
              </p>

              <div className="mt-7 overflow-hidden rounded-2xl border border-border bg-card">
                <Dialog>
                  <DialogTrigger asChild>
                    <button type="button" className="block w-full cursor-zoom-in">
                      <Image
                        src={property.images[active]}
                        alt={property.title}
                        className="aspect-[16/10] w-full"
                      />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl border-none bg-transparent p-0 shadow-none">
                    <Image
                      src={property.images[active]}
                      alt={property.title}
                      className="max-h-[80vh] w-full rounded-xl"
                      fittingType="fit"
                    />
                  </DialogContent>
                </Dialog>
              </div>

              {property.images.length > 1 && (
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {property.images.map((img, i) => (
                    <button
                      key={img}
                      type="button"
                      onClick={() => setActive(i)}
                      className={`overflow-hidden rounded-xl border-2 transition-all ${
                        active === i ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Image src={img} alt={`${property.title} — photo ${i + 1}`} className="aspect-[4/3] w-full" />
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {specs.map((s) => (
                  <div key={s.label} className="rounded-xl border border-border bg-card p-4 text-center">
                    <s.icon className="mx-auto h-5 w-5 text-primary" />
                    <p className="mt-2 font-heading text-base font-bold text-navy">{s.value}</p>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <h2 className="font-heading text-xl font-bold text-navy">Description</h2>
                <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-muted-foreground">
                  {property.description}
                </p>
              </div>

              <div className="mt-10">
                <h2 className="font-heading text-xl font-bold text-navy">Équipements & atouts</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {property.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Prix</p>
                <p className="mt-1 font-heading text-3xl font-extrabold text-navy">{formatPrice(property.price)}</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Tag className="h-3.5 w-3.5" /> {property.terms}
                </p>

                <div className="my-6 h-px gold-rule" />

                <ContactButtons property={property} stacked />

                <Button asChild variant="outline" className="mt-3 w-full border-primary/25 text-primary hover:bg-primary/5">
                  <a href={waLink(visitMessage, property.contact.replace('+', ''))} target="_blank" rel="noopener noreferrer">
                    <CalendarCheck className="mr-2 h-4 w-4" /> Demander une visite
                  </a>
                </Button>

                <div className="mt-6 space-y-3 border-t border-border pt-6 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Informations de contact
                  </p>
                  <a href={telLink(property.contact)} className="flex items-center gap-2.5 text-foreground transition-colors hover:text-primary">
                    <Phone className="h-4 w-4 text-primary" /> {property.contact.replace('+237', '').replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4')}
                  </a>
                  <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-2.5 text-foreground transition-colors hover:text-primary">
                    <Mail className="h-4 w-4 text-primary" /> {CONTACT.email}
                  </a>
                  <p className="flex items-start gap-2.5 text-muted-foreground">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {CONTACT.hq}
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-border bg-secondary/40 py-16">
          <div className="container-x">
            <h2 className="font-heading text-2xl font-bold text-navy">Biens similaires</h2>
            <div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.06}>
                  <PropertyCard property={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}