import { Link } from 'react-router-dom';
import { Bath, BedDouble, MapPin, Maximize } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { IMAGES, formatPrice } from '@/data/site';
import { propertyPath } from '@/lib/properties';

const TRANSACTION_LABEL = { location: 'À louer', vente: 'À vendre', evenement: 'Événementiel' };
const STATUS_LABEL = { prise: 'Déjà prise', vendu: 'Vendu' };

export default function PropertyCard({ property }) {
  const unavailable = property.status !== 'disponible';
  return (
    <Link
      to={propertyPath(property)}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl">

      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={property.images?.[0] || IMAGES.fallback}
          alt={`${property.title} — ${TRANSACTION_LABEL[property.transaction]} à ${property.neighborhood}, Douala`}
          className="h-full w-full transition-transform duration-700 group-hover:scale-105"
        />
        
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <span className="rounded-full bg-navy/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur">
            {TRANSACTION_LABEL[property.transaction]}
          </span>
          {unavailable &&
          <span className="rounded-full bg-accent px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent-foreground">
              {STATUS_LABEL[property.status]}
            </span>
          }
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-primary">
          <MapPin className="h-3.5 w-3.5" />
          {property.neighborhood} · {property.city}
        </p>
        <h3 className="font-heading text-lg font-semibold leading-snug text-navy transition-colors group-hover:text-primary">
          {property.title}
        </h3>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
          <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
            {property.type}
          </span>
          {property.rooms > 0 &&
          <span className="flex items-center gap-1.5">
              <BedDouble className="h-4 w-4" /> {property.rooms}
            </span>
          }
          {property.bathrooms > 0 &&
          <span className="flex items-center gap-1.5">
              <Bath className="h-4 w-4" /> {property.bathrooms}
            </span>
          }
          <span className="flex items-center gap-1.5">
            <Maximize className="h-4 w-4" /> {property.area} m²
          </span>
        </div>

        <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
          <div>
            <p className="font-heading text-xl font-bold text-navy">{formatPrice(property.price)}</p>
            <p className="text-xs text-muted-foreground">{property.terms}</p>
          </div>
          <span className="text-sm font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
            Voir la fiche →
          </span>
        </div>
      </div>
    </Link>);

}