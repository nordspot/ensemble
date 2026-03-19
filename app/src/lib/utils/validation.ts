import { z } from 'zod';

export const emailSchema = z.string().email('Ungültige E-Mail-Adresse');

export const passwordSchema = z.string()
  .min(8, 'Mindestens 8 Zeichen')
  .regex(/[A-Z]/, 'Mindestens ein Grossbuchstabe')
  .regex(/[0-9]/, 'Mindestens eine Zahl');

export const slugSchema = z.string()
  .min(3)
  .max(64)
  .regex(/^[a-z0-9-]+$/, 'Nur Kleinbuchstaben, Zahlen und Bindestriche');

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const idSchema = z.string().min(1).max(64);

export const congressIdSchema = z.string().min(1, 'Congress ID required');
