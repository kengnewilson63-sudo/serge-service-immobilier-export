import { Image } from '@/components/ui/image';
import { SITE } from '@/data/site';

export default function Logo({ size = 'h-12 w-12', className = '' }) {
  return (
    <span className={`${size} ${className} shrink-0 overflow-hidden rounded-full bg-white ring-1 ring-primary/20 shadow-sm`}>
      <Image
        src={SITE.logo}
        alt={`Logo ${SITE.name}`}
        className="h-full w-full object-cover"
      />
    </span>
  );
}