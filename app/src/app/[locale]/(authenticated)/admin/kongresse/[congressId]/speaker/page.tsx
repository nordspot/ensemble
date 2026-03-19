import { getTranslations } from 'next-intl/server';
import {
  UserPlus,
  CheckCircle2,
  AlertCircle,
  FileUp,
  Shield,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PageProps {
  params: Promise<{ congressId: string; locale: string }>;
}

interface SpeakerEntry {
  id: string;
  name: string;
  organization: string | null;
  email: string;
  disclosureSubmitted: boolean;
  presentationUploaded: boolean;
  sessions: { id: string; title: string }[];
}

// Placeholder data
const MOCK_SPEAKERS: SpeakerEntry[] = [
  {
    id: 'sp1',
    name: 'Prof. Dr. Anna Müller',
    organization: 'Universitätsspital Zürich',
    email: 'a.mueller@usz.ch',
    disclosureSubmitted: true,
    presentationUploaded: true,
    sessions: [{ id: 's1', title: 'Eröffnungskeynote' }],
  },
  {
    id: 'sp2',
    name: 'Dr. Thomas Berger',
    organization: 'Inselspital Bern',
    email: 't.berger@insel.ch',
    disclosureSubmitted: true,
    presentationUploaded: false,
    sessions: [{ id: 's2', title: 'Aktuelle Entwicklungen in der Kardiologie' }],
  },
  {
    id: 'sp3',
    name: 'PD Dr. Lisa Weber',
    organization: 'ETH Zürich',
    email: 'l.weber@ethz.ch',
    disclosureSubmitted: false,
    presentationUploaded: false,
    sessions: [{ id: 's3', title: 'Workshop: Neurorehabilitation' }],
  },
];

export default async function AdminSpeakerPage({ params }: PageProps) {
  const { congressId } = await params;
  void congressId; // will be used for data fetching
  const t = await getTranslations('admin');

  const speakers = MOCK_SPEAKERS;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
            {t('speakerAdmin.title')}
          </h1>
          <p className="mt-1 text-sm text-ensemble-500 dark:text-ensemble-400">
            {t('speakerAdmin.subtitle')}
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          {t('speakerAdmin.inviteSpeaker')}
        </Button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-500/10">
              <UserPlus className="h-5 w-5 text-accent-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
                {speakers.length}
              </p>
              <p className="text-xs text-ensemble-500 dark:text-ensemble-400">
                {t('speakerAdmin.totalSpeakers')}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Shield className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
                {speakers.filter((s) => s.disclosureSubmitted).length}
              </p>
              <p className="text-xs text-ensemble-500 dark:text-ensemble-400">
                {t('speakerAdmin.disclosuresSubmitted')}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <FileUp className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-ensemble-900 dark:text-ensemble-50">
                {speakers.filter((s) => s.presentationUploaded).length}
              </p>
              <p className="text-xs text-ensemble-500 dark:text-ensemble-400">
                {t('speakerAdmin.presentationsUploaded')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Speaker List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('speakerAdmin.speakerList')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-ensemble-100 dark:divide-ensemble-800">
            {speakers.map((speaker) => (
              <div
                key={speaker.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-ensemble-900 dark:text-ensemble-50">
                      {speaker.name}
                    </span>
                  </div>
                  {speaker.organization && (
                    <p className="text-xs text-ensemble-500 dark:text-ensemble-400">
                      {speaker.organization}
                    </p>
                  )}
                  <div className="mt-1 flex flex-wrap gap-1">
                    {speaker.sessions.map((session) => (
                      <Badge key={session.id} variant="outline" className="text-[10px]">
                        {session.title}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Disclosure status */}
                  <div className="flex items-center gap-1.5">
                    {speaker.disclosureSubmitted ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-warning" />
                    )}
                    <span className="text-xs text-ensemble-500 dark:text-ensemble-400">
                      {speaker.disclosureSubmitted
                        ? t('speakerAdmin.disclosureOk')
                        : t('speakerAdmin.disclosurePending')}
                    </span>
                  </div>
                  {/* Presentation status */}
                  <div className="flex items-center gap-1.5">
                    {speaker.presentationUploaded ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-warning" />
                    )}
                    <span className="text-xs text-ensemble-500 dark:text-ensemble-400">
                      {speaker.presentationUploaded
                        ? t('speakerAdmin.presentationOk')
                        : t('speakerAdmin.presentationPending')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
