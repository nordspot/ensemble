import { NextRequest } from 'next/server';
import { success, ERRORS } from '@/lib/api/response';
import { getDb } from '@/lib/api/server-helpers';
import { generateId } from '@/lib/db/client';
import type { D1Database } from '@/lib/db/client';

const SEED_KEY = 'ensemble-seed-2026';

// ── Helper: batch D1 statements in chunks ──────────────────────────────
async function batchInChunks(db: D1Database, stmts: ReturnType<D1Database['prepare']>[], chunkSize = 50) {
  for (let i = 0; i < stmts.length; i += chunkSize) {
    await db.batch(stmts.slice(i, i + chunkSize));
  }
}

// ── Hash password with bcryptjs (works in Workers) ─────────────────────
async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.hash(password, 10);
}

// ── GET /api/seed?key=ensemble-seed-2026 ───────────────────────────────
export async function GET(request: NextRequest): Promise<Response> {
  // 1. Validate secret key
  const key = request.nextUrl.searchParams.get('key');
  if (key !== SEED_KEY) {
    return ERRORS.FORBIDDEN('Invalid seed key');
  }

  const db = getDb();
  if (!db) {
    return ERRORS.INTERNAL_ERROR('Database not available');
  }

  // 2. Idempotency check — does the demo org already exist?
  const existing = await db
    .prepare("SELECT id FROM organizations WHERE slug = 'smcf'")
    .first<{ id: string }>();

  if (existing) {
    return success({
      message: 'Demo data already exists. Delete the organization first to re-seed.',
      organization_id: existing.id,
    });
  }

  // 3. Hash passwords
  const adminHash = await hashPassword('Admin123!');
  const demoHash = await hashPassword('Demo123!');

  // ── Generate all IDs upfront ───────────────────────────────────────
  const orgId = generateId();
  const congressId = generateId();

  // Users
  const adminId = generateId();
  const organizerId = generateId();
  const speaker1Id = generateId();
  const speaker2Id = generateId();
  const speaker3Id = generateId();
  const attendee1Id = generateId();
  const attendee2Id = generateId();
  const exhibitorUserId = generateId();

  // Tracks
  const track1Id = generateId();
  const track2Id = generateId();
  const track3Id = generateId();
  const track4Id = generateId();
  const track5Id = generateId();

  // Rooms
  const room1Id = generateId();
  const room2Id = generateId();
  const room3Id = generateId();
  const room4Id = generateId();
  const room5Id = generateId();

  // Sessions
  const sess1Id = generateId();
  const sess2Id = generateId();
  const sess3Id = generateId();
  const sess4Id = generateId();
  const sess5Id = generateId();
  const sess6Id = generateId();
  const sess7Id = generateId();
  const sess8Id = generateId();
  const sess9Id = generateId();
  const sess10Id = generateId();
  const sess11Id = generateId();
  const sess12Id = generateId();

  // Exhibitors
  const exhib1Id = generateId();
  const exhib2Id = generateId();
  const exhib3Id = generateId();

  // Sponsors
  const sponsor1Id = generateId();
  const sponsor2Id = generateId();
  const sponsor3Id = generateId();

  // Social Events
  const social1Id = generateId();
  const social2Id = generateId();

  // CME credit type
  const cmeTypeId = generateId();

  // Registrations
  const reg1Id = generateId();
  const reg2Id = generateId();
  const reg3Id = generateId();
  const reg4Id = generateId();
  const reg5Id = generateId();
  const reg6Id = generateId();
  const reg7Id = generateId();
  const reg8Id = generateId();

  // Congress roles
  const crole1Id = generateId();
  const crole2Id = generateId();
  const crole3Id = generateId();

  // Session speakers
  const ss1Id = generateId();
  const ss2Id = generateId();
  const ss3Id = generateId();
  const ss4Id = generateId();
  const ss5aId = generateId();
  const ss5bId = generateId();
  const ss6Id = generateId();
  const ss7Id = generateId();
  const ss8Id = generateId();
  const ss10Id = generateId();
  const ss11aId = generateId();
  const ss11bId = generateId();

  const now = new Date().toISOString();

  // ── BATCH 1: Organization ──────────────────────────────────────────
  const batch1 = [
    db.prepare(
      `INSERT INTO organizations (id, name, slug, plan, settings, created_at, updated_at)
       VALUES (?, ?, ?, ?, '{}', ?, ?)`
    ).bind(orgId, 'Swiss Medical Congress Foundation', 'smcf', 'enterprise', now, now),
  ];

  // ── BATCH 2: Profiles (users) ──────────────────────────────────────
  const profileInsert = `INSERT INTO profiles (id, email, password_hash, full_name, title, organization_name, specialty, country, city, role, organization_id, preferred_language, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'de', ?, ?)`;

  const batch2 = [
    db.prepare(profileInsert).bind(adminId, 'admin@ensemble.events', adminHash, 'Dr. Daniel Kunz', 'Dr.', 'Nord GmbH', null, 'CH', 'Bern', 'superadmin', orgId, now, now),
    db.prepare(profileInsert).bind(organizerId, 'organizer@ensemble.events', demoHash, 'Prof. Dr. Sarah Weber', 'Prof. Dr.', 'Universitätsspital Bern', 'Kardiologie', 'CH', 'Bern', 'organizer', orgId, now, now),
    db.prepare(profileInsert).bind(speaker1Id, 'speaker1@ensemble.events', demoHash, 'Prof. Dr. Thomas Müller', 'Prof. Dr.', 'ETH Zürich', 'Kardiologie', 'CH', 'Zürich', 'speaker', null, now, now),
    db.prepare(profileInsert).bind(speaker2Id, 'speaker2@ensemble.events', demoHash, 'Dr. Anna Fischer', 'Dr.', 'Inselspital Bern', 'Neurologie', 'CH', 'Bern', 'speaker', null, now, now),
    db.prepare(profileInsert).bind(speaker3Id, 'speaker3@ensemble.events', demoHash, 'Dr. Marc Dubois', 'Dr.', 'CHUV Lausanne', 'Chirurgie', 'CH', 'Lausanne', 'speaker', null, now, now),
    db.prepare(profileInsert).bind(attendee1Id, 'attendee1@ensemble.events', demoHash, 'Lisa Schneider', null, 'Kantonsspital Zürich', null, 'CH', 'Zürich', 'attendee', null, now, now),
    db.prepare(profileInsert).bind(attendee2Id, 'attendee2@ensemble.events', demoHash, 'Marco Rossi', null, 'Ospedale Civico Lugano', null, 'CH', 'Lugano', 'attendee', null, now, now),
    db.prepare(profileInsert).bind(exhibitorUserId, 'exhibitor@ensemble.events', demoHash, 'Stefan Meier', null, 'MedTech Solutions AG', null, 'CH', 'Basel', 'attendee', null, now, now),
  ];

  // ── BATCH 3: Congress ──────────────────────────────────────────────
  const batch3 = [
    db.prepare(
      `INSERT INTO congresses (id, organization_id, name, slug, subtitle, description, discipline, start_date, end_date, timezone, venue_name, venue_address, venue_city, venue_country, max_attendees, registration_open, abstract_submission_open, early_bird_price_cents, regular_price_cents, currency, status, settings, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '{}', ?, ?)`
    ).bind(
      congressId,
      orgId,
      'Swiss Cardiology Congress 2026',
      'scc-2026',
      'Innovationen in der kardiovaskulären Medizin',
      'Der Swiss Cardiology Congress ist die führende Fachtagung für Kardiologie in der Schweiz. Über 500 Expertinnen und Experten treffen sich in Bern, um neueste Forschungsergebnisse, innovative Therapieansätze und die Zukunft der Herzmedizin zu diskutieren.',
      'medical',
      '2026-06-15',
      '2026-06-17',
      'Europe/Zurich',
      'Kursaal Bern',
      'Kornhausstrasse 3',
      'Bern',
      'Schweiz',
      500,
      1,
      1,
      35000,
      45000,
      'CHF',
      'published',
      now,
      now
    ),
  ];

  // ── BATCH 4: Tracks ────────────────────────────────────────────────
  const trackInsert = `INSERT INTO tracks (id, congress_id, name, description, color, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const batch4 = [
    db.prepare(trackInsert).bind(track1Id, congressId, 'Interventionelle Kardiologie', 'Kathetergestützte Verfahren, TAVI, PCI und strukturelle Herzerkrankungen', '#3b82f6', 0, now),
    db.prepare(trackInsert).bind(track2Id, congressId, 'Herzinsuffizienz', 'Diagnostik, Therapie und Management der Herzinsuffizienz', '#10b981', 1, now),
    db.prepare(trackInsert).bind(track3Id, congressId, 'Rhythmologie', 'Elektrophysiologie, Vorhofflimmern und Schrittmachertherapie', '#8b5cf6', 2, now),
    db.prepare(trackInsert).bind(track4Id, congressId, 'Prävention & Rehabilitation', 'Kardiovaskuläre Prävention, Risikofaktoren und Rehabilitation', '#f59e0b', 3, now),
    db.prepare(trackInsert).bind(track5Id, congressId, 'Digitale Kardiologie', 'KI, Telemedizin, Wearables und digitale Gesundheitslösungen', '#ef4444', 4, now),
  ];

  // ── BATCH 5: Rooms ─────────────────────────────────────────────────
  const roomInsert = `INSERT INTO rooms (id, congress_id, name, floor, capacity, equipment, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  const batch5 = [
    db.prepare(roomInsert).bind(room1Id, congressId, 'Grosser Saal', 'EG', 500, '["Beamer","Mikrofon","Simultanübersetzung","Livestream"]', 0, now),
    db.prepare(roomInsert).bind(room2Id, congressId, 'Saal Bellevue', 'EG', 200, '["Beamer","Mikrofon","Kamera"]', 1, now),
    db.prepare(roomInsert).bind(room3Id, congressId, 'Saal Jungfrau', '1. OG', 100, '["Beamer","Mikrofon"]', 2, now),
    db.prepare(roomInsert).bind(room4Id, congressId, 'Workshop-Raum A', '1. OG', 40, '["Beamer","Simulator","Katheter-Equipment"]', 3, now),
    db.prepare(roomInsert).bind(room5Id, congressId, 'Workshop-Raum B', '1. OG', 30, '["Beamer","Ultraschall-Geräte"]', 4, now),
  ];

  // ── BATCH 6: Sessions ──────────────────────────────────────────────
  const sessionInsert = `INSERT INTO sessions (id, congress_id, track_id, room_id, title, description, session_type, start_time, end_time, status, cme_credits, sort_order, settings, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', ?, ?, '{}', ?, ?)`;

  const batch6 = [
    // Day 1 — June 15
    db.prepare(sessionInsert).bind(sess1Id, congressId, track1Id, room1Id,
      'Eröffnung: Die Zukunft der Kardiologie',
      'Eröffnungskeynote mit einem umfassenden Überblick über die neuesten Entwicklungen und Zukunftsperspektiven der Kardiologie. Prof. Müller beleuchtet bahnbrechende Fortschritte in der interventionellen Therapie.',
      'keynote', '2026-06-15T09:00:00', '2026-06-15T10:00:00', 2, 0, now, now),

    db.prepare(sessionInsert).bind(sess2Id, congressId, track1Id, room2Id,
      'TAVI im Jahr 2026: Neue Evidenz',
      'Aktuelle Studienergebnisse und Langzeitdaten zur Transkatheter-Aortenklappenimplantation. Diskussion neuer Indikationen und Klappendesigns.',
      'lecture', '2026-06-15T10:30:00', '2026-06-15T11:30:00', 1, 1, now, now),

    db.prepare(sessionInsert).bind(sess3Id, congressId, track5Id, room3Id,
      'KI-gestützte EKG-Analyse',
      'Wie künstliche Intelligenz die EKG-Diagnostik revolutioniert: Von der automatischen Arrhythmie-Erkennung bis zur Vorhersage kardialer Ereignisse.',
      'lecture', '2026-06-15T10:30:00', '2026-06-15T11:30:00', 1, 2, now, now),

    db.prepare(sessionInsert).bind(sess4Id, congressId, track1Id, room4Id,
      'Hands-on: Kathetertechniken',
      'Praktischer Workshop mit Simulatoren: Erlernen und Vertiefen moderner Kathetertechniken unter Anleitung erfahrener Interventionalisten.',
      'workshop', '2026-06-15T14:00:00', '2026-06-15T15:30:00', 2, 3, now, now),

    db.prepare(sessionInsert).bind(sess5Id, congressId, track2Id, room2Id,
      'Herzinsuffizienz: Neue Therapieansätze',
      'Panel-Diskussion zu innovativen pharmakologischen und Device-basierten Therapien bei Herzinsuffizienz. SGLT2-Inhibitoren, kardiale Kontraktilitätsmodulation und neue Biomarker.',
      'panel', '2026-06-15T14:00:00', '2026-06-15T15:30:00', 1.5, 4, now, now),

    // Day 2 — June 16
    db.prepare(sessionInsert).bind(sess6Id, congressId, track3Id, room1Id,
      'Vorhofflimmern: Update 2026',
      'Umfassende Keynote zu den neuesten Guidelines, Ablationsstrategien und antikoagulatorischen Therapiekonzepten bei Vorhofflimmern.',
      'keynote', '2026-06-16T09:00:00', '2026-06-16T10:00:00', 2, 0, now, now),

    db.prepare(sessionInsert).bind(sess7Id, congressId, track1Id, room2Id,
      'Kardiale Bildgebung der Zukunft',
      'Symposium zu modernsten Bildgebungsverfahren: Kardiale MRT, 3D-Echokardiographie, CT-FFR und Integration von KI in die Bildanalyse.',
      'satellite', '2026-06-16T10:30:00', '2026-06-16T12:00:00', 1.5, 1, now, now),

    db.prepare(sessionInsert).bind(sess8Id, congressId, track5Id, room3Id,
      'Telemedizin in der Kardiologie',
      'Remote-Monitoring, digitale Sprechstunden und tragbare Sensoren: Wie Telemedizin die kardiologische Nachsorge transformiert.',
      'lecture', '2026-06-16T13:00:00', '2026-06-16T14:00:00', 1, 2, now, now),

    db.prepare(sessionInsert).bind(sess9Id, congressId, track2Id, room1Id,
      'Postersession: Grundlagenforschung',
      'Präsentation ausgewählter Poster zu aktuellen Forschungsprojekten aus dem Bereich kardiovaskuläre Grundlagenforschung und translationale Medizin.',
      'poster', '2026-06-16T14:30:00', '2026-06-16T16:00:00', 1, 3, now, now),

    // Day 3 — June 17
    db.prepare(sessionInsert).bind(sess10Id, congressId, track4Id, room1Id,
      'Prävention kardiovaskulärer Erkrankungen',
      'Symposium zu Risikostratifizierung, Lebensstilinterventionen und neuen Präventionsstrategien. Von der Primärprävention bis zur kardialen Rehabilitation.',
      'satellite', '2026-06-17T09:00:00', '2026-06-17T10:30:00', 1.5, 0, now, now),

    db.prepare(sessionInsert).bind(sess11Id, congressId, track5Id, room2Id,
      'Digitale Transformation im Spital',
      'Panel-Diskussion über elektronische Patientenakten, KI-Entscheidungsunterstützung und die digitale Zukunft der klinischen Kardiologie.',
      'panel', '2026-06-17T11:00:00', '2026-06-17T12:00:00', 1, 1, now, now),

    db.prepare(sessionInsert).bind(sess12Id, congressId, null, room1Id,
      'Abschluss-Apéro & Networking',
      'Gemütlicher Ausklang des Kongresses mit Apéro riche, Networking-Gelegenheiten und Vergabe des Best-Poster-Awards.',
      'social', '2026-06-17T12:00:00', '2026-06-17T13:00:00', 0, 2, now, now),
  ];

  // ── BATCH 7: Session Speakers ──────────────────────────────────────
  const ssInsert = `INSERT INTO session_speakers (id, session_id, user_id, role, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?)`;
  const batch7 = [
    db.prepare(ssInsert).bind(ss1Id, sess1Id, speaker1Id, 'speaker', 0, now),    // Keynote 1 — Müller
    db.prepare(ssInsert).bind(ss2Id, sess2Id, speaker2Id, 'speaker', 0, now),    // TAVI — Fischer
    db.prepare(ssInsert).bind(ss3Id, sess3Id, speaker3Id, 'speaker', 0, now),    // KI-EKG — Dubois
    db.prepare(ssInsert).bind(ss4Id, sess4Id, speaker1Id, 'speaker', 0, now),    // Workshop — Müller
    db.prepare(ssInsert).bind(ss5aId, sess5Id, speaker2Id, 'panelist', 0, now),  // Panel HI — Fischer
    db.prepare(ssInsert).bind(ss5bId, sess5Id, speaker3Id, 'panelist', 1, now),  // Panel HI — Dubois
    db.prepare(ssInsert).bind(ss6Id, sess6Id, speaker2Id, 'speaker', 0, now),    // Keynote 2 — Fischer
    db.prepare(ssInsert).bind(ss7Id, sess7Id, speaker3Id, 'speaker', 0, now),    // Bildgebung — Dubois
    db.prepare(ssInsert).bind(ss8Id, sess8Id, speaker1Id, 'speaker', 0, now),    // Telemedizin — Müller
    db.prepare(ssInsert).bind(ss10Id, sess10Id, speaker2Id, 'speaker', 0, now),  // Prävention — Fischer
    db.prepare(ssInsert).bind(ss11aId, sess11Id, speaker1Id, 'panelist', 0, now), // Digital — Müller
    db.prepare(ssInsert).bind(ss11bId, sess11Id, speaker3Id, 'panelist', 1, now), // Digital — Dubois
  ];

  // ── BATCH 8: Registrations ─────────────────────────────────────────
  const regInsert = `INSERT INTO registrations (id, congress_id, user_id, ticket_type, status, payment_status, amount_cents, currency, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'CHF', ?, ?)`;
  const batch8 = [
    db.prepare(regInsert).bind(reg1Id, congressId, adminId, 'vip', 'confirmed', 'waived', 0, now, now),
    db.prepare(regInsert).bind(reg2Id, congressId, organizerId, 'vip', 'confirmed', 'waived', 0, now, now),
    db.prepare(regInsert).bind(reg3Id, congressId, speaker1Id, 'speaker', 'confirmed', 'waived', 0, now, now),
    db.prepare(regInsert).bind(reg4Id, congressId, speaker2Id, 'speaker', 'confirmed', 'waived', 0, now, now),
    db.prepare(regInsert).bind(reg5Id, congressId, speaker3Id, 'speaker', 'confirmed', 'waived', 0, now, now),
    db.prepare(regInsert).bind(reg6Id, congressId, attendee1Id, 'standard', 'confirmed', 'paid', 45000, now, now),
    db.prepare(regInsert).bind(reg7Id, congressId, attendee2Id, 'standard', 'pending', 'unpaid', 45000, now, now),
    db.prepare(regInsert).bind(reg8Id, congressId, exhibitorUserId, 'exhibitor', 'confirmed', 'paid', 45000, now, now),
  ];

  // ── BATCH 9: Congress Roles ────────────────────────────────────────
  const crInsert = `INSERT INTO congress_roles (id, congress_id, user_id, role, created_at) VALUES (?, ?, ?, ?, ?)`;
  const batch9 = [
    db.prepare(crInsert).bind(crole1Id, congressId, organizerId, 'organizer', now),
    db.prepare(crInsert).bind(crole2Id, congressId, speaker1Id, 'reviewer', now),
    db.prepare(crInsert).bind(crole3Id, congressId, speaker2Id, 'reviewer', now),
  ];

  // ── BATCH 10: Exhibitors ──────────────────────────────────────────
  const exhibInsert = `INSERT INTO exhibitors (id, congress_id, organization_name, booth_number, booth_size, description, website, contact_email, products, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const batch10 = [
    db.prepare(exhibInsert).bind(exhib1Id, congressId, 'MedTech Solutions AG', 'A1', 'large',
      'Innovative Medizinprodukte für die Kardiologie — von implantierbaren Defibrillatoren bis zu Herzunterstützungssystemen.',
      'https://medtech-solutions.example.ch', 'info@medtech-solutions.example.ch',
      '["Implantierbare Defibrillatoren","Herzschrittmacher","Monitoring-Systeme"]', now),
    db.prepare(exhibInsert).bind(exhib2Id, congressId, 'CardioTech GmbH', 'A2', 'medium',
      'Katheter- und Stentsysteme der nächsten Generation — bioresorbierbare Scaffolds und Drug-Eluting-Stents.',
      'https://cardiotech.example.ch', 'kontakt@cardiotech.example.ch',
      '["Stentsysteme","Ballonkatheter","Guidewires"]', now),
    db.prepare(exhibInsert).bind(exhib3Id, congressId, 'DigiHealth AG', 'B1', 'small',
      'Digitale Gesundheitslösungen und Telemedizin-Plattformen für die kardiologische Praxis und Klinik.',
      'https://digihealth.example.ch', 'hello@digihealth.example.ch',
      '["Telemedizin-Plattform","Remote-Monitoring","Patienten-App"]', now),
  ];

  // ── BATCH 11: Sponsors ─────────────────────────────────────────────
  const sponsorInsert = `INSERT INTO sponsors (id, congress_id, name, tier, description, website, benefits, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const batch11 = [
    db.prepare(sponsorInsert).bind(sponsor1Id, congressId, 'Novartis', 'platinum',
      'Globaler Partner der Herzmedizin — Forschung und Innovation für bessere kardiovaskuläre Therapien.',
      'https://novartis.com',
      '["Logo auf Hauptbühne","Eröffnungsrede","Exklusiver Empfangsbereich","Ganzseitige Anzeige im Programmheft"]', 0, now),
    db.prepare(sponsorInsert).bind(sponsor2Id, congressId, 'Roche Diagnostics', 'gold',
      'Diagnostik für die Kardiologie — Hochsensitive Troponin-Tests und Point-of-Care-Lösungen.',
      'https://diagnostics.roche.com',
      '["Logo im Foyer","Symposiums-Slot","Halbe Seite im Programmheft"]', 1, now),
    db.prepare(sponsorInsert).bind(sponsor3Id, congressId, 'Medtronic', 'silver',
      'Technologie für ein besseres Leben — Herzschrittmacher, Defibrillatoren und kardiale Resynchronisation.',
      'https://medtronic.com',
      '["Logo auf Website","Stand im Ausstellungsbereich"]', 2, now),
  ];

  // ── BATCH 12: Social Events ────────────────────────────────────────
  const socialInsert = `INSERT INTO social_events (id, congress_id, name, description, event_type, location, start_time, end_time, max_attendees, price_cents, dress_code, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const batch12 = [
    db.prepare(socialInsert).bind(social1Id, congressId,
      'Kongressdinner im Bellevue Palace',
      'Exklusives Kongressdinner im historischen Bellevue Palace mit Blick auf die Berner Alpen. 4-Gang-Menü mit Weinbegleitung und musikalischem Rahmenprogramm.',
      'dinner', 'Bellevue Palace, Kochergasse 3-5, 3011 Bern',
      '2026-06-16T19:00:00', '2026-06-16T23:00:00', 200, 15000, 'Business Casual', now),
    db.prepare(socialInsert).bind(social2Id, congressId,
      'Stadtrundgang Bern',
      'Geführter Rundgang durch die Berner Altstadt (UNESCO-Weltkulturerbe). Besuch des Bundeshauses, Zytglogge und Rosengarten mit atemberaubendem Blick über die Stadt.',
      'tour', 'Treffpunkt: Haupteingang Kursaal Bern',
      '2026-06-15T17:00:00', '2026-06-15T19:00:00', 50, 0, null, now),
  ];

  // ── BATCH 13: CME Credit Types ─────────────────────────────────────
  const batch13 = [
    db.prepare(
      `INSERT INTO cme_credit_types (id, congress_id, name, authority, country, max_credits, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(cmeTypeId, congressId, 'SIWF/FMH Fortbildungscredits', 'FMH', 'CH', 16, now),
  ];

  // ── Execute all batches ────────────────────────────────────────────
  try {
    // Group statements that fit within D1 batch limits
    await batchInChunks(db, batch1, 50);
    await batchInChunks(db, batch2, 50);
    await batchInChunks(db, batch3, 50);
    await batchInChunks(db, batch4, 50);
    await batchInChunks(db, batch5, 50);
    await batchInChunks(db, batch6, 50);
    await batchInChunks(db, batch7, 50);
    await batchInChunks(db, batch8, 50);
    await batchInChunks(db, batch9, 50);
    await batchInChunks(db, batch10, 50);
    await batchInChunks(db, batch11, 50);
    await batchInChunks(db, batch12, 50);
    await batchInChunks(db, batch13, 50);

    return success({
      message: 'Demo data seeded successfully',
      organization: { id: orgId, name: 'Swiss Medical Congress Foundation', slug: 'smcf' },
      congress: { id: congressId, name: 'Swiss Cardiology Congress 2026', slug: 'scc-2026' },
      users: {
        admin: { id: adminId, email: 'admin@ensemble.events', role: 'superadmin' },
        organizer: { id: organizerId, email: 'organizer@ensemble.events', role: 'organizer' },
        speaker1: { id: speaker1Id, email: 'speaker1@ensemble.events', role: 'speaker' },
        speaker2: { id: speaker2Id, email: 'speaker2@ensemble.events', role: 'speaker' },
        speaker3: { id: speaker3Id, email: 'speaker3@ensemble.events', role: 'speaker' },
        attendee1: { id: attendee1Id, email: 'attendee1@ensemble.events', role: 'attendee' },
        attendee2: { id: attendee2Id, email: 'attendee2@ensemble.events', role: 'attendee' },
        exhibitor: { id: exhibitorUserId, email: 'exhibitor@ensemble.events', role: 'attendee' },
      },
      tracks: [
        { id: track1Id, name: 'Interventionelle Kardiologie' },
        { id: track2Id, name: 'Herzinsuffizienz' },
        { id: track3Id, name: 'Rhythmologie' },
        { id: track4Id, name: 'Prävention & Rehabilitation' },
        { id: track5Id, name: 'Digitale Kardiologie' },
      ],
      rooms: [
        { id: room1Id, name: 'Grosser Saal' },
        { id: room2Id, name: 'Saal Bellevue' },
        { id: room3Id, name: 'Saal Jungfrau' },
        { id: room4Id, name: 'Workshop-Raum A' },
        { id: room5Id, name: 'Workshop-Raum B' },
      ],
      sessions: {
        count: 12,
        ids: [sess1Id, sess2Id, sess3Id, sess4Id, sess5Id, sess6Id, sess7Id, sess8Id, sess9Id, sess10Id, sess11Id, sess12Id],
      },
      exhibitors: [
        { id: exhib1Id, name: 'MedTech Solutions AG', booth: 'A1' },
        { id: exhib2Id, name: 'CardioTech GmbH', booth: 'A2' },
        { id: exhib3Id, name: 'DigiHealth AG', booth: 'B1' },
      ],
      sponsors: [
        { id: sponsor1Id, name: 'Novartis', tier: 'platinum' },
        { id: sponsor2Id, name: 'Roche Diagnostics', tier: 'gold' },
        { id: sponsor3Id, name: 'Medtronic', tier: 'silver' },
      ],
      socialEvents: [
        { id: social1Id, name: 'Kongressdinner im Bellevue Palace' },
        { id: social2Id, name: 'Stadtrundgang Bern' },
      ],
      cmeCreditTypes: [
        { id: cmeTypeId, name: 'SIWF/FMH Fortbildungscredits', authority: 'FMH' },
      ],
    }, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return ERRORS.INTERNAL_ERROR(`Seed failed: ${message}`);
  }
}
