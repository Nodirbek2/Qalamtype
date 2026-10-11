/** Keep production auth on the public domain; retain local development callbacks. */
export function getAuthRedirectUrl(origin: string): string {
  const url = new URL(origin);
  const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  return isLocal ? `${url.origin}/` : 'https://www.qalamtype.uz/';
}

/** Move owned production aliases to the public origin without losing OAuth fragments. */
export function getCanonicalNavigationTarget(href: string): string | null {
  const url = new URL(href);
  if (!['qalamtype-ke6s.vercel.app', 'qalamtype-k91x.vercel.app', 'qalamtype.uz'].includes(url.hostname)) return null;
  url.protocol = 'https:';
  url.host = 'www.qalamtype.uz';
  return url.href;
}
