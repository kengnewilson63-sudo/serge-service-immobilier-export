/**
 * En développement, le frontend tourne sur :5173 et le backend sur :8080.
 * En production, site et API partagent la même origine : on ne renvoie JAMAIS
 * http://localhost (le navigateur du visiteur tenterait d'appeler sa propre machine).
 */
const env = /** @type {any} */ (import.meta).env || {};
const configuredApi = String(env.VITE_API_BASE_URL || '').trim();

const API_BASE_URL = (
  configuredApi || (env.DEV ? 'http://localhost:8080' : '')
).replace(/\/+$/, '');
const TOKEN_KEY = 'ssi_access_token';

/** Les URLs renvoyées par le backend sont relatives (/uploads/xxx.jpg) : on les rend absolues. */
export const absoluteFileUrl = (url) => {
  if (!url) return '';
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  if (!API_BASE_URL) return url.startsWith('/') ? url : `/${url}`;
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

/** Ramène une URL d'un ancien upload base64 ou d'un autre hôte vers un chemin sauvegardé en base. */
const storedFileRef = (url) => {
  if (/^data:/i.test(url)) return url;
  if (API_BASE_URL && url.startsWith(API_BASE_URL)) return url.slice(API_BASE_URL.length);
  return url;
};

export const apiClient = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY) || '';
  },

  setToken(token) {
    if (!token) {
      localStorage.removeItem(TOKEN_KEY);
      return;
    }
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('base44_access_token');
    localStorage.removeItem('token');
  },

  async request(path, options = {}) {
    const token = this.getToken();
    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json') ? await response.json() : await response.text();

    if (!response.ok) {
      if (response.status === 401) {
        // Jeton expiré depuis un redémarrage du backend : on le retire pour
        // éviter d'envoyer indéfiniment un jeton invalide.
        this.clearToken();
      }
      const error = /** @type {Error & { status?: number, data?: any }} */ (
        new Error(payload?.message || payload?.error || `Request failed (${response.status})`)
      );
      error.status = response.status;
      error.data = payload;
      throw error;
    }

    return payload;
  },
};

const normalizePropertyFilter = (query = {}) => {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (key === '$or' || key === 'fields' || key === 'sort') return;

    if (Array.isArray(value)) {
      params.set(`${key}[]`, value.join(','));
      return;
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
      if (value.$lte !== undefined) {
        params.set('maxPrice', String(value.$lte));
        return;
      }
      if (value.$gte !== undefined) {
        if (key === 'rooms') params.set('rooms', String(value.$gte));
        else if (key === 'area') params.set('minArea', String(value.$gte));
        else params.set(key, String(value.$gte));
        return;
      }
      if (value.$in) {
        params.set(`${key}[]`, value.$in.join(','));
        return;
      }
      if (value.$ne !== undefined) {
        params.set(`${key}__ne`, String(value.$ne));
        return;
      }
      if (value.slug) {
        params.set('slug', String(value.slug));
        // Le serveur compare les slugs partiellement : `exact` évite qu'un bien
        // "villa-logpom" réponde pour "villa-logpom-2" (ce qui renommait l'annonce
        // à chaque sauvegarde avec un nouveau suffixe).
        params.set('exact', key);
        return;
      }
      return;
    }

    params.set(key, String(value));
  });

  return params;
};

/**
 * Réduit un bien envoyé au serveur aux seuls champs acceptés par son DTO.
 * Les objets renvoyés par l'API contiennent des champs calculés côté client
 * (priceLabel, recordId…), et des payloads complets (photos en base64 inclues)
 * sont souvent rejetés par le serveur.
 */
const PROPERTY_WRITE_FIELDS = [
  'id',
  'slug',
  'title',
  'type',
  'transaction',
  'status',
  'featured',
  'region',
  'city',
  'neighborhood',
  'price',
  'terms',
  'rooms',
  'bathrooms',
  'area',
  'contact',
  'description',
  'features',
  'images',
  'position',
];

const toWritePayload = (payload = {}) => {
  const out = {};
  PROPERTY_WRITE_FIELDS.forEach((key) => {
    if (payload[key] !== undefined) out[key] = payload[key];
  });
  if (Array.isArray(out.images)) {
    out.images = out.images.map(storedFileRef).filter((url) => typeof url === 'string' && url.trim());
    // Un bien peut recevoir jusqu'à 10 photos (galerie type annonce).
    out.images = out.images.slice(0, 10);
  }
  return out;
};

const buildPropertyListUrl = (query = {}, opts = {}) => {
  const params = normalizePropertyFilter(query);
  if (opts.limit) params.set('limit', String(opts.limit));
  if (opts.cursor !== undefined && opts.cursor !== null && opts.cursor !== '') {
    params.set('offset', String(opts.cursor));
  }
  if (opts.sort && opts.sort === '-created_date') {
    // L'admin liste les annonces les plus récentes d'abord.
    params.set('sort', 'recent');
  }
  if (query.distinct) {
    params.set('distinct', String(query.distinct));
  }
  return `/api/properties?${params.toString()}`;
};

