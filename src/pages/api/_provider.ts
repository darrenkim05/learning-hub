// Single LLM provider call (Gemini REST). Swap this file to change provider.
export interface Msg { role: 'user' | 'assistant'; content: string }
export class ProviderError extends Error {
  constructor(public kind: 'rate' | 'fail' | 'nokey', msg: string) { super(msg); }
}
// Free-tier Flash models, tried in order until one exists for this key (override with GEMINI_MODEL).
// gemini-2.5-* is closed to new projects and retires Oct 2026, so newer IDs come first; "-latest" is Google's moving alias.
const MODELS = ['gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-2.5-flash'];

export async function callModel(system: string, messages: Msg[]): Promise<string> {
  const key = process.env.GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;
  if (!key) throw new ProviderError('nokey', 'GEMINI_API_KEY missing');
  const pinned = process.env.GEMINI_MODEL || import.meta.env.GEMINI_MODEL;
  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: system }] },
    contents: messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
    generationConfig: { temperature: 0.4, maxOutputTokens: 1024 },
  });
  for (const model of pinned ? [pinned] : MODELS) {
    let r: Response;
    try {
      r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
        body,
        signal: AbortSignal.timeout(25000),
      });
    } catch { throw new ProviderError('fail', 'network'); }
    if (r.status === 404) { console.warn(`gemini: model ${model} not available, trying next`); continue; }
    if (r.status === 429) throw new ProviderError('rate', 'rate limited');
    if (!r.ok) {
      console.error(`gemini ${model}: ${r.status} ${(await r.text().catch(() => '')).slice(0, 300)}`);
      throw new ProviderError('fail', `provider ${r.status}`);
    }
    const j: any = await r.json().catch(() => null);
    const text = j?.candidates?.[0]?.content?.parts?.map((p: any) => p.text ?? '').join('').trim();
    if (!text) throw new ProviderError('fail', 'empty answer');
    return text;
  }
  throw new ProviderError('fail', 'no available Gemini model (set GEMINI_MODEL)');
}
