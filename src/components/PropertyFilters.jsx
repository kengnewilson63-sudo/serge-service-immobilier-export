import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TRANSACTIONS, STATUSES } from '@/data/site';

const Select = ({ label, value, onChange, options, placeholder }) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-11 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value ?? o} value={o.value ?? o}>
          {o.label ?? o}
        </option>
      ))}
    </select>
  </label>
);

export default function PropertyFilters({ filters, onChange, onReset, options }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-heading text-base font-semibold text-navy">
          <SlidersHorizontal className="h-4 w-4 text-primary" /> Affiner la recherche
        </h3>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <X className="h-3.5 w-3.5" /> Réinitialiser
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Mot-clé
          </span>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filters.keyword}
              onChange={(e) => onChange('q', e.target.value)}
              placeholder="Quartier, type de bien, équipement…"
              className="h-11 pl-9"
            />
          </div>
        </label>

        <Select
          label="Transaction"
          value={filters.transaction}
          onChange={(v) => onChange('transaction', v)}
          options={TRANSACTIONS}
          placeholder="Location / Vente / Événement"
        />
        <Select
          label="Type de bien"
          value={filters.type}
          onChange={(v) => onChange('type', v)}
          options={options.types}
          placeholder="Tous les types"
        />
        <Select
          label="Région"
          value={filters.region}
          onChange={(v) => onChange('region', v)}
          options={options.regions}
          placeholder="Toutes les régions"
        />
        <Select
          label="Ville"
          value={filters.city}
          onChange={(v) => onChange('city', v)}
          options={options.cities}
          placeholder="Toutes les villes"
        />
        <Select
          label="Quartier"
          value={filters.neighborhood}
          onChange={(v) => onChange('quartier', v)}
          options={options.neighborhoods}
          placeholder="Tous les quartiers"
        />
        <Select
          label="Budget maximum"
          value={filters.maxPrice}
          onChange={(v) => onChange('budget', v)}
          options={[
            { value: '200000', label: "Jusqu'à 200 000 FCFA" },
            { value: '350000', label: "Jusqu'à 350 000 FCFA" },
            { value: '1000000', label: "Jusqu'à 1 000 000 FCFA" },
            { value: '999999999', label: 'Plus de 1 000 000 FCFA' },
          ]}
          placeholder="Tous les budgets"
        />
        <Select
          label="Chambres"
          value={filters.rooms}
          onChange={(v) => onChange('chambres', v)}
          options={[
            { value: '1', label: '1 et plus' },
            { value: '2', label: '2 et plus' },
            { value: '3', label: '3 et plus' },
            { value: '4', label: '4 et plus' },
          ]}
          placeholder="Indifférent"
        />
        <Select
          label="Superficie"
          value={filters.minArea}
          onChange={(v) => onChange('superficie', v)}
          options={[
            { value: '50', label: '50 m² et plus' },
            { value: '100', label: '100 m² et plus' },
            { value: '150', label: '150 m² et plus' },
            { value: '200', label: '200 m² et plus' },
          ]}
          placeholder="Indifférent"
        />
        <Select
          label="Statut"
          value={filters.status}
          onChange={(v) => onChange('statut', v)}
          options={STATUSES}
          placeholder="Tous les statuts"
        />
      </div>

      <div className="mt-5 lg:hidden">
        <Button onClick={onReset} variant="outline" className="w-full">
          Réinitialiser les filtres
        </Button>
      </div>
    </div>
  );
}