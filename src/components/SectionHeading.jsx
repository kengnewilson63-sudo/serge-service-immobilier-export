/**
 * @param {{ eyebrow?: string, title?: string, subtitle?: string, align?: 'left'|'center', tone?: 'light'|'dark' }} props
 */
export default function SectionHeading({ eyebrow, title, subtitle, align = 'left', tone = 'light' }) {
  const centered = align === 'center';
  const dark = tone === 'dark';
  return (
    <div className={`${centered ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}`}>
      {eyebrow && (
        <div className={`mb-4 flex items-center gap-3 ${centered ? 'justify-center' : ''}`}>
          <span className="h-px w-8 bg-accent" />
          <span className={`text-xs font-semibold uppercase tracking-[0.22em] ${dark ? 'text-accent' : 'text-primary'}`}>
            {eyebrow}
          </span>
        </div>
      )}
      <h2 className={`text-3xl font-bold leading-tight tracking-tight text-balance sm:text-4xl ${dark ? 'text-white' : 'text-navy'}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-4 text-base leading-relaxed sm:text-lg ${dark ? 'text-white/70' : 'text-muted-foreground'}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}