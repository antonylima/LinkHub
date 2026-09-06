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
      const icon = link.customIcon ? ` ICON="${escapeHtml(link.customIcon)}"` : '';
      html += `        <DT><A HREF="${escapeHtml(link.url)}" ADD_DATE="${addDate}"${tags}${icon}>${escapeHtml(link.title)}</A>\n`;
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

export interface ParsedBookmarkItem {
  title: string;
  url: string;
  description?: string;
  categoryName: string;
  customIcon?: string;
  tags: string[];
  createdAt: number;
}

export interface ChromeBookmarkParseResult {
  links: ParsedBookmarkItem[];
  categories: { name: string; count: number }[];
  totalLinks: number;
}

function normalizeCategoryName(raw: string): string {
  const clean = raw.trim();
  const lower = clean.toLowerCase();
  if (lower === 'barra de favoritos' || lower === 'bookmarks bar' || lower === 'favoritos' || lower === 'bookmarks') {
    return 'Favoritos';
  }
  if (lower === 'outros favoritos' || lower === 'other bookmarks') {
    return 'Outros';
  }
  if (lower === 'favoritos do celular' || lower === 'mobile bookmarks') {
    return 'Mobile';
  }
  return clean || 'Geral';
}

/**
 * Parses Google Chrome exported bookmarks HTML with full folder hierarchy, favicons and dates.
 */
export function parseChromeBookmarksHtml(htmlContent: string, defaultCategory = 'Favoritos'): ChromeBookmarkParseResult {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');

  const links: ParsedBookmarkItem[] = [];
  const categoryCounts = new Map<string, number>();
  const visitedUrls = new Set<string>();

  function processDL(dlElement: Element, currentCategory: string) {
    // Look at children: mostly DT elements
    for (let i = 0; i < dlElement.children.length; i++) {
      const child = dlElement.children[i];
      if (child.tagName.toUpperCase() !== 'DT') {
        // Sometimes nested DL directly
        if (child.tagName.toUpperCase() === 'DL') {
          processDL(child, currentCategory);
        }
        continue;
      }

      // Check if this DT has an H3 (folder)
      const h3 = child.querySelector(':scope > h3') || child.querySelector('h3');
      const innerDl = child.querySelector(':scope > dl') || child.querySelector('dl');

      if (h3) {
        const folderName = normalizeCategoryName(h3.textContent || '');
        if (innerDl) {
          processDL(innerDl, folderName);
        } else if (child.nextElementSibling && child.nextElementSibling.tagName.toUpperCase() === 'DL') {
          processDL(child.nextElementSibling, folderName);
        }
      }

      // Check if this DT has an A (bookmark link)
      const a = child.querySelector(':scope > a') || child.querySelector('a');
      if (a) {
        const href = a.getAttribute('href')?.trim();
        const title = a.textContent?.trim() || href || 'Sem título';

        if (href && !href.toLowerCase().startsWith('javascript:') && !href.startsWith('#')) {
          if (!visitedUrls.has(href)) {
            visitedUrls.add(href);

            const icon = a.getAttribute('icon') || a.getAttribute('icon_uri') || undefined;
            const addDateStr = a.getAttribute('add_date');
            let createdAt = Date.now();
            if (addDateStr) {
              const sec = parseInt(addDateStr, 10);
              if (!isNaN(sec) && sec > 0) {
                createdAt = sec * 1000;
              }
            }

            // Look for DD description
            let description: string | undefined = undefined;
            const dd = child.querySelector(':scope > dd') || (child.nextElementSibling?.tagName.toUpperCase() === 'DD' ? child.nextElementSibling : null);
            if (dd) {
              description = dd.textContent?.trim() || undefined;
            }

            const catName = currentCategory || defaultCategory;
            categoryCounts.set(catName, (categoryCounts.get(catName) || 0) + 1);

            const tag = catName.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');

            links.push({
              title,
              url: href,
              description,
              categoryName: catName,
              customIcon: icon,
              tags: tag ? [tag] : ['chrome'],
              createdAt,
            });
          }
        }
      }
    }
  }

  // Find root DL element
  const rootDl = doc.querySelector('dl');
  if (rootDl) {
    processDL(rootDl, defaultCategory);
  } else {
    // Fallback: search all <a> tags directly if no standard DL found
    const allATags = doc.querySelectorAll('a');
    allATags.forEach((a) => {
      const href = a.getAttribute('href')?.trim();
      const title = a.textContent?.trim() || href || 'Sem título';
      if (href && !href.toLowerCase().startsWith('javascript:') && !href.startsWith('#') && !visitedUrls.has(href)) {
        visitedUrls.add(href);
        categoryCounts.set(defaultCategory, (categoryCounts.get(defaultCategory) || 0) + 1);
        links.push({
          title,
          url: href,
          categoryName: defaultCategory,
          customIcon: a.getAttribute('icon') || undefined,
          tags: ['chrome'],
          createdAt: Date.now(),
        });
      }
    });
  }

  const categories = Array.from(categoryCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return {
    links,
    categories,
    totalLinks: links.length,
  };
}

/**
 * Backward compatibility parser wrapper
 */
export function parseHtmlBookmarks(htmlContent: string, defaultCategoryId: string): { links: Partial<LinkItem>[]; newCategories: string[] } {
  const result = parseChromeBookmarksHtml(htmlContent, defaultCategoryId);
  const formattedLinks: Partial<LinkItem>[] = result.links.map((item) => ({
    title: item.title,
    url: item.url,
    description: item.description,
    categoryId: item.categoryName,
    customIcon: item.customIcon,
    tags: item.tags,
    isFavorite: false,
    createdAt: item.createdAt,
  }));

  return {
    links: formattedLinks,
    newCategories: result.categories.map((c) => c.name),
  };
}
