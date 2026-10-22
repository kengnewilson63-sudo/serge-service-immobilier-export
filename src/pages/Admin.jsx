import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Loader2, Lock, LogIn, LogOut, Pencil, Plus, ShieldAlert, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { isAdminUser } from '@/lib/user-role';
import { Button } from '@/components/ui/button';
import PropertyForm from '@/components/admin/PropertyForm';
import SeoTools from '@/components/admin/SeoTools';
import UsersPanel from '@/components/admin/UsersPanel';
import { formatPrice } from '@/data/site';

const STATUS_LABEL = { disponible: 'Disponible', prise: 'Déjà prise', vendu: 'Vendu' };
const TRANSACTION_LABEL = { location: 'À louer', vente: 'À vendre', evenement: 'Événementiel' };

export default function Admin() {
  const { user, logout, navigateToLogin } = useAuth();
  const [records, setRecords] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const isAdmin = isAdminUser(user);

  const load = async () => {
    setLoading(true);
    try {
      const { items } = await base44.entities.Property.filter({}, { sort: '-created_date', limit: 200 });
      setRecords(items ?? []);
      // Toutes les annonces (y compris celles en cours de chargement) pour le sitemap SEO.
      setAllRecords(items ?? []);
    } catch (err) {
      console.error('Chargement des annonces impossible:', err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  if (!user) {
    return (
      <section className="container-x flex flex-col items-center py-28 text-center">
        <Lock className="h-10 w-10 text-primary" />
        <h1 className="mt-4 font-heading text-2xl font-bold text-navy">Espace réservé à l'agence</h1>
        <p className="mt-3 max-w-lg text-sm text-muted-foreground">
          Connectez-vous avec le compte administrateur de l'agence pour gérer les annonces.
        </p>
        <Button className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90" onClick={navigateToLogin}>
          <LogIn className="mr-2 h-4 w-4" /> Se connecter
        </Button>
      </section>
    );
  }

  if (!isAdmin) {
    return (
      <section className="container-x flex flex-col items-center py-28 text-center">
        <ShieldAlert className="h-10 w-10 text-primary" />
        <h1 className="mt-4 font-heading text-2xl font-bold text-navy">Espace réservé à l'agence</h1>
        <p className="mt-3 max-w-lg text-sm text-muted-foreground">
          Vous êtes connecté avec <span className="font-medium text-navy">{user.email || user.full_name}</span>, mais ce
          compte n'a pas encore les droits d'administration. Demandez à ce que ce compte soit passé en « administrateur »,
          puis rechargez cette page.
        </p>
        <p className="mt-4 max-w-lg rounded-xl border border-dashed border-border bg-card px-4 py-3 text-xs text-muted-foreground">
          En local (<code>base44 dev</code>), les données et les comptes sont en mémoire : les rôles de votre app
          hébergée ne s'appliquent pas. Utilisez <code>base44 dev --remote</code> pour vous connecter avec le vrai compte
          administrateur.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => logout(true)}>
          <LogOut className="mr-2 h-4 w-4" /> Se déconnecter
        </Button>
      </section>
    );
  }

  const handleDelete = async (record) => {
    if (!window.confirm(`Supprimer définitivement « ${record.title} » ?`)) return;
    setBusyId(record.id);
    try {
      await base44.entities.Property.delete(record.id);
      setRecords((prev) => prev.filter((r) => r.id !== record.id));
    } catch (err) {
      console.error('Suppression impossible:', err);
      window.alert(
        err?.data?.message || err?.response?.data?.message || err?.message || 'La suppression a échoué.'
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleSaved = () => {
    setEditing(null);
    load();
  };

  return (
    <section className="bg-secondary/40 py-10 sm:py-14">
      <SeoTools records={allRecords} />
      <UsersPanel />
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Espace agence</p>
            <h1 className="mt-2 font-heading text-2xl font-bold text-navy sm:text-3xl">
              Gestion des annonces
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Ajoutez, modifiez ou retirez les biens affichés sur le site. Les changements sont visibles
              immédiatement.
            </p>
          </div>
          {!editing && (
            <Button
              onClick={() => setEditing('new')}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" /> Nouvelle annonce
            </Button>
          )}
        </div>

        {editing && (
          <div className="mt-8">
            <PropertyForm
              key={editing === 'new' ? 'new' : editing.id}
              record={editing === 'new' ? null : editing}
              onSaved={handleSaved}
              onCancel={() => setEditing(null)}
            />
          </div>
        )}

        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="font-heading text-base font-semibold text-navy">
              {loading ? 'Chargement…' : `${records.length} annonce${records.length > 1 ? 's' : ''}`}
            </h2>
            <button
              type="button"
              onClick={() => logout(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <LogOut className="h-3.5 w-3.5" /> Se déconnecter
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : records.length === 0 ? (
            <p className="px-6 py-16 text-center text-sm text-muted-foreground">
              Aucune annonce pour le moment. Cliquez sur « Nouvelle annonce » pour publier la première.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {records.map((record) => (
                <li key={record.id} className="flex flex-wrap items-center gap-4 px-6 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-heading text-sm font-semibold text-navy">{record.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {record.type} · {record.neighborhood || '—'} · {formatPrice(record.price)} ·{' '}
                      {TRANSACTION_LABEL[record.transaction] || record.transaction}
                      {record.status !== 'disponible' && ` · ${STATUS_LABEL[record.status]}`}
                      {record.featured && ' · en vedette'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                      <Link to={`/biens/${record.slug}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditing(record)}
                      className="border-primary/25 text-primary hover:bg-primary/5"
                    >
                      <Pencil className="mr-1.5 h-3.5 w-3.5" /> Modifier
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={busyId === record.id}
                      onClick={() => handleDelete(record)}
                      className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      {busyId === record.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}