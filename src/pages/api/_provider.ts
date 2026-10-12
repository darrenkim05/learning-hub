// Single LLM provider call (Gemini REST). Swap this file to change provider.
export interface Msg { role: 'user' | 'assistant'; content: string }
export class ProviderError extends Error {
  constructor(public kind: 'rate' | 'fail' | 'nokey', msg: string) { super(msg); }
}
// Free-tier stable Flash model (override with GEMINI_MODEL).
const DEFAULT_MODEL = 'gemini-2.5-flash';

export async function callModel(system: string, messages: Msg[]): Promise<string> {
  const key = process.env.GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;
  if (!key) throw new ProviderError('nokey', 'GEMINI_API_KEY missing');
  const model = process.env.GEMINI_MODEL || import.meta.env.GEMINI_MODEL || DEFAULT_MODEL;
  let r: Response;
  try {
    r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
        generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
      }),
      signal: AbortSignal.timeout(25000),
    });
  } catch { throw new ProviderError('fail', 'network'); }
  if (r.status === 429) throw new ProviderError('rate', 'rate limited');
  if (!r.ok) throw new ProviderError('fail', `provider ${r.status}`);
  const j: any = await r.json().catch(() => null);
  const text = j?.candidates?.[0]?.content?.parts?.map((p: any) => p.text ?? '').join('').trim();
  if (!text) throw new ProviderError('fail', 'empty answer');
  return text;
}
