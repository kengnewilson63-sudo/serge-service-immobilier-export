import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import PageHero from '@/components/PageHero';
import PropertyCard from '@/components/PropertyCard';
import PropertyFilters from '@/components/PropertyFilters';
import Reveal from '@/components/Reveal';
import { Button } from '@/components/ui/button';
import { PROPERTIES } from '@/data/properties';

const unique = (key) => [...new Set(PROPERTIES.map((p) => p[key]))].sort();

const EMPTY = {
  keyword: '',
  transaction: '',
  type: '',
  region: '',
  city: '',
  neighborhood: '',
  maxPrice: '',
  rooms: '',
  minArea: '',
  status: '',
};

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = {
    keyword: searchParams.get('q') || '',
    transaction: searchParams.get('transaction') || '',
    type: searchParams.get('type') || '',
    region: searchParams.get('region') || '',
    city: searchParams.get('ville') || '',
    neighborhood: searchParams.get('quartier') || '',
    maxPrice: searchParams.get('budget') || '',
    rooms: searchParams.get('chambres') || '',
    minArea: searchParams.get('superficie') || '',
    status: searchParams.get('statut') || '',
  };

  const update = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  const reset = () => setSearchParams(new URLSearchParams(), { replace: true });

  const options = useMemo(
    () => ({
      types: unique('type'),
      regions: unique('region'),
      cities: unique('city'),
      neighborhoods: unique('neighborhood'),
    }),
    []
  );

  const results = useMemo(() => {
    const kw = filters.keyword.trim().toLowerCase();
    return PROPERTIES.filter((p) => {
      if (filters.transaction && p.transaction !== filters.transaction) return false;
      if (filters.type && p.type !== filters.type) return false;
      if (filters.region && p.region !== filters.region) return false;
      if (filters.city && p.city !== filters.city) return false;
      if (filters.neighborhood && p.neighborhood !== filters.neighborhood) return false;
      if (filters.maxPrice && p.price > Number(filters.maxPrice)) return false;
      if (filters.rooms && p.rooms < Number(filters.rooms)) return false;
      if (filters.minArea && p.area < Number(filters.minArea)) return false;
      if (filters.status && p.status !== filters.status) return false;
      if (kw) {
        const haystack = [p.title, p.type, p.neighborhood, p.city, p.description, ...p.features]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(kw)) return false;
      }
      return true;
    });
  }, [filters.keyword, filters.transaction, filters.type, filters.region, filters.city, filters.neighborhood, filters.maxPrice, filters.rooms, filters.minArea, filters.status]);

  return (
    <>
      <PageHero
        breadcrumb="Biens immobiliers"
        eyebrow="Notre catalogue"
        title="Tous nos biens immobiliers à Douala"
        subtitle="Appartements, studios, chambres meublées, duplex, terrains et locaux commerciaux. Filtrez selon vos critères et trouvez le bien qui vous correspond."
      />

      <section className="bg-secondary/40 py-12 sm:py-16">
        <div className="container-x">
          <PropertyFilters filters={filters} onChange={update} onReset={reset} options={options} />

          <div className="mt-10 flex items-baseline justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-heading text-lg font-bold text-navy">{results.length}</span>{' '}
              bien{results.length > 1 ? 's' : ''} correspondant à votre recherche
            </p>
          </div>

          {results.length === 0 ? (
            <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-border bg-card py-20 text-center">
              <SearchX className="h-10 w-10 text-muted-foreground" />
              <h3 className="mt-4 font-heading text-lg font-semibold text-navy">Aucun bien ne correspond</h3>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Essayez d'élargir vos critères ou réinitialisez les filtres pour voir l'ensemble du catalogue.
              </p>
              <Button onClick={reset} className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90">
                Réinitialiser les filtres
              </Button>
            </div>
          ) : (
            <div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((property, i) => (
                <Reveal key={property.id} delay={Math.min(i, 6) * 0.05}>
                  <PropertyCard property={property} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}