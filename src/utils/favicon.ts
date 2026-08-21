export function getDomain(url: string): string {
  try {
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }
    const parsed = new URL(cleanUrl);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function formatUrl(url: string): string {
  let clean = url.trim();
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = 'https://' + clean;
  }
  return clean;
}

export function getFaviconUrl(url: string, size: number = 64): string {
  const domain = getDomain(url);
  if (!domain || domain.length < 3) {
    return '';
  }
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`;
}

export function getDuckDuckGoFaviconUrl(url: string): string {
  const domain = getDomain(url);
  if (!domain) return '';
  return `https://icons.duckduckgo.com/ip3/${encodeURIComponent(domain)}.ico`;
}
