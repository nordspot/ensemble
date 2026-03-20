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
          { key: 'dragDrop', name: t('domains.programm.features.dragDrop.name'), description: t('domains.programm.features.dragDrop.description') },
          { key: 'multiTrack', name: t('domains.programm.features.multiTrack.name'), description: t('domains.programm.features.multiTrack.description') },
          { key: 'conflicts', name: t('domains.programm.features.conflicts.name'), description: t('domains.programm.features.conflicts.description') },
          { key: 'personalSchedule', name: t('domains.programm.features.personalSchedule.name'), description: t('domains.programm.features.personalSchedule.description') },
          { key: 'ical', name: t('domains.programm.features.ical.name'), description: t('domains.programm.features.ical.description') },
          { key: 'sessionTypes', name: t('domains.programm.features.sessionTypes.name'), description: t('domains.programm.features.sessionTypes.description') },
        ],
      },
      {
        id: 'registrierung',
        name: t('domains.registrierung.name'),
        features: [
          { key: 'formBuilder', name: t('domains.registrierung.features.formBuilder.name'), description: t('domains.registrierung.features.formBuilder.description') },
          { key: 'ticketTypes', name: t('domains.registrierung.features.ticketTypes.name'), description: t('domains.registrierung.features.ticketTypes.description') },
          { key: 'earlyBird', name: t('domains.registrierung.features.earlyBird.name'), description: t('domains.registrierung.features.earlyBird.description') },
          { key: 'groupReg', name: t('domains.registrierung.features.groupReg.name'), description: t('domains.registrierung.features.groupReg.description') },
          { key: 'waitlist', name: t('domains.registrierung.features.waitlist.name'), description: t('domains.registrierung.features.waitlist.description') },
          { key: 'payment', name: t('domains.registrierung.features.payment.name'), description: t('domains.registrierung.features.payment.description') },
        ],
      },
      {
        id: 'live',
        name: t('domains.live.name'),
        features: [
          { key: 'transcription', name: t('domains.live.features.transcription.name'), description: t('domains.live.features.transcription.description') },
          { key: 'qa', name: t('domains.live.features.qa.name'), description: t('domains.live.features.qa.description') },
          { key: 'polls', name: t('domains.live.features.polls.name'), description: t('domains.live.features.polls.description') },
          { key: 'streaming', name: t('domains.live.features.streaming.name'), description: t('domains.live.features.streaming.description') },
          { key: 'reactions', name: t('domains.live.features.reactions.name'), description: t('domains.live.features.reactions.description') },
          { key: 'ratings', name: t('domains.live.features.ratings.name'), description: t('domains.live.features.ratings.description') },
        ],
      },
      {
        id: 'navigation',
        name: t('domains.navigation.name'),
        features: [
          { key: 'ble', name: t('domains.navigation.features.ble.name'), description: t('domains.navigation.features.ble.description') },
          { key: 'floorplan', name: t('domains.navigation.features.floorplan.name'), description: t('domains.navigation.features.floorplan.description') },
          { key: 'pathfinding', name: t('domains.navigation.features.pathfinding.name'), description: t('domains.navigation.features.pathfinding.description') },
          { key: 'occupancy', name: t('domains.navigation.features.occupancy.name'), description: t('domains.navigation.features.occupancy.description') },
          { key: 'checkin', name: t('domains.navigation.features.checkin.name'), description: t('domains.navigation.features.checkin.description') },
          { key: 'accessible', name: t('domains.navigation.features.accessible.name'), description: t('domains.navigation.features.accessible.description') },
        ],
      },
      {
        id: 'networking',
        name: t('domains.networking.name'),
        features: [
          { key: 'nfc', name: t('domains.networking.features.nfc.name'), description: t('domains.networking.features.nfc.description') },
          { key: 'qr', name: t('domains.networking.features.qr.name'), description: t('domains.networking.features.qr.description') },
          { key: 'nearby', name: t('domains.networking.features.nearby.name'), description: t('domains.networking.features.nearby.description') },
          { key: 'directory', name: t('domains.networking.features.directory.name'), description: t('domains.networking.features.directory.description') },
          { key: 'dm', name: t('domains.networking.features.dm.name'), description: t('domains.networking.features.dm.description') },
          { key: 'vcard', name: t('domains.networking.features.vcard.name'), description: t('domains.networking.features.vcard.description') },
        ],
      },
      {
        id: 'chat',
        name: t('domains.chat.name'),
        features: [
          { key: 'realtime', name: t('domains.chat.features.realtime.name'), description: t('domains.chat.features.realtime.description') },
          { key: 'channels', name: t('domains.chat.features.channels.name'), description: t('domains.chat.features.channels.description') },
          { key: 'directMessages', name: t('domains.chat.features.directMessages.name'), description: t('domains.chat.features.directMessages.description') },
          { key: 'files', name: t('domains.chat.features.files.name'), description: t('domains.chat.features.files.description') },
          { key: 'moderation', name: t('domains.chat.features.moderation.name'), description: t('domains.chat.features.moderation.description') },
          { key: 'push', name: t('domains.chat.features.push.name'), description: t('domains.chat.features.push.description') },
        ],
      },
      {
        id: 'ausstellung',
        name: t('domains.ausstellung.name'),
        features: [
          { key: 'directory', name: t('domains.ausstellung.features.directory.name'), description: t('domains.ausstellung.features.directory.description') },
          { key: 'leads', name: t('domains.ausstellung.features.leads.name'), description: t('domains.ausstellung.features.leads.description') },
          { key: 'catalogs', name: t('domains.ausstellung.features.catalogs.name'), description: t('domains.ausstellung.features.catalogs.description') },
          { key: 'sponsorTiers', name: t('domains.ausstellung.features.sponsorTiers.name'), description: t('domains.ausstellung.features.sponsorTiers.description') },
          { key: 'floorplan', name: t('domains.ausstellung.features.floorplan.name'), description: t('domains.ausstellung.features.floorplan.description') },
          { key: 'leadExport', name: t('domains.ausstellung.features.leadExport.name'), description: t('domains.ausstellung.features.leadExport.description') },
        ],
      },
      {
        id: 'ki',
        name: t('domains.ki.name'),
        features: [
          { key: 'rag', name: t('domains.ki.features.rag.name'), description: t('domains.ki.features.rag.description') },
          { key: 'search', name: t('domains.ki.features.search.name'), description: t('domains.ki.features.search.description') },
          { key: 'summaries', name: t('domains.ki.features.summaries.name'), description: t('domains.ki.features.summaries.description') },
          { key: 'translation', name: t('domains.ki.features.translation.name'), description: t('domains.ki.features.translation.description') },
          { key: 'recommendations', name: t('domains.ki.features.recommendations.name'), description: t('domains.ki.features.recommendations.description') },
          { key: 'citations', name: t('domains.ki.features.citations.name'), description: t('domains.ki.features.citations.description') },
        ],
      },
      {
        id: 'gamification',
        name: t('domains.gamification.name'),
        features: [
          { key: 'points', name: t('domains.gamification.features.points.name'), description: t('domains.gamification.features.points.description') },
          { key: 'leaderboard', name: t('domains.gamification.features.leaderboard.name'), description: t('domains.gamification.features.leaderboard.description') },
          { key: 'achievements', name: t('domains.gamification.features.achievements.name'), description: t('domains.gamification.features.achievements.description') },
          { key: 'referral', name: t('domains.gamification.features.referral.name'), description: t('domains.gamification.features.referral.description') },
          { key: 'tiers', name: t('domains.gamification.features.tiers.name'), description: t('domains.gamification.features.tiers.description') },
          { key: 'teams', name: t('domains.gamification.features.teams.name'), description: t('domains.gamification.features.teams.description') },
        ],
      },
      {
        id: 'cme',
        name: t('domains.cme.name'),
        features: [
          { key: 'creditTypes', name: t('domains.cme.features.creditTypes.name'), description: t('domains.cme.features.creditTypes.description') },
          { key: 'attendance', name: t('domains.cme.features.attendance.name'), description: t('domains.cme.features.attendance.description') },
          { key: 'evaluations', name: t('domains.cme.features.evaluations.name'), description: t('domains.cme.features.evaluations.description') },
          { key: 'certificates', name: t('domains.cme.features.certificates.name'), description: t('domains.cme.features.certificates.description') },
          { key: 'qrVerify', name: t('domains.cme.features.qrVerify.name'), description: t('domains.cme.features.qrVerify.description') },
          { key: 'dashboard', name: t('domains.cme.features.dashboard.name'), description: t('domains.cme.features.dashboard.description') },
        ],
      },
      {
        id: 'medien',
        name: t('domains.medien.name'),
        features: [
          { key: 'gallery', name: t('domains.medien.features.gallery.name'), description: t('domains.medien.features.gallery.description') },
          { key: 'poster', name: t('domains.medien.features.poster.name'), description: t('domains.medien.features.poster.description') },
          { key: 'articles', name: t('domains.medien.features.articles.name'), description: t('domains.medien.features.articles.description') },
          { key: 'onDemand', name: t('domains.medien.features.onDemand.name'), description: t('domains.medien.features.onDemand.description') },
          { key: 'podcam', name: t('domains.medien.features.podcam.name'), description: t('domains.medien.features.podcam.description') },
          { key: 'library', name: t('domains.medien.features.library.name'), description: t('domains.medien.features.library.description') },
        ],
      },
      {
        id: 'admin',
        name: t('domains.admin.name'),
        features: [
          { key: 'wizard', name: t('domains.admin.features.wizard.name'), description: t('domains.admin.features.wizard.description') },
          { key: 'attendees', name: t('domains.admin.features.attendees.name'), description: t('domains.admin.features.attendees.description') },
          { key: 'badges', name: t('domains.admin.features.badges.name'), description: t('domains.admin.features.badges.description') },
          { key: 'finance', name: t('domains.admin.features.finance.name'), description: t('domains.admin.features.finance.description') },
          { key: 'analytics', name: t('domains.admin.features.analytics.name'), description: t('domains.admin.features.analytics.description') },
          { key: 'audit', name: t('domains.admin.features.audit.name'), description: t('domains.admin.features.audit.description') },
        ],
      },
    ],
  };

  return <FeaturesPageContent translations={translations} />;
}
