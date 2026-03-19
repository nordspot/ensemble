'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from '@/i18n/navigation';

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8)
      .regex(/[A-Z]/)
      .regex(/[0-9]/),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
  });

interface CheckIconProps {
  met: boolean;
}

function CheckIcon({ met }: CheckIconProps) {
  return (
    <svg
      className={`h-3.5 w-3.5 shrink-0 ${met ? 'text-green-500' : 'text-ensemble-300 dark:text-ensemble-600'}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      {met ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      ) : (
        <circle cx="12" cy="12" r="8" />
      )}
    </svg>
  );
}

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [password, setPassword] = useState('');

  const passwordChecks = useMemo(
    () => ({
      minLength: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
    }),
    [password]
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});

    const formData = new FormData(event.currentTarget);
    const data = {
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    };

    const parsed = resetSchema.safeParse(data);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === 'string') {
          if (field === 'confirmPassword') {
            fieldErrors[field] = 'Passwoerter stimmen nicht ueberein.';
          } else {
            fieldErrors[field] = issue.message;
          }
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: parsed.data.password,
        }),
      });

      const result = (await response.json()) as { ok: boolean; error?: { message: string } };

      if (!response.ok || !result.ok) {
        toast.error(result.error?.message ?? 'Ein Fehler ist aufgetreten.');
        return;
      }

      toast.success('Passwort erfolgreich geaendert. Sie koennen sich jetzt anmelden.');
      router.push('/anmelden');
    } catch {
      toast.error('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
    } finally {
      setIsLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-ensemble-500 dark:text-ensemble-400">
          Ungueltiger oder fehlender Token. Bitte fordern Sie einen neuen Link an.
        </p>
        <Link
          href="/passwort-vergessen"
          className="inline-block text-sm font-medium text-accent-500 hover:text-accent-600 dark:text-accent-400"
        >
          Neuen Link anfordern
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* New Password */}
      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-ensemble-700 dark:text-ensemble-300"
        >
          Neues Passwort
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Neues Passwort eingeben"
          autoComplete="new-password"
          required
          disabled={isLoading}
          aria-invalid={!!errors.password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errors.password && (
          <p className="text-xs text-error">{errors.password}</p>
        )}

        {/* Password requirements */}
        <div className="rounded-lg bg-ensemble-50 p-3 dark:bg-ensemble-800/50">
          <p className="mb-2 text-xs font-medium text-ensemble-600 dark:text-ensemble-400">
            Passwort-Anforderungen:
          </p>
          <ul className="space-y-1">
            <li className="flex items-center gap-2 text-xs text-ensemble-600 dark:text-ensemble-400">
              <CheckIcon met={passwordChecks.minLength} />
              Mindestens 8 Zeichen
            </li>
            <li className="flex items-center gap-2 text-xs text-ensemble-600 dark:text-ensemble-400">
              <CheckIcon met={passwordChecks.uppercase} />
              Mindestens ein Grossbuchstabe
            </li>
            <li className="flex items-center gap-2 text-xs text-ensemble-600 dark:text-ensemble-400">
              <CheckIcon met={passwordChecks.number} />
              Mindestens eine Zahl
            </li>
          </ul>
        </div>
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-medium text-ensemble-700 dark:text-ensemble-300"
        >
          Passwort bestaetigen
        </label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Passwort erneut eingeben"
          autoComplete="new-password"
          required
          disabled={isLoading}
          aria-invalid={!!errors.confirmPassword}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-error">{errors.confirmPassword}</p>
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
            Passwort wird geaendert...
          </span>
        ) : (
          'Passwort zuruecksetzen'
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
