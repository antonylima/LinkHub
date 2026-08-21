import { useState, useMemo, useCallback } from 'react';
import type { Category, LinkItem, SortOption, ViewMode, ToastMessage } from '../types';
import { INITIAL_CATEGORIES, INITIAL_LINKS } from '../data/initialData';
import { useLocalStorage } from './useLocalStorage';

export function useLinks() {
  const [links, setLinks] = useLocalStorage<LinkItem[]>('linkhub_links', INITIAL_LINKS);
  const [categories, setCategories] = useLocalStorage<Category[]>('linkhub_categories', INITIAL_CATEGORIES);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>('linkhub_view_mode', 'grid');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // CRUD Links
  const addLink = useCallback((link: Omit<LinkItem, 'id' | 'createdAt' | 'clicks'>) => {
    const newLink: LinkItem = {
      ...link,
      id: 'link-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      clicks: 0,
      createdAt: Date.now(),
    };
    setLinks((prev) => [newLink, ...prev]);
    showToast(`Link "${newLink.title}" adicionado com sucesso!`, 'success');
    return newLink;
  }, [setLinks, showToast]);

  const updateLink = useCallback((id: string, updatedFields: Partial<Omit<LinkItem, 'id' | 'createdAt'>>) => {
    setLinks((prev) =>
      prev.map((link) => (link.id === id ? { ...link, ...updatedFields, updatedAt: Date.now() } : link))
    );
    showToast('Link atualizado com sucesso!', 'success');
  }, [setLinks, showToast]);

  const deleteLink = useCallback((id: string) => {
    setLinks((prev) => {
      const linkToDelete = prev.find((l) => l.id === id);
      const title = linkToDelete ? linkToDelete.title : 'Link';
      showToast(`Link "${title}" removido.`, 'info');
      return prev.filter((l) => l.id !== id);
    });
  }, [setLinks, showToast]);

  const toggleFavorite = useCallback((id: string) => {
    setLinks((prev) =>
      prev.map((link) => {
        if (link.id === id) {
          const nextFav = !link.isFavorite;
          showToast(nextFav ? `"${link.title}" adicionado aos favoritos ⭐` : `"${link.title}" removido dos favoritos`, 'info');
          return { ...link, isFavorite: nextFav };
        }
        return link;
      })
    );
  }, [setLinks, showToast]);

  const incrementClicks = useCallback((id: string) => {
    setLinks((prev) =>
      prev.map((link) => (link.id === id ? { ...link, clicks: (link.clicks || 0) + 1 } : link))
    );
  }, [setLinks]);

  // CRUD Categories
  const addCategory = useCallback((cat: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...cat,
      id: 'cat-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    };
    setCategories((prev) => [...prev, newCat]);
    showToast(`Categoria "${newCat.name}" criada!`, 'success');
    return newCat;
  }, [setCategories, showToast]);

  const updateCategory = useCallback((id: string, updatedFields: Partial<Omit<Category, 'id'>>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
    );
    showToast('Categoria atualizada!', 'success');
  }, [setCategories, showToast]);

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => {
      const catToDelete = prev.find((c) => c.id === id);
      showToast(`Categoria "${catToDelete?.name || ''}" removida.`, 'info');
      return prev.filter((c) => c.id !== id);
    });
    setLinks((prev) =>
      prev.map((l) => (l.categoryId === id ? { ...l, categoryId: categories[0]?.id || '' } : l))
    );
    if (selectedCategory === id) {
      setSelectedCategory('all');
    }
  }, [categories, selectedCategory, setCategories, setLinks, showToast]);

  // Bulk / Import / Reset
  const importData = useCallback((newLinks: Partial<LinkItem>[], newCategoriesList?: string[]) => {
    let createdCats: Category[] = [...categories];

    if (newCategoriesList && newCategoriesList.length > 0) {
      const colors = ['indigo', 'emerald', 'rose', 'amber', 'sky', 'violet', 'teal', 'orange'];
      const icons = ['Folder', 'Bookmark', 'Globe', 'Sparkles', 'Zap', 'BookOpen'];

      newCategoriesList.forEach((catName) => {
        const existing = createdCats.find((c) => c.name.toLowerCase() === catName.toLowerCase());
        if (!existing) {
          const newCat: Category = {
            id: 'cat-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            name: catName,
            icon: icons[Math.floor(Math.random() * icons.length)],
            color: colors[Math.floor(Math.random() * colors.length)],
          };
          createdCats.push(newCat);
        }
      });
      setCategories(createdCats);
    }

    const defaultCatId = createdCats[0]?.id || 'default';
    const formatted: LinkItem[] = newLinks.map((item, index) => {
      let catId = defaultCatId;
      if (item.categoryId) {
        const match = createdCats.find(
          (c) => c.id === item.categoryId || c.name.toLowerCase() === item.categoryId?.toLowerCase()
        );
        if (match) catId = match.id;
      }

      return {
        id: item.id || 'link-import-' + Date.now() + '-' + index + '-' + Math.random().toString(36).substring(2, 4),
        title: item.title || 'Sem título',
        url: item.url || 'https://',
        description: item.description || '',
        categoryId: catId,
        tags: item.tags || [],
        isFavorite: Boolean(item.isFavorite),
        clicks: item.clicks || 0,
        createdAt: item.createdAt || Date.now(),
      };
    });

    setLinks((prev) => [...formatted, ...prev]);
    showToast(`${formatted.length} links importados com sucesso!`, 'success');
  }, [categories, setCategories, setLinks, showToast]);

  const resetToDemo = useCallback(() => {
    setCategories(INITIAL_CATEGORIES);
    setLinks(INITIAL_LINKS);
    showToast('Dados restaurados para o padrão de demonstração!', 'info');
  }, [setCategories, setLinks, showToast]);

  const clearAllData = useCallback(() => {
    setLinks([]);
    setCategories([]);
    showToast('Todos os dados foram limpos.', 'info');
  }, [setCategories, setLinks, showToast]);

  // All Tags list with counts
  const allTags = useMemo(() => {
    const map = new Map<string, number>();
    links.forEach((link) => {
      link.tags?.forEach((t) => {
        const clean = t.trim().toLowerCase();
        if (clean) {
          map.set(clean, (map.get(clean) || 0) + 1);
        }
      });
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [links]);

  // Categories with count
  const categoriesWithCount = useMemo(() => {
    return categories.map((cat) => {
      const count = links.filter((l) => l.categoryId === cat.id).length;
      return { ...cat, count };
    });
  }, [categories, links]);

  // Favorites
  const favoriteLinks = useMemo(() => {
    return links.filter((l) => l.isFavorite);
  }, [links]);

  // Filtered & Sorted Links
  const filteredLinks = useMemo(() => {
    let result = [...links];

    // Filter by Category or Special Views
    if (selectedCategory === 'favorites') {
      result = result.filter((l) => l.isFavorite);
    } else if (selectedCategory === 'popular') {
      result = result.filter((l) => (l.clicks || 0) > 0);
    } else if (selectedCategory !== 'all') {
      result = result.filter((l) => l.categoryId === selectedCategory);
    }

    // Filter by Tag
    if (selectedTag) {
      result = result.filter((l) =>
        l.tags?.some((t) => t.toLowerCase() === selectedTag.toLowerCase())
      );
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.url.toLowerCase().includes(q) ||
          (l.description && l.description.toLowerCase().includes(q)) ||
          l.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortOption === 'alphabetical') {
        return a.title.localeCompare(b.title, 'pt-BR');
      }
      if (sortOption === 'clicks') {
        return (b.clicks || 0) - (a.clicks || 0);
      }
      if (sortOption === 'favorite') {
        if (a.isFavorite === b.isFavorite) {
          return (b.createdAt || 0) - (a.createdAt || 0);
        }
        return a.isFavorite ? -1 : 1;
      }
      return (b.createdAt || 0) - (a.createdAt || 0);
    });

    return result;
  }, [links, selectedCategory, selectedTag, searchQuery, sortOption]);

  const stats = useMemo(() => {
    return {
      totalLinks: links.length,
      totalFavorites: links.filter((l) => l.isFavorite).length,
      totalCategories: categories.length,
      totalClicks: links.reduce((acc, l) => acc + (l.clicks || 0), 0),
    };
  }, [links, categories]);

  return {
    links,
    categories,
    categoriesWithCount,
    favoriteLinks,
    filteredLinks,
    allTags,
    stats,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedTag,
    setSelectedTag,
    sortOption,
    setSortOption,
    viewMode,
    setViewMode,
    toasts,
    showToast,
    removeToast,
    addLink,
    updateLink,
    deleteLink,
    toggleFavorite,
    incrementClicks,
    addCategory,
    updateCategory,
    deleteCategory,
    importData,
    resetToDemo,
    clearAllData,
  };
}
