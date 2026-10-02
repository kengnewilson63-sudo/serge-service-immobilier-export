import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NEIGHBORHOODS, PROPERTY_TYPES, TRANSACTIONS } from '@/data/site';

const selectClass =
  'h-12 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15';

export default function HeroSearch() {
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState('');
  const [type, setType] = useState('');
  const [quartier, setQuartier] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (transaction) params.set('transaction', transaction);
    if (type) params.set('type', type);
    if (quartier) params.set('quartier', quartier);
    navigate(`/biens${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <form
      onSubmit={submit}
      className="grid w-full gap-3 rounded-2xl border border-white/20 bg-white/95 p-4 shadow-2xl backdrop-blur sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end"
    >
      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Transaction</span>
        <select value={transaction} onChange={(e) => setTransaction(e.target.value)} className={selectClass}>
          <option value="">Location / Vente</option>
          {TRANSACTIONS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Type de bien</span>
        <select value={type} onChange={(e) => setType(e.target.value)} className={selectClass}>
          <option value="">Tous les types</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Quartier</span>
        <select value={quartier} onChange={(e) => setQuartier(e.target.value)} className={selectClass}>
          <option value="">Tous les quartiers</option>
          {NEIGHBORHOODS.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </label>

      <Button type="submit" size="lg" className="h-12 bg-primary text-primary-foreground hover:bg-primary/90">
        <Search className="mr-2 h-4 w-4" /> Rechercher
      </Button>
    </form>
  );
}