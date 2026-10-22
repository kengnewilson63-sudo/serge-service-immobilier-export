import { useEffect, useState } from 'react';
import { ImagePlus, Loader2, Trash2, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Image } from '@/components/ui/image';
import { NEIGHBORHOODS, PROPERTY_TYPES, STATUSES, TRANSACTIONS } from '@/data/site';

const slugify = (value) =>
  String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);

/**
 * @param {{ label?: string, hint?: string, children?: React.ReactNode, className?: string }} props
 */
const Field = ({ label, hint, children, className = '' }) => (
  <label className={`flex flex-col gap-1.5 ${className}`}>
    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
    {children}
    {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
  </label>
);

const selectClass =
  'h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15';

export default function PropertyForm({ record, onSaved, onCancel }) {
  const [form, setForm] = useState(() => ({
    title: record?.title || '',
    type: record?.type || 'Appartement',
    transaction: record?.transaction || 'location',
    status: record?.status || 'disponible',
    featured: !!record?.featured,
    region: record?.region || 'Littoral',
    city: record?.city || 'Douala',
    neighborhood: record?.neighborhood || '',
    price: record?.price ?? '',
    terms: record?.terms || '',
    rooms: record?.rooms ?? 0,
    bathrooms: record?.bathrooms ?? 0,
    area: record?.area ?? 0,
    contact: record?.contact || '+237681284514',
    description: record?.description || '',
    features: (Array.isArray(record?.features) ? record.features : []).join('\n'),
    images: Array.isArray(record?.images) ? record.images : [],
  }));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Options des menus, enrichies avec la valeur actuelle du bien si elle n'est pas
  // dans la liste (données importées / ancien format). Sinon le <select> n'afficherait
  // aucune option sélectionnée et l'enregistrement serait refusé par le schéma.
  const typeOptions = Array.from(new Set([...PROPERTY_TYPES, form.type].filter(Boolean)));
  const transactionOptions = TRANSACTIONS.some((t) => t.value === form.transaction)
    ? TRANSACTIONS
    : [...TRANSACTIONS, { value: form.transaction, label: form.transaction }];
  const statusOptions = STATUSES.some((s) => s.value === form.status)
    ? STATUSES
    : [...STATUSES, { value: form.status, label: form.status }];

  // Réinitialise le formulaire quand on passe d'un bien à un autre (ou à « nouvelle annonce »),
  // sinon les valeurs du bien précédent restent affichées.
  useEffect(() => {
    setForm({
      title: record?.title || '',
      type: record?.type || 'Appartement',
      transaction: record?.transaction || 'location',
      status: record?.status || 'disponible',
      featured: !!record?.featured,
      region: record?.region || 'Littoral',
      city: record?.city || 'Douala',
      neighborhood: record?.neighborhood || '',
      price: record?.price ?? '',
      terms: record?.terms || '',
      rooms: record?.rooms ?? 0,
      bathrooms: record?.bathrooms ?? 0,
      area: record?.area ?? 0,
      contact: record?.contact || '+237681284514',
      description: record?.description || '',
      features: (Array.isArray(record?.features) ? record.features : []).join('\n'),
      images: Array.isArray(record?.images) ? record.images : [],
    });
    setError('');
  }, [record]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const setImage = (index, value) =>
    setForm((f) => ({ ...f, images: f.images.map((img, i) => (i === index ? value : img)) }));
  const addImage = () => setForm((f) => ({ ...f, images: [...f.images, ''] }));
  const removeImage = (index) =>
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));

  const uploadImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm((f) => ({ ...f, images: [...f.images, file_url] }));
    } catch (err) {
      console.error("Upload d'image impossible:", err);
      setError(
        err?.data?.message || err?.response?.data?.message || err?.message || "L'image n'a pas pu être envoyée."
      );
    } finally {
      setUploading(false);
    }
  };

  /**
   * Trouve un slug libre. `ignoreId` exclut le bien en cours d'édition, sinon on
   * se compare à soi-même et le slug renvoyé provoque un conflit à l'enregistrement.
   * On ne renomme jamais un bien qui possède déjà un slug unique (l'URL publique
   * doit rester stable), on n'ajoute un suffixe qu'en cas de vrai conflit.
   */
  const uniqueSlug = async (base, ignoreId) => {
    const root = base || 'bien';

    // Vérifie si le slug de base est libre pour ce bien.
    const isFree = async (candidate) => {
      const { items } = await base44.entities.Property.filter(
        { slug: candidate },
        { limit: 50, fields: ['id', 'slug'] }
      );
      return !(items ?? []).some((item) => String(item.id) !== String(ignoreId));
    };

    if (await isFree(root)) return root;

    for (let n = 2; n < 50; n += 1) {
      const candidate = `${root}-${n}`;
      if (await isFree(candidate)) return candidate;
    }
    return `${root}-${Date.now().toString(36)}`;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!form.title.trim()) {
      setError('Le titre de l’annonce est obligatoire.');
      return;
    }
    setSaving(true);
    try {
      const baseSlug = record?.slug || slugify(form.title);
      const payload = {
        slug: await uniqueSlug(baseSlug, record?.id),
        title: form.title.trim(),
        type: form.type,
        transaction: form.transaction,
        status: form.status,
        featured: form.featured,
        region: String(form.region ?? '').trim(),
        city: String(form.city ?? '').trim(),
        neighborhood: String(form.neighborhood ?? '').trim(),
        price: Number(form.price) || 0,
        terms: String(form.terms ?? '').trim(),
        rooms: Number(form.rooms) || 0,
        bathrooms: Number(form.bathrooms) || 0,
        area: Number(form.area) || 0,
        contact: String(form.contact ?? '').trim(),
        description: String(form.description ?? '').trim(),
        features: String(form.features ?? '')
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        images: (Array.isArray(form.images) ? form.images : [])
          .map((s) => String(s ?? '').trim())
          .filter(Boolean),
        position: record?.position ?? 0,
      };

      if (record) await base44.entities.Property.update(record.id, payload);
      else await base44.entities.Property.create(payload);
      onSaved();
    } catch (err) {
      console.error("Enregistrement de l'annonce impossible:", err);
      let msg =
        err?.data?.message ||
        err?.response?.data?.message ||
        err?.message ||
        "L'enregistrement a échoué.";
      if (err?.status === 401 || err?.status === 403) {
        msg =
          "Votre session n'est plus valide (ou ce compte n'est pas administrateur). " +
          'Déconnectez-vous, reconnectez-vous puis republiez l’annonce.';
      } else if (err?.status === 404) {
        msg = "Cette annonce n'existe plus sur le serveur. Rechargez la page puis recommencez.";
      }
      setError(msg);
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-bold text-navy">
          {record ? 'Modifier l’annonce' : 'Nouvelle annonce'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-navy"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Titre de l'annonce" className="sm:col-span-2 lg:col-span-3">
          <Input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Appartement 3 chambres — Makepe" />
        </Field>

        <Field label="Type de bien">
          <select className={selectClass} value={form.type} onChange={(e) => set('type', e.target.value)}>
            {typeOptions.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </Field>

        <Field label="Transaction">
          <select className={selectClass} value={form.transaction} onChange={(e) => set('transaction', e.target.value)}>
            {transactionOptions.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </Field>

        <Field label="Disponibilité">
          <select className={selectClass} value={form.status} onChange={(e) => set('status', e.target.value)}>
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </Field>

        <Field label="Quartier">
          <Input
            value={form.neighborhood}
            onChange={(e) => set('neighborhood', e.target.value)}
            placeholder="Makepe"
            list="admin-neighborhoods"
          />
          <datalist id="admin-neighborhoods">
            {NEIGHBORHOODS.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
        </Field>

        <Field label="Ville">
          <Input value={form.city} onChange={(e) => set('city', e.target.value)} />
        </Field>

        <Field label="Région">
          <Input value={form.region} onChange={(e) => set('region', e.target.value)} />
        </Field>

        <Field label="Prix (FCFA)" hint="Sans espaces ni points.">
          <Input type="number" value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="200000" />
        </Field>

        <Field label="Conditions" hint="Ex. : 6 mois + 2 cautions">
          <Input value={form.terms} onChange={(e) => set('terms', e.target.value)} />
        </Field>

        <Field label="Téléphone de contact">
          <Input value={form.contact} onChange={(e) => set('contact', e.target.value)} placeholder="+237681284514" />
        </Field>

        <Field label="Chambres">
          <Input type="number" value={form.rooms} onChange={(e) => set('rooms', e.target.value)} />
        </Field>

        <Field label="Salles d'eau">
          <Input type="number" value={form.bathrooms} onChange={(e) => set('bathrooms', e.target.value)} />
        </Field>

        <Field label="Superficie (m²)">
          <Input type="number" value={form.area} onChange={(e) => set('area', e.target.value)} />
        </Field>
      </div>

      <div className="mt-4 flex items-center gap-2.5">
        <input
          id="featured"
          type="checkbox"
          checked={form.featured}
          onChange={(e) => set('featured', e.target.checked)}
          className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
        />
        <label htmlFor="featured" className="text-sm font-medium text-foreground">
          Mettre en vedette sur la page d'accueil
        </label>
      </div>

      <div className="mt-5">
        <Field label="Description">
          <Textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={5}
            placeholder="Décrivez le bien, son emplacement et ses atouts…"
          />
        </Field>
      </div>

      <div className="mt-5">
        <Field label="Équipements & atouts" hint="Un élément par ligne.">
          <Textarea
            value={form.features}
            onChange={(e) => set('features', e.target.value)}
            rows={6}
            placeholder={'3 chambres avec placards\n2 douches\nParking'}
          />
        </Field>
      </div>

      <div className="mt-6">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Photos</p>
        <div className="mt-3 space-y-3">
          {form.images.map((img, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-secondary">
                {img ? <Image src={img} alt="" className="h-full w-full" /> : null}
              </div>
              <Input value={img} onChange={(e) => setImage(i, e.target.value)} placeholder="Adresse de la photo" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                aria-label="Retirer la photo"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-3">
          <Button type="button" variant="outline" onClick={addImage} className="border-primary/25 text-primary hover:bg-primary/5">
            <ImagePlus className="mr-2 h-4 w-4" /> Ajouter un lien photo
          </Button>
          <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border border-primary/25 px-4 text-sm font-medium text-primary transition-colors hover:bg-primary/5">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            {uploading ? 'Envoi…' : 'Envoyer une photo'}
            <input type="file" accept="image/*" className="hidden" onChange={uploadImage} disabled={uploading} />
          </label>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Les photos envoyées sont stockées publiquement — toute personne disposant du lien peut les ouvrir.
        </p>
      </div>

      {error && (
        <p className="mt-5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button type="submit" disabled={saving || uploading} className="bg-primary text-primary-foreground hover:bg-primary/90">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {record ? 'Enregistrer les modifications' : "Publier l'annonce"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Annuler
        </Button>
      </div>
    </form>
  );
}