export const base44 = {
  app: {
    async getPublicSettings() {
      return { id: 'local', public_settings: {} };
    },
  },
  auth: {
    async loginViaEmailPassword(email, password) {
      const result = await apiClient.request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      apiClient.setToken(result.token);
      return result;
    },

    async register(payload) {
      const result = /** @type {any} */ (await apiClient.request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: payload.fullName || payload.full_name || payload.name || 'Admin',
          email: payload.email,
          password: payload.password,
        }),
      }));
      apiClient.setToken(result.token);
      return result;
    },
    /**
     * Accès agence par code : e-mail + code d'accès (SETUP_CODE du backend).
     * Remplace l'ancien « code de vérification » qui affichait toujours 403.
     */
    async loginWithCode(email, code) {
      const result = /** @type {any} */ (await apiClient.request('/api/auth/link', {
        method: 'POST',
        body: JSON.stringify({ email, password: code }),
      }));
      apiClient.setToken(result.token);
      return result;
    },

    async me() {
      const result = await apiClient.request('/api/auth/me');
      return result;
    },

    async logout(redirectUrl) {
      apiClient.clearToken();
      if (redirectUrl) window.location.href = redirectUrl;
    },

    redirectToLogin(returnTo) {
      const next = returnTo ? `?next=${encodeURIComponent(returnTo)}` : '';
      window.location.href = `/login${next}`;
    },

    async resetPasswordRequest(email) {
      return apiClient.request('/api/auth/password-reset-request', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },

    async resetPassword({ resetToken, newPassword }) {
      return apiClient.request('/api/auth/password-reset', {
        method: 'POST',
        body: JSON.stringify({ resetToken, newPassword }),
      });
    },

    /** Non implémentés par le backend : signale l'absence au lieu de simuler un succès. */
    async verifyOtp(payload) {
      void payload;
      throw new Error("La vérification par code n'est pas activée. Connectez-vous directement.");
    },

    async resendOtp(email) {
      void email;
      throw new Error("L'envoi de code par e-mail n'est pas activé.");
    },

    loginWithProvider(provider, returnTo) {
      void provider;
      void returnTo;
      throw new Error("La connexion Google n'est pas configurée sur ce serveur.");
    },

    setToken(token) {
      apiClient.setToken(token);
    },
  },
  entities: {
    Property: {
      async filter(query = {}, options = {}) {
        const url = buildPropertyListUrl(query, options);
        const data = await apiClient.request(url);
        return {
          items: Array.isArray(data.items) ? data.items : [],
          total: data.total ?? (Array.isArray(data.items) ? data.items.length : 0),
          next_cursor: data.next_cursor ?? null,
          has_more: !!data.has_more,
        };
      },

      async count(query = {}) {
        const data = await apiClient.request(buildPropertyListUrl(query, { limit: 1 }));
        return Number(data.total ?? data.items?.length ?? 0);
      },

      async list(options = {}) {
        if (options.distinct) {
          const data = await apiClient.request(buildPropertyListUrl({}, { limit: 2000 }));
          const values = new Set();
          (data.items || []).forEach((item) => {
            const value = item[options.distinct];
            if (value) values.add(value);
          });
          return { items: [...values].sort((a, b) => String(a).localeCompare(String(b), 'fr')) };
        }
        const data = await apiClient.request(buildPropertyListUrl({}, { limit: 2000 }));
        // Ramène les URL absolues du backend à des chemins relatifs avant sauvegarde.
        const items = (data.items || []).map((item) => ({
          ...item,
          images: Array.isArray(item.images) ? item.images.map(storedFileRef) : item.images,
        }));
        return { items, total: data.total ?? items.length };
      },

      async aggregate({ query = {}, groupBy, limit = 10 } = /** @type {{ query?: any, groupBy?: string, limit?: number, sort?: string }} */ ({})) {
        const data = await apiClient.request(buildPropertyListUrl(query, { limit: 2000 }));
        const countByKey = /** @type {Record<string, number>} */ ({});
        (data.items || []).forEach((item) => {
          const key = item[groupBy];
          if (!key) return;
          countByKey[key] = (countByKey[key] || 0) + 1;
        });
        const rows = Object.entries(countByKey)
          .map(([group, count]) => /** @type {Record<string, any>} */ ({ [groupBy]: group, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, limit);
        return { rows };
      },

      async create(payload) {
        return apiClient.request('/api/properties', {
          method: 'POST',
          body: JSON.stringify(toWritePayload(payload)),
        });
      },

      async update(id, payload) {
        return apiClient.request(`/api/properties/${id}`, {
          method: 'PUT',
          body: JSON.stringify(toWritePayload(payload)),
        });
      },

      async delete(id) {
        return apiClient.request(`/api/properties/${id}`, { method: 'DELETE' });
      },
    },
  },
  /** Gestion des accès à /admin (réservé aux administrateurs). */
  adminUsers: {
    list() {
      return apiClient.request('/api/admin/users');
    },
    create({ fullName, email, password, role }) {
      return apiClient.request('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({ fullName, email, password, role }),
      });
    },
    changeRole(id, role) {
      return apiClient.request(`/api/admin/users/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
    },
  },
  integrations: {
    Core: {
      /** Envoie la photo au backend (stockée sur disque, servie sous /uploads/). */
      async UploadFile({ file }) {
        const formData = new FormData();
        formData.append('file', file);
        const result = await apiClient.request('/api/uploads', { method: 'POST', body: formData });
        return { file_url: absoluteFileUrl(result.file_url) };
      },
    },
  },
};

export default base44;
