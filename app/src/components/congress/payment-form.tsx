'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Stripe.js types (loaded via CDN, not npm)
interface StripeInstance {
  elements(options?: { clientSecret: string; appearance?: Record<string, unknown> }): StripeElements;
  confirmCardPayment(clientSecret: string, data?: {
    payment_method: { card: StripeCardElement };
  }): Promise<{ error?: { message: string }; paymentIntent?: { status: string } }>;
}

interface StripeElements {
  create(type: 'card', options?: Record<string, unknown>): StripeCardElement;
}

interface StripeCardElement {
  mount(domElement: string | HTMLElement): void;
  destroy(): void;
  on(event: string, handler: (event: { error?: { message: string }; complete?: boolean }) => void): void;
}

declare global {
  interface Window {
    Stripe?: (publishableKey: string) => StripeInstance;
  }
}

interface PaymentFormProps {
  clientSecret: string;
  amount: number;
  currency: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

// Get publishable key from env (public, safe to expose)
function getPublishableKey(): string {
  if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).ENV_STRIPE_PK) {
    return (window as unknown as Record<string, unknown>).ENV_STRIPE_PK as string;
  }
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';
}

export function PaymentForm({ clientSecret, amount, currency, onSuccess, onError }: PaymentFormProps) {
  const t = useTranslations('payment');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const stripeRef = useRef<StripeInstance | null>(null);
  const cardRef = useRef<StripeCardElement | null>(null);
  const cardMountRef = useRef<HTMLDivElement>(null);

  // Load Stripe.js via CDN script tag
  useEffect(() => {
    if (window.Stripe) {
      initStripe();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    script.onload = () => initStripe();
    script.onerror = () => {
      setLoading(false);
      onError('Stripe konnte nicht geladen werden');
    };
    document.head.appendChild(script);

    return () => {
      if (cardRef.current) {
        cardRef.current.destroy();
        cardRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function initStripe() {
    const pk = getPublishableKey();
    if (!pk || !window.Stripe) {
      setLoading(false);
      // In dev mode without Stripe key, show a placeholder
      if (!pk) {
        console.log('[STRIPE DEV] No publishable key configured');
      }
      return;
    }

    const stripe = window.Stripe(pk);
    stripeRef.current = stripe;

    const elements = stripe.elements();
    const card = elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#1a1a2e',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          '::placeholder': { color: '#71717a' },
        },
        invalid: { color: '#ef4444' },
      },
    });

    if (cardMountRef.current) {
      card.mount(cardMountRef.current);
    }

    card.on('change', (event) => {
      setCardComplete(!!event.complete);
      setCardError(event.error?.message ?? null);
    });

    cardRef.current = card;
    setLoading(false);
  }

  const handleSubmit = useCallback(async () => {
    if (!stripeRef.current || !cardRef.current) {
      // Dev mode fallback
      if (!getPublishableKey()) {
        console.log('[STRIPE DEV] Simulating successful payment');
        onSuccess();
        return;
      }
      onError('Stripe nicht initialisiert');
      return;
    }

    setProcessing(true);

    try {
      const result = await stripeRef.current.confirmCardPayment(clientSecret, {
        payment_method: { card: cardRef.current },
      });

      if (result.error) {
        onError(result.error.message ?? 'Zahlung fehlgeschlagen');
      } else if (result.paymentIntent?.status === 'succeeded') {
        onSuccess();
      } else {
        onError('Unerwarteter Zahlungsstatus');
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Zahlung fehlgeschlagen');
    } finally {
      setProcessing(false);
    }
  }, [clientSecret, onSuccess, onError]);

  const formatAmount = (cents: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: currency,
    }).format(cents / 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Amount summary */}
        <div className="flex items-center justify-between rounded-lg bg-ensemble-50 p-4 dark:bg-ensemble-800">
          <span className="text-sm font-medium text-ensemble-600 dark:text-ensemble-300">
            {t('total')}
          </span>
          <span className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
            {formatAmount(amount)}
          </span>
        </div>

        {/* Card input */}
        <div>
          <label className="mb-2 block text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
            {t('cardDetails')}
          </label>
          <div
            ref={cardMountRef}
            className="rounded-lg border border-ensemble-200 bg-white p-4 dark:border-ensemble-700 dark:bg-ensemble-900"
          />
          {cardError && (
            <p className="mt-1 text-xs text-error">{cardError}</p>
          )}
          {!getPublishableKey() && !loading && (
            <p className="mt-2 text-xs text-ensemble-500">
              [DEV] Stripe nicht konfiguriert. Klicken Sie auf &quot;Bezahlen&quot; um den Zahlungsvorgang zu simulieren.
            </p>
          )}
        </div>

        {/* Security note */}
        <div className="flex items-center gap-2 text-xs text-ensemble-500 dark:text-ensemble-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>{t('securePayment')}</span>
        </div>

        {/* Submit button */}
        <Button
          onClick={handleSubmit}
          disabled={loading || processing || (!cardComplete && !!getPublishableKey())}
          className="w-full"
          size="lg"
        >
          {loading
            ? t('loading')
            : processing
              ? t('processing')
              : `${t('pay')} ${formatAmount(amount)}`}
        </Button>
      </CardContent>
    </Card>
  );
}
