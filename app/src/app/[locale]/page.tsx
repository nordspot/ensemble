import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesSection } from '@/components/landing/features-section';

export default async function LandingPage() {
  const t = await getTranslations('landing');

  const featureTranslations: Record<string, string> = {
    programTitle: t('programTitle'),
    programDesc: t('programDesc'),
    streamingTitle: t('streamingTitle'),
    streamingDesc: t('streamingDesc'),
    navigationTitle: t('navigationTitle'),
    navigationDesc: t('navigationDesc'),
    networkingTitle: t('networkingTitle'),
    networkingDesc: t('networkingDesc'),
    aiTitle: t('aiTitle'),
    aiDesc: t('aiDesc'),
    gamificationTitle: t('gamificationTitle'),
    gamificationDesc: t('gamificationDesc'),
  };

  return (
    <main className="min-h-screen">
      <HeroSection
        heroTitle={t('hero')}
        tagline={t('tagline')}
        registerLabel={t('register')}
        learnMoreLabel={t('learnMore')}
      />
      <FeaturesSection
        sectionTitle={t('featuresHeading')}
        translations={featureTranslations}
      />

      {/* Bottom CTA */}
      <section className="relative py-24 sm:py-32 bg-ensemble-50 dark:bg-ensemble-800/30">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-ensemble-900 dark:text-ensemble-50 sm:text-4xl">
            {t('cta')}
          </h2>
          <p className="mt-4 text-lg text-ensemble-500 dark:text-ensemble-400">
            {t('tagline')}
          </p>
          <div className="mt-8">
            <Link
              href="/registrieren"
              className="inline-flex items-center justify-center rounded-xl bg-accent-500 px-10 py-4 text-base font-semibold text-white shadow-lg shadow-accent-500/25 transition-all hover:bg-accent-600 hover:shadow-xl hover:shadow-accent-500/30 active:scale-[0.98]"
            >
              {t('register')}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ensemble-100 dark:border-ensemble-800 bg-white dark:bg-ensemble-900 py-12">
        <div className="mx-auto max-w-7xl px-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="font-heading text-xl font-bold text-ensemble-900 dark:text-ensemble-50">
              Ensemble
            </span>
          </div>
          <p className="text-sm text-ensemble-400 dark:text-ensemble-500">
            &copy; {new Date().getFullYear()} Ensemble. Made in Switzerland.
          </p>
        </div>
      </footer>
    </main>
  );
}
