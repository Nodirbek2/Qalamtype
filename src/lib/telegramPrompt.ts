export const TELEGRAM_PROMPT_KEY = 'qalamtype:telegram-shown:v2';

// Calendar days in the visitor's timezone, rather than a rolling 24-hour delay.
export function localDay(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function canShowTelegramPrompt(shownDay: string | null, now = new Date()): boolean {
  return shownDay !== localDay(now);
}
