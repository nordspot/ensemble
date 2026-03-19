import { ProfileEditor } from '@/components/profile/profile-editor';

export default function ProfilPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ensemble-900 dark:text-ensemble-50">
          Mein Profil
        </h1>
        <p className="mt-1 text-sm text-ensemble-500 dark:text-ensemble-400">
          Verwalten Sie Ihre persönlichen Informationen und Einstellungen.
        </p>
      </div>

      <ProfileEditor />
    </div>
  );
}
