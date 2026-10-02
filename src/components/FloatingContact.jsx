import { MessageCircle, Phone } from 'lucide-react';
import { PRIMARY, telLink, waLink } from '@/data/site';

export default function FloatingContact() {
  return (
    <div className="fixed bottom-5 right-4 z-40 flex flex-col gap-3 sm:bottom-7 sm:right-7">
      <a
        href={waLink('Bonjour Serge Service Immobilier, je souhaiterais des informations.')}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contacter sur WhatsApp"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition-transform hover:scale-105"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
      <a
        href={telLink(PRIMARY.tel)}
        aria-label="Appeler l'agence"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-black/20 transition-transform hover:scale-105"
      >
        <Phone className="h-6 w-6" />
      </a>
    </div>
  );
}