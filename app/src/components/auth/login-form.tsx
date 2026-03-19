'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from '@/i18n/navigation';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

interface LoginFormTranslations {
  email: string;
  emailPlaceholder: string;
  password: string;
  passwordPlaceholder: string;
  login: string;
  forgotPassword: string;
  noAccount: string;
  register: string;
  loginError: string;
}

interface LoginFormProps {
  translations: LoginFormTranslations;
}

export function LoginForm({ translations: t }: LoginFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});

    const formData = new FormData(event.currentTarget);
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    const parsed = loginSchema.safeParse(data);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === 'string') {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(t.loginError);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      toast.error(t.loginError);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-sm font-medium text-ensemble-700 dark:text-ensemble-300"
        >
          {t.email}
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder={t.emailPlaceholder}
          autoComplete="email"
          required
          disabled={isLoading}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="text-xs text-error">{errors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="text-sm font-medium text-ensemble-700 dark:text-ensemble-300"
          >
            {t.password}
          </label>
          <Link
            href="/passwort-vergessen"
            className="text-xs font-medium text-accent-500 hover:text-accent-600 dark:text-accent-400"
          >
            {t.forgotPassword}
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder={t.passwordPlaceholder}
          autoComplete="current-password"
          required
          disabled={isLoading}
          aria-invalid={!!errors.password}
        />
        {errors.password && (
          <p className="text-xs text-error">{errors.password}</p>
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
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {t.login}
          </span>
        ) : (
          t.login
        )}
      </Button>

      <div className="pt-2 text-center text-sm text-ensemble-500 dark:text-ensemble-400">
        {t.noAccount}{' '}
        <Link
          href="/registrieren"
          className="font-medium text-accent-500 hover:text-accent-600 dark:text-accent-400"
        >
          {t.register}
        </Link>
      </div>
    </form>
  );
}
