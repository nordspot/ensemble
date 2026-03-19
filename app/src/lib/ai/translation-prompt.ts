/**
 * Prompt for AI-powered content translation.
 */

/**
 * Build a translation prompt that preserves scientific terminology
 * and formatting while translating between languages.
 */
export function buildTranslationPrompt(
  text: string,
  fromLang: string,
  toLang: string,
): string {
  return `Translate the following text from ${fromLang} to ${toLang}.

Rules:
- Preserve scientific and medical terminology accurately.
- Keep proper nouns (names, institutions, product names) unchanged.
- Maintain the original formatting (paragraphs, lists, headings).
- If a term has no standard translation, keep it in the original language and add the translation in parentheses.
- Output only the translated text, nothing else.

Text:
${text}`;
}
