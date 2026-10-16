import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, SearchX } from 'lucide-react';
import PageHero from '@/components/PageHero';
import PropertyCard from '@/components/PropertyCard';
import PropertyFilters from '@/components/PropertyFilters';
import TypeChips from '@/components/TypeChips';
import Reveal from '@/components/Reveal';
import { Button } from '@/components/ui/button';
import Seo from '@/components/Seo';
import { PROPERTIES_PAGE_JSON_LD, OG_IMAGE, breadcrumbJsonLd, listingsJsonLd } from '@/lib/seo';
import { PAGE_SIZE, countProperties, fetchFilterOptions, fetchProperties } from '@/lib/properties';

const EMPTY_OPTIONS = { types: [], regions: [], cities: [], neighborhoods: [] };

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryKey = searchParams.toString();

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

  const [options, setOptions] = useState(EMPTY_OPTIONS);
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const resultsRef = useRef(null);

  const update = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  const reset = () => setSearchParams(new URLSearchParams(), { replace: true });

  const selectType = (value) => {
    update('type', value);
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  useEffect(() => {
    fetchFilterOptions().then(setOptions);
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    Promise.all([fetchProperties(filters, { limit: PAGE_SIZE }), countProperties(filters)]).then(
      ([page, count]) => {
        if (!alive) return;
        setResults(page.items);
        setCursor(page.next_cursor);
        setHasMore(page.has_more);
        setTotal(count);
        setLoading(false);
      }
    );
    return () => {
      alive = false;
    };
  }, [queryKey]);

  const loadMore = async () => {
    setLoadingMore(true);
    const page = await fetchProperties(filters, { limit: PAGE_SIZE, cursor });
    setResults((prev) => [...prev, ...page.items]);
    setCursor(page.next_cursor);
    setHasMore(page.has_more);
    setLoadingMore(false);
  };

  return (
    <>
      <Seo
        title="Biens immobiliers à louer et à vendre à Douala | Serge Service Immobilier"
        description="Catalogue de biens à Douala : appartements, studios, chambres meublées, duplex, maisons, villas, terrains et locaux commerciaux. Filtrez par quartier (Makepe, Logpom, Bonamoussadi, Kotto), budget et type de bien."
        keywords="biens immobiliers Douala, appartement à louer Douala, studio à louer Douala, chambre meublée Douala, duplex Douala, maison à vendre Douala, villa Douala, terrain à vendre Douala, local commercial Douala, salle des fêtes Douala"
        image={OG_IMAGE.biens}
        path="/biens"
        jsonLd={[
          PROPERTIES_PAGE_JSON_LD,
          listingsJsonLd(results),
          breadcrumbJsonLd([
            { name: 'Accueil', path: '/' },
            { name: 'Biens immobiliers', path: '/biens' },
          ]),
        ]}
      />
      <PageHero
        breadcrumb="Biens immobiliers"
        eyebrow="Notre catalogue"
        title="Tous nos biens immobiliers à Douala"
        subtitle="Appartements, studios, chambres meublées, duplex, terrains et locaux commerciaux. Filtrez selon vos critères et trouvez le bien qui vous correspond."
      />

      <section className="bg-secondary/40 py-12 sm:py-16">
        <div className="container-x">
          <div className="mb-6">
            <TypeChips value={filters.type} onChange={selectType} />
          </div>
          <PropertyFilters filters={filters} onChange={update} onReset={reset} options={options} />

          <div ref={resultsRef} className="mt-10 scroll-mt-28">
            <p className="text-sm text-muted-foreground">
              <span className="font-heading text-lg font-bold text-navy">{total}</span>{' '}
              bien{total > 1 ? 's' : ''} correspondant à votre recherche
            </p>
          </div>

          {loading ? (
            <div className="mt-10 flex justify-center py-16">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          ) : results.length === 0 ? (
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
            <>
              <div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((property, i) => (
                  <Reveal key={property.recordId} delay={Math.min(i, 6) * 0.05}>
                    <PropertyCard property={property} />
                  </Reveal>
                ))}
              </div>

              {hasMore && (
                <div className="mt-10 flex justify-center">
                  <Button
                    onClick={loadMore}
                    disabled={loadingMore}
                    variant="outline"
                    className="border-primary/25 text-primary hover:bg-primary/5"
                  >
                    {loadingMore && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Afficher plus de biens
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}