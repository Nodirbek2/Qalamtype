/** Keep production auth on the public domain; retain local development callbacks. */
export function getAuthRedirectUrl(origin: string): string {
  const url = new URL(origin);
  const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  return isLocal ? `${url.origin}/` : 'https://www.qalamtype.uz/';
}
