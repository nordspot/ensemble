import { getTranslations } from 'next-intl/server';
import { FeaturesPageContent } from '@/components/landing/features-page-content';

export default async function FunktionenPage() {
  const t = await getTranslations('funktionen');
  const tLanding = await getTranslations('landing');

  const translations = {
    title: t('title'),
    subtitle: t('subtitle'),
    ctaTitle: t('ctaTitle'),
    ctaSubtitle: t('ctaSubtitle'),
    ctaButton: t('ctaButton'),
    navLogin: tLanding('nav.login'),
    navDemo: tLanding('nav.demo'),
    domains: [
      {
        id: 'programm',
        name: t('domains.programm.name'),
        features: [
          { name: t('domains.programm.features.dragDrop.name'), description: t('domains.programm.features.dragDrop.description') },
          { name: t('domains.programm.features.multiTrack.name'), description: t('domains.programm.features.multiTrack.description') },
          { name: t('domains.programm.features.conflicts.name'), description: t('domains.programm.features.conflicts.description') },
          { name: t('domains.programm.features.personalSchedule.name'), description: t('domains.programm.features.personalSchedule.description') },
          { name: t('domains.programm.features.ical.name'), description: t('domains.programm.features.ical.description') },
          { name: t('domains.programm.features.sessionTypes.name'), description: t('domains.programm.features.sessionTypes.description') },
        ],
      },
      {
        id: 'registrierung',
        name: t('domains.registrierung.name'),
        features: [
          { name: t('domains.registrierung.features.formBuilder.name'), description: t('domains.registrierung.features.formBuilder.description') },
          { name: t('domains.registrierung.features.ticketTypes.name'), description: t('domains.registrierung.features.ticketTypes.description') },
          { name: t('domains.registrierung.features.earlyBird.name'), description: t('domains.registrierung.features.earlyBird.description') },
          { name: t('domains.registrierung.features.groupReg.name'), description: t('domains.registrierung.features.groupReg.description') },
          { name: t('domains.registrierung.features.waitlist.name'), description: t('domains.registrierung.features.waitlist.description') },
          { name: t('domains.registrierung.features.payment.name'), description: t('domains.registrierung.features.payment.description') },
        ],
      },
      {
        id: 'live',
        name: t('domains.live.name'),
        features: [
          { name: t('domains.live.features.transcription.name'), description: t('domains.live.features.transcription.description') },
          { name: t('domains.live.features.qa.name'), description: t('domains.live.features.qa.description') },
          { name: t('domains.live.features.polls.name'), description: t('domains.live.features.polls.description') },
          { name: t('domains.live.features.streaming.name'), description: t('domains.live.features.streaming.description') },
          { name: t('domains.live.features.reactions.name'), description: t('domains.live.features.reactions.description') },
          { name: t('domains.live.features.ratings.name'), description: t('domains.live.features.ratings.description') },
        ],
      },
      {
        id: 'navigation',
        name: t('domains.navigation.name'),
        features: [
          { name: t('domains.navigation.features.ble.name'), description: t('domains.navigation.features.ble.description') },
          { name: t('domains.navigation.features.floorplan.name'), description: t('domains.navigation.features.floorplan.description') },
          { name: t('domains.navigation.features.pathfinding.name'), description: t('domains.navigation.features.pathfinding.description') },
          { name: t('domains.navigation.features.occupancy.name'), description: t('domains.navigation.features.occupancy.description') },
          { name: t('domains.navigation.features.checkin.name'), description: t('domains.navigation.features.checkin.description') },
          { name: t('domains.navigation.features.accessible.name'), description: t('domains.navigation.features.accessible.description') },
        ],
      },
      {
        id: 'networking',
        name: t('domains.networking.name'),
        features: [
          { name: t('domains.networking.features.nfc.name'), description: t('domains.networking.features.nfc.description') },
          { name: t('domains.networking.features.qr.name'), description: t('domains.networking.features.qr.description') },
          { name: t('domains.networking.features.nearby.name'), description: t('domains.networking.features.nearby.description') },
          { name: t('domains.networking.features.directory.name'), description: t('domains.networking.features.directory.description') },
          { name: t('domains.networking.features.dm.name'), description: t('domains.networking.features.dm.description') },
          { name: t('domains.networking.features.vcard.name'), description: t('domains.networking.features.vcard.description') },
        ],
      },
      {
        id: 'chat',
        name: t('domains.chat.name'),
        features: [
          { name: t('domains.chat.features.realtime.name'), description: t('domains.chat.features.realtime.description') },
          { name: t('domains.chat.features.channels.name'), description: t('domains.chat.features.channels.description') },
          { name: t('domains.chat.features.directMessages.name'), description: t('domains.chat.features.directMessages.description') },
          { name: t('domains.chat.features.files.name'), description: t('domains.chat.features.files.description') },
          { name: t('domains.chat.features.moderation.name'), description: t('domains.chat.features.moderation.description') },
          { name: t('domains.chat.features.push.name'), description: t('domains.chat.features.push.description') },
        ],
      },
      {
        id: 'ausstellung',
        name: t('domains.ausstellung.name'),
        features: [
          { name: t('domains.ausstellung.features.directory.name'), description: t('domains.ausstellung.features.directory.description') },
          { name: t('domains.ausstellung.features.leads.name'), description: t('domains.ausstellung.features.leads.description') },
          { name: t('domains.ausstellung.features.catalogs.name'), description: t('domains.ausstellung.features.catalogs.description') },
          { name: t('domains.ausstellung.features.sponsorTiers.name'), description: t('domains.ausstellung.features.sponsorTiers.description') },
          { name: t('domains.ausstellung.features.floorplan.name'), description: t('domains.ausstellung.features.floorplan.description') },
          { name: t('domains.ausstellung.features.leadExport.name'), description: t('domains.ausstellung.features.leadExport.description') },
        ],
      },
      {
        id: 'ki',
        name: t('domains.ki.name'),
        features: [
          { name: t('domains.ki.features.rag.name'), description: t('domains.ki.features.rag.description') },
          { name: t('domains.ki.features.search.name'), description: t('domains.ki.features.search.description') },
          { name: t('domains.ki.features.summaries.name'), description: t('domains.ki.features.summaries.description') },
          { name: t('domains.ki.features.translation.name'), description: t('domains.ki.features.translation.description') },
          { name: t('domains.ki.features.recommendations.name'), description: t('domains.ki.features.recommendations.description') },
          { name: t('domains.ki.features.citations.name'), description: t('domains.ki.features.citations.description') },
        ],
      },
      {
        id: 'gamification',
        name: t('domains.gamification.name'),
        features: [
          { name: t('domains.gamification.features.points.name'), description: t('domains.gamification.features.points.description') },
          { name: t('domains.gamification.features.leaderboard.name'), description: t('domains.gamification.features.leaderboard.description') },
          { name: t('domains.gamification.features.achievements.name'), description: t('domains.gamification.features.achievements.description') },
          { name: t('domains.gamification.features.referral.name'), description: t('domains.gamification.features.referral.description') },
          { name: t('domains.gamification.features.tiers.name'), description: t('domains.gamification.features.tiers.description') },
          { name: t('domains.gamification.features.teams.name'), description: t('domains.gamification.features.teams.description') },
        ],
      },
      {
        id: 'cme',
        name: t('domains.cme.name'),
        features: [
          { name: t('domains.cme.features.creditTypes.name'), description: t('domains.cme.features.creditTypes.description') },
          { name: t('domains.cme.features.attendance.name'), description: t('domains.cme.features.attendance.description') },
          { name: t('domains.cme.features.evaluations.name'), description: t('domains.cme.features.evaluations.description') },
          { name: t('domains.cme.features.certificates.name'), description: t('domains.cme.features.certificates.description') },
          { name: t('domains.cme.features.qrVerify.name'), description: t('domains.cme.features.qrVerify.description') },
          { name: t('domains.cme.features.dashboard.name'), description: t('domains.cme.features.dashboard.description') },
        ],
      },
      {
        id: 'medien',
        name: t('domains.medien.name'),
        features: [
          { name: t('domains.medien.features.gallery.name'), description: t('domains.medien.features.gallery.description') },
          { name: t('domains.medien.features.poster.name'), description: t('domains.medien.features.poster.description') },
          { name: t('domains.medien.features.articles.name'), description: t('domains.medien.features.articles.description') },
          { name: t('domains.medien.features.onDemand.name'), description: t('domains.medien.features.onDemand.description') },
          { name: t('domains.medien.features.podcam.name'), description: t('domains.medien.features.podcam.description') },
          { name: t('domains.medien.features.library.name'), description: t('domains.medien.features.library.description') },
        ],
      },
      {
        id: 'admin',
        name: t('domains.admin.name'),
        features: [
          { name: t('domains.admin.features.wizard.name'), description: t('domains.admin.features.wizard.description') },
          { name: t('domains.admin.features.attendees.name'), description: t('domains.admin.features.attendees.description') },
          { name: t('domains.admin.features.badges.name'), description: t('domains.admin.features.badges.description') },
          { name: t('domains.admin.features.finance.name'), description: t('domains.admin.features.finance.description') },
          { name: t('domains.admin.features.analytics.name'), description: t('domains.admin.features.analytics.description') },
          { name: t('domains.admin.features.audit.name'), description: t('domains.admin.features.audit.description') },
        ],
      },
    ],
  };

  return <FeaturesPageContent translations={translations} />;
}
