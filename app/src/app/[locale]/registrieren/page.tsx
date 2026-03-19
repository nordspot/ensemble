import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { RegisterForm } from '@/components/auth/register-form';

export default async function RegistrierenPage() {
  const t = await getTranslations('auth');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-ensemble-50 via-white to-accent-50 px-4 py-12 dark:from-ensemble-950 dark:via-ensemble-900 dark:to-ensemble-950">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-accent-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-accent-500/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo / Branding */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <h1 className="font-heading text-3xl font-bold tracking-tight text-ensemble-900 dark:text-ensemble-50">
              Ensemble
            </h1>
          </Link>
          <p className="mt-2 text-sm text-ensemble-500 dark:text-ensemble-400">
            Wo Expertise zusammenkommt.
          </p>
        </div>

        {/* Registration Card */}
        <div className="rounded-2xl border border-ensemble-100 bg-white/80 p-8 shadow-xl shadow-ensemble-900/5 backdrop-blur-xl dark:border-ensemble-800 dark:bg-ensemble-900/80 dark:shadow-ensemble-950/20">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold text-ensemble-900 dark:text-ensemble-50">
              {t('register')}
            </h2>
            <p className="mt-1 text-sm text-ensemble-500 dark:text-ensemble-400">
              {t('registerSubtitle')}
            </p>
          </div>

          <RegisterForm
            translations={{
              fullName: t('fullName'),
              fullNamePlaceholder: t('fullNamePlaceholder'),
              email: t('email'),
              emailPlaceholder: t('emailPlaceholder'),
              password: t('password'),
              passwordPlaceholder: t('passwordPlaceholder'),
              confirmPassword: t('confirmPassword'),
              confirmPasswordPlaceholder: t('confirmPasswordPlaceholder'),
              register: t('register'),
              hasAccount: t('hasAccount'),
              login: t('login'),
              passwordRequirements: t('passwordRequirements'),
              passwordMinLength: t('passwordMinLength'),
              passwordUppercase: t('passwordUppercase'),
              passwordNumber: t('passwordNumber'),
              passwordsDoNotMatch: t('passwordsDoNotMatch'),
              registrationSuccess: t('registrationSuccess'),
              registrationError: t('registrationError'),
              emailInUse: t('emailInUse'),
            }}
          />
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-ensemble-400 dark:text-ensemble-500">
          &copy; {new Date().getFullYear()} Ensemble. Made in Switzerland.
        </p>
      </div>
    </div>
  );
}
