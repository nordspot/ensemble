'use client';

import { useState } from 'react';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(2),
  message: z.string().min(10),
});

export function ContactForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});

    const formData = new FormData(event.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    };

    const parsed = contactSchema.safeParse(data);
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
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });

      const result = (await response.json()) as { ok: boolean; error?: { message: string } };

      if (response.status === 429) {
        toast.error('Zu viele Anfragen. Bitte versuchen Sie es später erneut.');
        return;
      }

      if (!response.ok || !result.ok) {
        toast.error(result.error?.message ?? 'Ein Fehler ist aufgetreten.');
        return;
      }

      setIsSuccess(true);
    } catch {
      toast.error('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50/50 p-8 text-center dark:border-green-900/50 dark:bg-green-950/20">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">
          Nachricht gesendet
        </h3>
        <p className="mt-2 text-sm text-green-600/80 dark:text-green-400/80">
          Vielen Dank für Ihre Nachricht. Wir werden uns so schnell wie möglich bei Ihnen melden.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
            Name *
          </label>
          <Input id="name" name="name" required disabled={isLoading} placeholder="Ihr Name" />
          {errors.name && <p className="text-xs text-error">{errors.name}</p>}
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
            E-Mail *
          </label>
          <Input id="email" name="email" type="email" required disabled={isLoading} placeholder="ihre@email.ch" />
          {errors.email && <p className="text-xs text-error">{errors.email}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="subject" className="text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
          Betreff *
        </label>
        <Input id="subject" name="subject" required disabled={isLoading} placeholder="Worum geht es?" />
        {errors.subject && <p className="text-xs text-error">{errors.subject}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-medium text-ensemble-700 dark:text-ensemble-300">
          Nachricht *
        </label>
        <Textarea
          id="message"
          name="message"
          rows={5}
          required
          disabled={isLoading}
          placeholder="Ihre Nachricht..."
          maxLength={5000}
        />
        {errors.message && <p className="text-xs text-error">{errors.message}</p>}
      </div>

      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isLoading}>
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Senden...
          </span>
        ) : (
          'Nachricht senden'
        )}
      </Button>
    </form>
  );
}
