import type { RegentCta } from '../types';

interface RegentCtaProps {
  cta: RegentCta;
}

export default function RegentCtaSection({ cta }: RegentCtaProps) {
  return (
    <section className="glass-card p-8 text-center space-y-4 border-cyan-500/20">
      <h3 className="text-2xl font-bold gradient-text">{cta.headline}</h3>
      <p className="text-white/60 max-w-xl mx-auto text-sm">{cta.description}</p>
      <a
        href={cta.url}
        target="_blank"
        rel="noreferrer"
        className="btn-primary inline-flex"
      >
        {cta.cta}
        <span className="text-sm">→</span>
      </a>
    </section>
  );
}

interface RegentCtaPropsOptional {
  cta?: RegentCta | null;
}

export function RegentCtaConditional({ cta }: RegentCtaPropsOptional) {
  if (!cta) return null;
  return <RegentCtaSection cta={cta} />;
}
