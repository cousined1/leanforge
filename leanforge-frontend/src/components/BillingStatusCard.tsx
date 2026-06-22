'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPlan } from '@/lib/api';

const POLL_INTERVAL_MS = 2_000;
const MAX_POLLS = 5;

export function BillingStatusCard() {
  const [plan, setPlan] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    let polls = 0;
    let stopped = false;
    const interval = setInterval(async () => {
      polls += 1;
      if (stopped) return;
      try {
        const result = await getPlan();
        if (result.plan !== 'free') {
          setPlan(result.plan);
          stopped = true;
          clearInterval(interval);
          return;
        }
      } catch {
        // Ignore poll failures; the next poll will retry.
      }
      if (polls >= MAX_POLLS) {
        setTimedOut(true);
        clearInterval(interval);
      }
    }, POLL_INTERVAL_MS);

    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, []);

  if (plan) {
    return (
      <div className="card p-8 text-center">
        <div className="text-4xl mb-4">✓</div>
        <h1 className="text-2xl font-bold mb-2">You're all set</h1>
        <p className="text-muted-foreground mb-6">
          Your <strong className="capitalize">{plan}</strong> plan is now active.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/keywords" className="btn-primary px-5 py-3">
            Start Exploring Keywords
          </Link>
          <Link href="/account" className="btn-outline px-5 py-3">
            Manage Subscription
          </Link>
        </div>
      </div>
    );
  }

  if (timedOut) {
    return (
      <div className="card p-8 text-center">
        <h1 className="text-xl font-bold mb-2">Activating your subscription</h1>
        <p className="text-muted-foreground mb-6">
          Stripe is still finalizing the activation. Refresh in a few seconds.
        </p>
        <Link href="/billing/success" className="btn-primary px-5 py-3">
          Refresh
        </Link>
      </div>
    );
  }

  return (
    <div className="card p-8 text-center">
      <div className="mx-auto mb-5 h-10 w-10 rounded-full border-4 border-muted border-t-primary animate-spin" />
      <h1 className="text-xl font-bold mb-2">Activating your subscription</h1>
      <p className="text-muted-foreground">This usually takes a few seconds.</p>
    </div>
  );
}
