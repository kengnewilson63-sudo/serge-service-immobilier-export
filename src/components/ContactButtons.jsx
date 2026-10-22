import { MessageCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PRIMARY, telLink, waLink } from '@/data/site';

const defaultMessage =
  "Bonjour Serge Service Immobilier, je vous contacte via votre site. Je souhaiterais avoir des informations.";

/**
 * @param {{ property?: any, className?: string, size?: 'default'|'sm'|'lg'|'icon', stacked?: boolean }} props
 */
export default function ContactButtons({ property, className = '', size = 'default', stacked = false }) {
  const message = property
    ? `Bonjour, je suis intéressé(e) par « ${property.title} » situé à ${property.neighborhood}, ${property.city}, affiché à ${property.priceLabel}. Je souhaiterais avoir plus d'informations.`
    : defaultMessage;

  return (
    <div className={`flex gap-3 ${stacked ? 'flex-col' : 'flex-col sm:flex-row'} ${className}`}>
      <Button asChild size={size} className="bg-[#25D366] text-white hover:bg-[#1da851] shadow-sm">
        <a href={waLink(message)} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="mr-2 h-4 w-4" />
          WhatsApp
        </a>
      </Button>
      <Button asChild size={size} variant="outline" className="border-primary/25 text-primary hover:bg-primary/5">
        <a href={telLink(property?.contact || PRIMARY.tel)}>
          <Phone className="mr-2 h-4 w-4" />
          Appeler
        </a>
      </Button>
    </div>
  );
}