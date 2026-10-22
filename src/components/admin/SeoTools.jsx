import { useState } from 'react';
import { Check, Copy, Download, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SITE_URL } from '@/lib/seo';

/**
 * Outils de référencement dans l'admin : où envoyer (Google Search Console, Bing
 * Webmaster), et de quoi soumettre le sitemap généré par le backend.
 */
export default function SeoTools({ records = [] }) {
  const origin = SITE_URL.replace(/\/+$/, '') || window.location.origin;
  const sitemapUrl = `${origin}/sitemap.xml`;
  const robotsUrl = `${origin}/robots.txt`;
  const [copied, setCopied] = useState('');

  const copy = async (value, key) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(''), 1800);
    } catch {
      setCopied('');
    }
  };

  const downloadSitemap = () => {
    const indexed = records.filter((r) => r.status === 'disponible');
    const paths = ['/', '/biens', '/services', '/a-propos', '/contact', ...indexed.map((r) => `/biens/${r.slug}`)];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${origin}${p}</loc></url>`).join('\n')}
</urlset>`;
    const blob = new Blob([xml], { type: 'application/xml' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'sitemap.xml';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="container-x pb-2">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          <h2 className="font-heading text-sm font-semibold text-navy">Référencement (SEO)</h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          URL publique du site : <code className="rounded bg-secondary px-1 py-0.5">{origin}</code>
          {' '}— modifiable avec <code className="rounded bg-secondary px-1 py-0.5">VITE_SITE_URL</code>.
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <div className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
            <span className="truncate text-xs text-muted-foreground">{sitemapUrl}</span>
            <button
              type="button"
              onClick={() => copy(sitemapUrl, 'sitemap')}
              className="text-muted-foreground transition-colors hover:text-primary"
              aria-label="Copier l'adresse du sitemap"
            >
              {copied === 'sitemap' ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <div className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
            <span className="truncate text-xs text-muted-foreground">{robotsUrl}</span>
            <button
              type="button"
              onClick={() => copy(robotsUrl, 'robots')}
              className="text-muted-foreground transition-colors hover:text-primary"
              aria-label="Copier l'adresse de robots.txt"
            >
              {copied === 'robots' ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline" className="border-primary/25 text-primary hover:bg-primary/5">
            <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer">
              Google Search Console
            </a>
          </Button>
          <Button asChild size="sm" variant="outline">
            <a href="https://www.bing.com/webmasters" target="_blank" rel="noopener noreferrer">
              Bing Webmaster
            </a>
          </Button>
          <Button size="sm" variant="ghost" onClick={downloadSitemap}>
            <Download className="mr-1.5 h-4 w-4" /> Télécharger le sitemap
          </Button>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          Une fois le site en ligne : validez le domaine dans Google Search Console, puis soumettez{' '}
          <code>{sitemapUrl}</code> dans « Sitemaps ». Les annonces vendues ou déjà prises passent
          automatiquement en <code>noindex</code>.
        </p>
      </div>
    </div>
  );
}
