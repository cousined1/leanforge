interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

const plans: PricingPlan[] = [
  {
    name: 'Free',
    price: '$0',
    description: 'Browse keyword trends and category insights at no cost.',
    features: ['100 API calls / 15 min', '7-day trend history', 'Keyword & category browsing', 'No credit card required'],
    cta: 'Browse Keywords',
  },
  {
    name: 'Starter',
    price: '$29',
    description: 'For professionals who need deeper, sustained keyword insights.',
    features: ['1,000 API calls / 15 min', '90-day trend history', 'Category filtering & exports', 'Email support'],
    cta: 'Get Started',
  },
  {
    name: 'Growth',
    price: '$99',
    description: 'For teams running keyword intelligence across products and clients.',
    features: [
      '10,000 API calls / 15 min',
      '365-day trend history',
      'Keyword comparison & leaderboards',
      'Priority support',
    ],
    highlighted: true,
    cta: 'Get Started',
  },
];

export default function PricingTable() {
  return (
    <section className="py-16" id="pricing">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold gradient-text">Simple, transparent pricing</h2>
        <p className="text-white/50 text-sm mt-2 max-w-md mx-auto">
          Start with free-tier trending data. Upgrade when you need full historical access.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`glass-card p-6 flex flex-col ${
              plan.highlighted ? 'border-cyan-500/40 ring-1 ring-cyan-500/20' : ''
            }`}
          >
            {plan.highlighted && (
              <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-semibold mb-2">Most popular</span>
            )}
            <h3 className="text-lg font-bold">{plan.name}</h3>
            <div className="mt-2 mb-1">
              <span className="text-3xl font-bold">{plan.price}</span>
              {plan.price !== 'Custom' && <span className="text-white/40 text-sm">/mo</span>}
            </div>
            <p className="text-xs text-white/50 mb-4">{plan.description}</p>
            <ul className="space-y-2 mb-6 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="text-xs text-white/60 flex items-center gap-2">
                  <span className="text-cyan-400">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <button className={plan.highlighted ? 'btn-primary w-full justify-center' : 'btn-outline w-full justify-center'}>
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
