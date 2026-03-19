import { getTranslations } from 'next-intl/server';
import { HeroSection } from '@/components/landing/hero-section';
import { LogoBar } from '@/components/landing/logo-bar';
import { FeatureShowcase } from '@/components/landing/feature-showcase';
import { StatsSection } from '@/components/landing/stats-section';
import { SwissSection } from '@/components/landing/swiss-section';
import { CtaSection } from '@/components/landing/cta-section';
import { LandingFooter } from '@/components/landing/landing-footer';

export default async function LandingPage() {
  const t = await getTranslations('landing');

  const heroTranslations = {
    navPlatform: t('nav.platform'),
    navPricing: t('nav.pricing'),
    navAbout: t('nav.about'),
    navLogin: t('nav.login'),
    navDemo: t('nav.demo'),
    eyebrow: t('hero.eyebrow'),
    headlineLine1: t('hero.headlineLine1'),
    headlineLine2: t('hero.headlineLine2'),
    subtitle: t('hero.subtitle'),
    ctaPrimary: t('hero.ctaPrimary'),
    ctaSecondary: t('hero.ctaSecondary'),
    ctaNote: t('hero.ctaNote'),
  };

  const featureShowcaseTranslations = {
    section1TitleLine1: t('showcase.section1TitleLine1'),
    section1TitleLine2: t('showcase.section1TitleLine2'),
    section1Items: [
      t('showcase.section1Item1'),
      t('showcase.section1Item2'),
      t('showcase.section1Item3'),
      t('showcase.section1Item4'),
    ],
    section2TitleLine1: t('showcase.section2TitleLine1'),
    section2TitleLine2: t('showcase.section2TitleLine2'),
    section2Items: [
      t('showcase.section2Item1'),
      t('showcase.section2Item2'),
      t('showcase.section2Item3'),
      t('showcase.section2Item4'),
    ],
    section3TitleLine1: t('showcase.section3TitleLine1'),
    section3TitleLine2: t('showcase.section3TitleLine2'),
    section3Items: [
      t('showcase.section3Item1'),
      t('showcase.section3Item2'),
      t('showcase.section3Item3'),
      t('showcase.section3Item4'),
    ],
    section4TitleLine1: t('showcase.section4TitleLine1'),
    section4TitleLine2: t('showcase.section4TitleLine2'),
    section4Items: [
      t('showcase.section4Item1'),
      t('showcase.section4Item2'),
      t('showcase.section4Item3'),
      t('showcase.section4Item4'),
    ],
    section5TitleLine1: t('showcase.section5TitleLine1'),
    section5TitleLine2: t('showcase.section5TitleLine2'),
    section5Items: [
      t('showcase.section5Item1'),
      t('showcase.section5Item2'),
      t('showcase.section5Item3'),
      t('showcase.section5Item4'),
    ],
    allFeaturesLink: t('showcase.allFeaturesLink'),
  };

  const statsTranslations = {
    stats: [
      { value: t('stats.stat1Value'), label: t('stats.stat1Label') },
      { value: t('stats.stat2Value'), label: t('stats.stat2Label') },
      { value: t('stats.stat3Value'), label: t('stats.stat3Label') },
      { value: t('stats.stat4Value'), label: t('stats.stat4Label') },
    ],
  };

  const swissTranslations = {
    title: t('swiss.title'),
    cards: [
      { title: t('swiss.card1Title'), description: t('swiss.card1Desc') },
      { title: t('swiss.card2Title'), description: t('swiss.card2Desc') },
      { title: t('swiss.card3Title'), description: t('swiss.card3Desc') },
      { title: t('swiss.card4Title'), description: t('swiss.card4Desc') },
    ],
  };

  const ctaTranslations = {
    headlineLine1: t('cta.headlineLine1'),
    headlineLine2: t('cta.headlineLine2'),
    subtitle: t('cta.subtitle'),
    cta: t('cta.button'),
    alternative: t('cta.alternative'),
    allFeaturesLink: t('showcase.allFeaturesLink'),
  };

  const footerTranslations = {
    tagline: t('footer.tagline'),
    colPlatform: t('footer.colPlatform'),
    colResources: t('footer.colResources'),
    colCompany: t('footer.colCompany'),
    platformLinks: [
      { label: t('footer.linkFeatures'), href: '#platform' },
      { label: t('footer.linkPricing'), href: '#stats' },
      { label: t('footer.linkIntegrations'), href: '#platform' },
      { label: t('footer.linkSecurity'), href: '#swiss' },
    ],
    resourceLinks: [
      { label: t('footer.linkDocs'), href: '#' },
      { label: t('footer.linkBlog'), href: '#' },
      { label: t('footer.linkApi'), href: '#' },
      { label: t('footer.linkStatus'), href: '#' },
    ],
    companyLinks: [
      { label: t('footer.linkAbout'), href: '#' },
      { label: t('footer.linkContact'), href: '#' },
      { label: t('footer.linkCareers'), href: '#' },
      { label: t('footer.linkPartners'), href: '#' },
    ],
    copyright: t('footer.copyright'),
    legal: [
      { label: t('footer.impressum'), href: '/impressum' },
      { label: t('footer.privacy'), href: '/datenschutz' },
      { label: t('footer.terms'), href: '/agb' },
    ],
  };

  return (
    <main className="bg-white overflow-x-hidden">
      <HeroSection translations={heroTranslations} />
      <LogoBar label={t('logoBar')} />
      <FeatureShowcase translations={featureShowcaseTranslations} />
      <StatsSection translations={statsTranslations} />
      <SwissSection translations={swissTranslations} />
      <CtaSection translations={ctaTranslations} />
      <LandingFooter translations={footerTranslations} />
    </main>
  );
}
