export const AVATAR_PRESETS = Array.from({ length: 12 }, (_, i) => `/avatars/character-${i + 1}.svg`);

// Random account IDs give each user a varied, stable avatar, including older profiles.
export function defaultAvatar(seed: string): string {
  let hash = 2166136261;
  for (const char of seed || 'guest') hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return AVATAR_PRESETS[(hash >>> 0) % AVATAR_PRESETS.length];
}
