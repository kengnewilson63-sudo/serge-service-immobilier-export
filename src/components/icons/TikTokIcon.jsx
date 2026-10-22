// Logo TikTok officiel (lucide-react n'en fournit pas). Même API qu'une icône
// lucide : taille via className, couleur via currentColor.
export default function TikTokIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M16.6 5.82A6.2 6.2 0 0 1 15.1 2h-3.1v12.4a2.6 2.6 0 1 1-1.85-2.49V8.74a5.75 5.75 0 1 0 4.95 5.69V9.01a9.2 9.2 0 0 0 4.8 1.35V7.25a6.16 6.16 0 0 1-3.3-1.43Z" />
    </svg>
  );
}
