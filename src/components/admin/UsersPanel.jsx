import { useEffect, useState } from 'react';
import { Check, Loader2, ShieldCheck, UserPlus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const selectClass =
  'h-9 rounded-lg border border-input bg-background px-2 text-xs text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/15';

/**
 * Comptes autorisés à se connecter. Seuls les ADMIN peuvent publier des annonces ;
 * un USER peut se connecter mais n'a aucun droit sur le catalogue.
 * Tout est vérifié côté serveur (/api/admin/users, réservé aux ADMIN).
 */
export default function UsersPanel() {
  const [users, setUsers] = useState(/** @type {any[]} */ ([]));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'ADMIN' });

  const load = async () => {
    setLoading(true);
    try {
      const items = await base44.adminUsers.list();
      setUsers(Array.isArray(items) ? items : []);
    } catch (err) {
      setError(err?.data?.message || err?.message || 'Impossible de charger les comptes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      await base44.adminUsers.create(form);
      setForm({ fullName: '', email: '', password: '', role: 'ADMIN' });
      await load();
    } catch (err) {
      setError(err?.data?.message || err?.message || "La création du compte a échoué.");
    } finally {
      setSaving(false);
    }
  };

  const changeRole = async (/** @type {any} */ user, role) => {
    setError('');
    try {
      await base44.adminUsers.changeRole(user.id, role);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role } : u)));
    } catch (err) {
      setError(err?.data?.message || err?.message || 'Le changement de rôle a échoué.');
    }
  };

  return (
    <div className="container-x pb-2">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <h2 className="font-heading text-sm font-semibold text-navy">Comptes & accès</h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Seuls les comptes <strong>Administrateur</strong> peuvent publier, modifier ou supprimer
          des annonces. L'inscription publique est désactivée : créez l'accès ici.
        </p>

        <form onSubmit={create} className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <Input
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            placeholder="Nom"
            className="h-9"
          />
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="personne@exemple.com"
            required
            className="h-9"
          />
          <Input
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            placeholder="Mot de passe (8+)"
            required
            minLength={8}
            className="h-9"
          />
          <select
            className={selectClass}
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
          >
            <option value="ADMIN">Administrateur</option>
            <option value="USER">Simple (sans publication)</option>
          </select>
          <Button type="submit" size="sm" disabled={saving} className="h-9 bg-primary text-primary-foreground hover:bg-primary/90">
            {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <UserPlus className="mr-1.5 h-4 w-4" />}
            Créer l'accès
          </Button>
        </form>

        {error && (
          <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        )}

        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {users.map((/** @type {any} */ user) => (
              <li key={user.id} className="flex flex-wrap items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-navy">{user.fullName}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
                {user.role === 'ADMIN' && (
                  <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                    <Check className="h-3 w-3" /> Admin
                  </span>
                )}
                <select
                  className={selectClass}
                  value={user.role}
                  onChange={(e) => changeRole(user, e.target.value)}
                >
                  <option value="ADMIN">Administrateur</option>
                  <option value="USER">Simple</option>
                </select>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
