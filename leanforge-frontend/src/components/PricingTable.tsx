'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { createCheckoutSession, getPlan, type Plan } from '@/lib/api';
import { regentPartnerUrl } from '@/lib/site';

type Tier = {
  id: 'free' | 'starter' | 'growth' | 'partner';
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
};

const tiers: Tier[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Browse keyword trends and category insights at no cost.',
    features: [
      '100 API calls / 15 min',
      '7-day trend history',
      'Keyword and category browsing',
      'No credit card required',
    ],
    cta: 'Browse Keywords',
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '$29',
    period: '/month',
    description: 'For professionals who need deeper, sustained keyword insights.',
    features: [
      '1,000 API calls / 15 min',
      '90-day trend history',
      'Category filtering and exports',
      'Email support',
    ],
    cta: 'Start Free Trial',
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '$99',
    period: '/month',
    description: 'For teams running keyword intelligence across products and clients.',
    features: [
      '10,000 API calls / 15 min',
      '365-day trend history',
      'Keyword comparison and leaderboards',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    id: 'partner',
    name: 'Recommended Partner',
    price: 'From $29',
    description: 'Need on-page optimization and guided content actions? Use our partner product.',
    features: [
      'SEO optimization scoring',
      'Actionable content recommendations',
      'Built for execution after keyword discovery',
      'Separate account and billing',
    ],
    cta: 'Try SEO AI Regent',
  },
];

export function PricingTable() {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setCurrentPlan(null);
      return;
    }
    let cancelled = false;
    getPlan()
      .then((p) => {
        if (!cancelled) setCurrentPlan(p.plan);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function handleCheckout(tierId: 'starter' | 'growth') {
    if (!user) {
      window.location.href = '/sign-in';
      return;
    }
    setPending(tierId);
    try {
      const { url } = await createCheckoutSession(tierId);
      window.location.href = url;
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Failed to start checkout. Please try again.');
      setPending(null);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {tiers.map((tier) => {
        const isCurrent =
          currentPlan !== null &&
          tier.id !== 'partner' &&
          tier.id === currentPlan;
        const isPending = pending === tier.id;
        const disabled = pending !== null;

        return (
          <div
            key={tier.id}
            className={`card p-6 flex flex-col ${
              tier.highlighted ? 'ring-2 ring-primary' : ''
            }`}
          >
            <h3 className="font-bold text-lg">{tier.name}</h3>
            <div className="mt-2 mb-4">
              <span className="text-3xl font-bold">{tier.price}</span>
              {tier.period && (
                <span className="text-muted-foreground">{tier.period}</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-6">{tier.description}</p>
            <ul className="space-y-2 mb-8 flex-1">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {isCurrent ? (
              <div className="text-xs text-primary text-center py-2 font-medium">
                Current plan
              </div>
            ) : tier.id === 'free' ? (
              <Link
                href="/keywords"
                className={`w-full text-center ${
                  tier.highlighted ? 'btn-primary' : 'btn-outline'
                } px-4 py-2 text-sm`}
              >
                {tier.cta}
              </Link>
            ) : tier.id === 'partner' ? (
              <a
                href={regentPartnerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center btn-outline px-4 py-2 text-sm"
              >
                {tier.cta}
              </a>
            ) : (
              <button
                type="button"
                onClick={() => handleCheckout(tier.id as 'starter' | 'growth')}
                disabled={disabled}
                className={`w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  tier.highlighted
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'btn-outline'
                } disabled:opacity-50`}
              >
                {isPending ? 'Redirecting…' : tier.cta}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
