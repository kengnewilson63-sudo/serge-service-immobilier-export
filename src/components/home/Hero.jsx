import { motion } from 'framer-motion';
import { CheckCircle2, MapPin } from 'lucide-react';
import HeroSearch from '@/components/home/HeroSearch';
import { IMAGES, SITE } from '@/data/site';

const BG = IMAGES.hero;

export default function Hero() {
  return (
    <section className="relative flex min-h-[88vh] items-center overflow-hidden">
      <img src={BG} alt="Appartement moderne à Douala" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-deep/95 via-navy/85 to-navy/55" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/80 via-transparent to-transparent" />

      <div className="container-x relative z-10 py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            <MapPin className="h-3.5 w-3.5" /> Agence immobilière à Douala
          </span>

          <h1 className="mt-6 font-heading text-4xl font-extrabold leading-[1.08] tracking-tight text-white text-balance sm:text-5xl lg:text-6xl">
            Trouvez votre logement idéal à <span className="text-accent">Douala</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
            Appartements, studios et chambres meublées à louer — ainsi que terrains et maisons à vendre.
            Recherchez, comparez et contactez directement l'agence.
          </p>

          <p className="mt-4 font-heading text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
            {SITE.slogan}
          </p>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/75">
            {['Biens vérifiés', 'Visite organisée', 'Contact direct WhatsApp'].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent" /> {item}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 max-w-5xl"
        >
          <HeroSearch />
        </motion.div>
      </div>
    </section>
  );
}