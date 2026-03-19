'use client';

import { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from '@/i18n/navigation';

const forgotSchema = z.object({
  email: z.string().email(),
});

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});

    const formData = new FormData(event.currentTarget);
    const data = { email: formData.get('email') as string };

    const parsed = forgotSchema.safeParse(data);
    if (!parsed.success) {
      setErrors({ email: 'Bitte geben Sie eine gueltige E-Mail-Adresse ein.' });
      return;
    }

    setIsLoading(true);

    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: parsed.data.email }),
      });

      // Always show success (don't reveal if email exists)
      setIsSuccess(true);
    } catch {
      setIsSuccess(true);
    } finally {
      setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-ensemble-900 dark:text-ensemble-50">
          E-Mail gesendet
        </h3>
        <p className="text-sm text-ensemble-500 dark:text-ensemble-400">
          Falls ein Konto mit dieser E-Mail-Adresse existiert, wurde eine E-Mail mit einem Link zum Zuruecksetzen des Passworts gesendet.
        </p>
        <p className="text-sm text-ensemble-500 dark:text-ensemble-400">
          Bitte pruefen Sie auch Ihren Spam-Ordner.
        </p>
        <Link
          href="/anmelden"
          className="mt-4 inline-block text-sm font-medium text-accent-500 hover:text-accent-600 dark:text-accent-400"
        >
          Zurueck zur Anmeldung
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-sm font-medium text-ensemble-700 dark:text-ensemble-300"
        >
          E-Mail-Adresse
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="ihre@email.ch"
          autoComplete="email"
          required
          disabled={isLoading}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="text-xs text-error">{errors.email}</p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Link anfordern...
          </span>
        ) : (
          'Link zum Zuruecksetzen anfordern'
        )}
      </Button>

      <div className="pt-2 text-center text-sm text-ensemble-500 dark:text-ensemble-400">
        <Link
          href="/anmelden"
          className="font-medium text-accent-500 hover:text-accent-600 dark:text-accent-400"
        >
          Zurueck zur Anmeldung
        </Link>
      </div>
    </form>
  );
}
