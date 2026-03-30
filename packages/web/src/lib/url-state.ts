import type { ClassificationInput } from '@eu-ai-act/sdk';

export function encodeClassificationInput(input: ClassificationInput): string {
  return btoa(JSON.stringify(input))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function decodeClassificationInput(
  encoded: string,
): ClassificationInput | null {
  try {
    const padded = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(padded);
    return JSON.parse(json) as ClassificationInput;
  } catch {
    return null;
  }
}
