import { useEffect } from 'react';
import { SITE_URL } from '@/lib/seo';

const upsertMeta = (key, value, useProperty = false) => {
  if (!value) return;
  const attr = useProperty ? 'property' : 'name';
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
};

const upsertCanonical = (href) => {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
};

export default function Seo({ title, description, path = '/', jsonLd }) {
  const jsonLdString = jsonLd ? JSON.stringify(jsonLd) : '';

  useEffect(() => {
    const url = `${SITE_URL}${path}`;
    if (title) document.title = title;
    upsertMeta('description', description);
    upsertMeta('og:title', title, true);
    upsertMeta('og:description', description, true);
    upsertMeta('og:url', url, true);
    upsertMeta('twitter:title', title);
    upsertMeta('twitter:description', description);
    upsertCanonical(url);
  }, [title, description, path]);

  useEffect(() => {
    if (!jsonLdString) return undefined;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = jsonLdString;
    document.head.appendChild(script);
    return () => script.remove();
  }, [jsonLdString]);

  return null;
}