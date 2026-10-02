import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, MessageCircle, Phone, X } from 'lucide-react';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { NAV_LINKS, PRIMARY, SITE, telLink, waLink } from '@/data/site';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        scrolled ? 'border-border bg-white/95 shadow-sm backdrop-blur-md' : 'border-transparent bg-white'
      }`}
    >
      <div className="container-x flex h-20 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3">
          <Logo size="h-12 w-12" />
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="font-heading text-sm font-bold uppercase tracking-wide text-navy lg:text-base">
              {SITE.name}
            </span>
            <span className="text-[11px] font-medium italic text-primary">{SITE.slogan}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary/8 text-primary' : 'text-navy/75 hover:bg-secondary hover:text-navy'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={telLink(PRIMARY.tel)}
            className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-navy transition-colors hover:text-primary xl:flex"
          >
            <Phone className="h-4 w-4 text-primary" />
            {PRIMARY.label}
          </a>
          <Button asChild className="hidden bg-[#25D366] text-white hover:bg-[#1da851] sm:inline-flex">
            <a href={waLink('Bonjour Serge Service Immobilier, je souhaiterais des informations.')} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-4 w-4" />
              WhatsApp
            </a>
          </Button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Ouvrir le menu"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border text-navy lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-border bg-white lg:hidden"
          >
            <div className="container-x flex flex-col gap-1 py-5">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `rounded-lg px-4 py-3 text-base font-medium ${
                      isActive ? 'bg-primary/8 text-primary' : 'text-navy hover:bg-secondary'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="mt-3 flex flex-col gap-3 border-t border-border pt-5">
                <Button asChild className="bg-[#25D366] text-white hover:bg-[#1da851]">
                  <a href={waLink('Bonjour Serge Service Immobilier, je souhaiterais des informations.')} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                  </a>
                </Button>
                <Button asChild variant="outline" className="border-primary/25 text-primary">
                  <a href={telLink(PRIMARY.tel)}>
                    <Phone className="mr-2 h-4 w-4" /> {PRIMARY.label}
                  </a>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}