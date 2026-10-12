// Learner memory. One localStorage key; the Store interface lets us swap in Supabase later.
export interface Flag { page: string; section: string; concept?: string; text?: string; at: number }
export interface Attempt {
  page: string; q: string; concept: string; ok: boolean; pick: number; // pick -1 = "just show me"
  misconception?: string; shown: boolean; at: number;
}
export interface Report { page: string; section: string; selection: string; answer: string; at: number }
export interface Data {
  v: 2; flags: Flag[]; attempts: Attempt[]; reports: Report[]; passcode: string;
  wrongAnswers?: Attempt[]; // reserved
}

export interface Store {
  load(): Data;
  save(d: Data): void;
  addFlag(f: Omit<Flag, 'at'>): Flag;
  clearFlag(f: Flag): void;
  flagsFor(page: string): Flag[];
  addAttempt(a: Omit<Attempt, 'at'>): void;
  clearAttempts(page?: string, q?: string): void;
  recentWrong(page: string, n: number): Attempt[];
  addReport(r: Omit<Report, 'at'>): void;
  passcode: string;
  exportJSON(): string;
  importJSON(file: File): Promise<void>;
  onChange(cb: () => void): () => void;
}

const KEY = 'lh2';
const empty = (): Data => ({ v: 2, flags: [], attempts: [], reports: [], passcode: '' });
const sameFlag = (a: Flag, b: Flag) => a.at === b.at && a.page === b.page && a.section === b.section && a.text === b.text;

/** Latest attempt per (page, q). */
export function latest(attempts: Attempt[]): Attempt[] {
  const m = new Map<string, Attempt>();
  for (const a of attempts) m.set(a.page + '|' + a.q, a);
  return [...m.values()];
}
/** Questions whose latest attempt is wrong (a later correct attempt clears it). */
export const wrongNow = (attempts: Attempt[]) => latest(attempts).filter((a) => !a.ok);

const listeners = new Set<() => void>();
const fire = () => listeners.forEach((cb) => cb());
try { addEventListener('storage', (e) => { if (e.key === KEY) fire(); }); } catch {}

function load(): Data {
  try {
    const d = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (d && d.v === 2) return { ...empty(), ...d };
  } catch {}
  return empty();
}
function save(d: Data) {
  try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {}
  fire();
}

export const store: Store = {
  load, save,
  addFlag(f) {
    const d = load(); const full = { ...f, at: Date.now() };
    d.flags.push(full); save(d); return full;
  },
  clearFlag(f) { const d = load(); d.flags = d.flags.filter((x) => !sameFlag(x, f)); save(d); },
  flagsFor: (page) => load().flags.filter((f) => f.page === page),
  addAttempt(a) { const d = load(); d.attempts.push({ ...a, at: Date.now() }); save(d); },
  clearAttempts(page, q) {
    const d = load();
    d.attempts = d.attempts.filter((a) => !((!page || a.page === page) && (!q || a.q === q)));
    save(d);
  },
  recentWrong: (page, n) => wrongNow(load().attempts.filter((a) => a.page === page)).sort((a, b) => b.at - a.at).slice(0, n),
  addReport(r) { const d = load(); d.reports.push({ ...r, at: Date.now() }); save(d); },
  get passcode() { return load().passcode; },
  set passcode(p: string) { const d = load(); d.passcode = p; save(d); },
  exportJSON: () => JSON.stringify(load(), null, 2),
  async importJSON(file) {
    const d = JSON.parse(await file.text());
    if (!d || d.v !== 2) throw new Error('Not a learning-hub v2 export');
    save({ ...empty(), ...d });
  },
  onChange(cb) { listeners.add(cb); return () => listeners.delete(cb); },
};

/** Has this question been answered (or shown) at all? For the tutor: hint vs explain mode. */
export const isAttempted = (page: string, q: string) => load().attempts.some((a) => a.page === page && a.q === q);
/** Total "shaky" items: flags + distinct questions currently wrong. */
export const shakyCount = () => { const d = load(); return d.flags.length + wrongNow(d.attempts).length; };
