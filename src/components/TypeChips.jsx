const CHIPS = [
  { label: 'Tous les biens', value: '' },
  { label: 'Appartements', value: 'Appartement' },
  { label: 'Studios', value: 'Studio' },
  { label: 'Chambres', value: 'Chambre' },
  { label: 'Terrains', value: 'Terrain' },
  { label: 'Maisons', value: 'Maison' },
  { label: 'Locaux', value: 'Local' },
  { label: 'Événementiel', value: 'Salle des fêtes' },
];

export default function TypeChips({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {CHIPS.map((c) => {
        const active = (value || '') === c.value;
        return (
          <button
            key={c.label}
            type="button"
            onClick={() => onChange(c.value)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${
              active
                ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                : 'border-border bg-card text-foreground hover:border-primary/40 hover:text-primary'
            }`}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}