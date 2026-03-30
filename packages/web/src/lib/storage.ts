'use client';

import type { StateFile, ChecklistProgress } from '@eu-ai-act/sdk';

const STORAGE_KEY = 'eu-ai-act-state';

export function getState(): StateFile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StateFile;
  } catch {
    return null;
  }
}

export function setState(state: StateFile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearState(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function exportState(): void {
  const state = getState();
  if (!state) return;

  const blob = new Blob([JSON.stringify(state, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '.eu-ai-act.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importState(file: File): Promise<StateFile> {
  const text = await file.text();
  const parsed = JSON.parse(text) as StateFile;

  if (!parsed.version || !parsed.system || !parsed.classification || !parsed.checklist) {
    throw new Error('Invalid state file: missing required fields');
  }

  setState(parsed);
  return parsed;
}

export function getChecklistProgress(
  tier: string,
): Record<string, ChecklistProgress> {
  const state = getState();
  if (!state || state.classification.tier !== tier) return {};
  return state.checklist;
}

export function setChecklistProgress(
  tier: string,
  progress: Record<string, ChecklistProgress>,
): void {
  const state = getState();
  if (state) {
    state.checklist = progress;
    setState(state);
  }
}
