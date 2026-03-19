/**
 * Prompts for AI-powered session summarization and keyword extraction.
 */

/**
 * Build a prompt that instructs the model to produce a structured summary
 * with exactly three sentences and a list of key points.
 */
export function buildSummaryPrompt(transcript: string): string {
  return `You are a scientific summarizer. Summarize the following session transcript.

Output format (JSON):
{
  "summary": "<exactly 3 concise sentences>",
  "keyPoints": ["<point 1>", "<point 2>", "..."]
}

Rules:
- Be factual and scientific in tone.
- Include the most important findings, conclusions, and recommendations.
- Key points should be short bullet-style strings (max 15 words each).
- Output valid JSON only, no markdown fences.

Transcript:
${transcript}`;
}

/**
 * Build a prompt for extracting keywords / tags from a block of text.
 */
export function buildKeywordsPrompt(text: string): string {
  return `Extract 5-10 keywords or key phrases from the following scientific text.
Return them as a JSON array of strings. Output valid JSON only, no markdown fences.

Text:
${text}`;
}
