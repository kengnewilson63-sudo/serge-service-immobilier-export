import { useState } from 'react';
import { Check, Copy, Share2 } from 'lucide-react';
import { propertyShareUrl } from '@/lib/properties';

/** Copie robuste : l'API Clipboard est bloquée hors HTTPS / dans certains navigateurs. */
const copyText = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // on tente la méthode classique ci-dessous
  }
  try {
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    field.setSelectionRange(0, text.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(field);
    return ok;
  } catch {
    return false;
  }
};

/**
 * Partage d'un bien, façon TikTok : un lien unique par annonce
 * (https://le-site/biens/<slug>) que l'on copie pour l'envoyer par WhatsApp,
 * SMS ou dans une bio de réseau social. Quiconque clique ouvre ce bien précis.
 */
export default function ShareProperty({ property, className = '' }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const url = propertyShareUrl(property);

  const handleCopy = async () => {
    const ok = await copyText(url);
    setFailed(!ok);
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  };

  const shareText = `Découvrez ce bien : ${property.title} à ${property.neighborhood}, ${property.city}`;
  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title: property.title, text: shareText, url });
    } catch {
      // Partage annulé par l'utilisateur : rien à faire.
    }
  };

  return (
    <div className={`rounded-2xl border border-primary/20 bg-primary/5 p-4 ${className}`} data-share-block>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
        Partager ce bien
      </p>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          readOnly
          value={url}
          aria-label="Lien du bien"
          onFocus={(event) => event.currentTarget.select()}
          className="h-10 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 text-xs text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Lien copié !' : 'Copier le lien'}
        </button>
        {canNativeShare && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-primary/25 px-4 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
          >
            <Share2 className="h-4 w-4" /> Partager
          </button>
        )}
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        {failed
          ? 'Copie automatique bloquée : sélectionnez le lien ci-dessus puis copiez-le.'
          : 'Collez ce lien où vous voulez (WhatsApp, TikTok, SMS…). Il ouvre toujours ce bien.'}
      </p>
    </div>
  );
}
