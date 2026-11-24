import type { Language } from '../types';

export async function loadTypingRegion(): Promise<{ country: string; language: Language }> {
  try {
    const response = await fetch('/api/typing-language', { signal: AbortSignal.timeout(2500) });
    if (response.ok) {
      const region = await response.json();
      if (typeof region.country === 'string' && ['english', 'russian', 'uzbek_latin'].includes(region.language)) return region;
    }
  } catch {
    // Local development and offline launches may have no geolocation endpoint.
  }
  return { country: 'unknown', language: 'english' };
}
