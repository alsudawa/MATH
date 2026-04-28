import { Problem } from './generators';

export interface WrongEntry {
  id: string;
  wid: string;
  gradeCode: string;
  chapId: string;
  chapterName: string;
  problemIndex: number;
  display: string;
  correctAnswer: string;
  userAnswer: string;
  timestamp: number;
}

const STORAGE_KEY = 'mathapp_wrong_notes';
const MAX_ENTRIES = 500;

function load(): WrongEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(entries: WrongEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-MAX_ENTRIES)));
}

export function addWrongEntries(
  wid: string,
  gradeCode: string,
  chapId: string,
  chapterName: string,
  problems: Problem[],
  wrongIndices: number[],
  userAnswers: string[][],
): void {
  const entries = load();
  const now = Date.now();
  for (const i of wrongIndices) {
    const entry: WrongEntry = {
      id: `${wid}-${i}-${now}`,
      wid,
      gradeCode,
      chapId,
      chapterName,
      problemIndex: i,
      display: problems[i].display,
      correctAnswer: problems[i].answer,
      userAnswer: userAnswers[i].join(', '),
      timestamp: now,
    };
    const existingIdx = entries.findIndex(e => e.wid === wid && e.problemIndex === i);
    if (existingIdx >= 0) {
      entries[existingIdx] = entry;
    } else {
      entries.push(entry);
    }
  }
  save(entries);
}

export function getWrongEntries(): WrongEntry[] {
  return load().sort((a, b) => b.timestamp - a.timestamp);
}

export function getWrongEntriesByChapter(gradeCode: string, chapId: string): WrongEntry[] {
  return load()
    .filter(e => e.gradeCode === gradeCode && e.chapId === chapId)
    .sort((a, b) => b.timestamp - a.timestamp);
}

export function removeWrongEntry(id: string): void {
  const entries = load().filter(e => e.id !== id);
  save(entries);
}

export function clearWrongEntries(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getWrongEntriesCount(): number {
  return load().length;
}
