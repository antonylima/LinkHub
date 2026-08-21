import type { Category, LinkItem } from '../types';

export function exportToJson(links: LinkItem[], categories: Category[]): string {
  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    categories,
    links,
  };
  return JSON.stringify(data, null, 2);
}

export function exportToHtmlBookmarks(links: LinkItem[], categories: Category[]): string {
  const categoryMap = new Map<string, LinkItem[]>();
  categories.forEach((cat) => categoryMap.set(cat.id, []));

  const uncategorized: LinkItem[] = [];

  links.forEach((link) => {
    if (categoryMap.has(link.categoryId)) {
      categoryMap.get(link.categoryId)!.push(link);
    } else {
      uncategorized.push(link);
    }
  });

  let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks LinkHub</TITLE>
<H1>Bookmarks</H1>
<DL><p>
`;

  categories.forEach((cat) => {
    const catLinks = categoryMap.get(cat.id) || [];
    if (catLinks.length === 0) return;

    html += `    <DT><H3 ADD_DATE="${Math.floor(Date.now() / 1000)}">${escapeHtml(cat.name)}</H3>\n`;
    html += `    <DL><p>\n`;
    catLinks.forEach((link) => {
      const addDate = Math.floor((link.createdAt || Date.now()) / 1000);
      const tags = link.tags && link.tags.length > 0 ? ` TAGS="${escapeHtml(link.tags.join(','))}"` : '';
      html += `        <DT><A HREF="${escapeHtml(link.url)}" ADD_DATE="${addDate}"${tags}>${escapeHtml(link.title)}</A>\n`;
      if (link.description) {
        html += `        <DD>${escapeHtml(link.description)}\n`;
      }
    });
    html += `    </DL><p>\n`;
  });

  if (uncategorized.length > 0) {
    html += `    <DT><H3 ADD_DATE="${Math.floor(Date.now() / 1000)}">Outros Links</H3>\n`;
    html += `    <DL><p>\n`;
    uncategorized.forEach((link) => {
      const addDate = Math.floor((link.createdAt || Date.now()) / 1000);
      html += `        <DT><A HREF="${escapeHtml(link.url)}" ADD_DATE="${addDate}">${escapeHtml(link.title)}</A>\n`;
    });
    html += `    </DL><p>\n`;
  }

  html += `</DL><p>\n`;
  return html;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function parseHtmlBookmarks(htmlContent: string, defaultCategoryId: string): { links: Partial<LinkItem>[]; newCategories: string[] } {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const links: Partial<LinkItem>[] = [];
  const foundCategories = new Set<string>();

  const folders = doc.querySelectorAll('dt > h3');
  if (folders.length > 0) {
    folders.forEach((folderHeading) => {
      const folderName = folderHeading.textContent?.trim() || 'Importados';
      foundCategories.add(folderName);

      const dl = folderHeading.parentElement?.querySelector('dl');
      if (dl) {
        const aTags = dl.querySelectorAll('a');
        aTags.forEach((a) => {
          const href = a.getAttribute('href');
          const title = a.textContent?.trim();
          if (href && title) {
            links.push({
              title,
              url: href,
              categoryId: folderName,
              isFavorite: false,
              tags: [folderName.toLowerCase().replace(/\s+/g, '-')],
            });
          }
        });
      }
    });
  }

  const allATags = doc.querySelectorAll('a');
  allATags.forEach((a) => {
    const href = a.getAttribute('href');
    const title = a.textContent?.trim();
    if (href && title) {
      const alreadyAdded = links.some((l) => l.url === href);
      if (!alreadyAdded) {
        links.push({
          title,
          url: href,
          categoryId: defaultCategoryId,
          isFavorite: false,
          tags: ['importado'],
        });
      }
    }
  });

  return { links, newCategories: Array.from(foundCategories) };
}
