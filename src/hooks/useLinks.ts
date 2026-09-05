import { useState, useMemo, useCallback, useEffect } from 'react';
import type { Category, LinkItem, SortOption, ViewMode, ToastMessage } from '../types';
import { INITIAL_CATEGORIES, INITIAL_LINKS } from '../data/initialData';
import { useLocalStorage } from './useLocalStorage';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

function mapDbToLink(row: any): LinkItem {
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    description: row.description || '',
    categoryId: row.category_id || '',
    tags: Array.isArray(row.tags) ? row.tags : [],
    isFavorite: Boolean(row.is_favorite),
    customIcon: row.custom_icon || undefined,
    clicks: Number(row.clicks) || 0,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : undefined,
  };
}

function mapDbToCategory(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon || 'Folder',
    color: row.color || 'indigo',
    description: row.description || '',
  };
}

export function useLinks() {
  const { user, isAuthenticated, isConfigured } = useAuth();

  // Local storage state (used as fallback or for guest mode)
  const [localLinks, setLocalLinks] = useLocalStorage<LinkItem[]>('linkhub_links', INITIAL_LINKS);
  const [localCategories, setLocalCategories] = useLocalStorage<Category[]>('linkhub_categories', INITIAL_CATEGORIES);

  // Active state displayed in UI
  const [links, setLinks] = useState<LinkItem[]>(localLinks);
  const [categories, setCategories] = useState<Category[]>(localCategories);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

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

  // Fetch from Supabase when user is authenticated
  const fetchSupabaseData = useCallback(async (userId: string) => {
    if (!isConfigured) return;
    setIsSyncing(true);

    try {
      // 1. Fetch categories
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });

      if (catError) throw catError;

      // 2. Fetch links
      const { data: linkData, error: linkError } = await supabase
        .from('links')
        .select('*')
        .order('created_at', { ascending: false });

      if (linkError) throw linkError;

      // If user has no categories in database yet, auto-seed with default categories
      if (!catData || catData.length === 0) {
        const seedCategories = INITIAL_CATEGORIES.map((c) => ({
          id: c.id,
          user_id: userId,
          name: c.name,
          icon: c.icon,
          color: c.color,
          description: c.description || null,
        }));

        await supabase.from('categories').insert(seedCategories);

        const seedLinks = INITIAL_LINKS.map((l) => ({
          id: l.id,
          user_id: userId,
          category_id: l.categoryId,
          title: l.title,
          url: l.url,
          description: l.description || null,
          tags: l.tags || [],
          is_favorite: l.isFavorite || false,
          clicks: l.clicks || 0,
        }));

        await supabase.from('links').insert(seedLinks);

        setCategories(INITIAL_CATEGORIES);
        setLinks(INITIAL_LINKS);
        showToast('Dados iniciais sincronizados com sua conta Supabase!', 'info');
      } else {
        const mappedCats = catData.map(mapDbToCategory);
        const mappedLinks = (linkData || []).map(mapDbToLink);
        setCategories(mappedCats);
        setLinks(mappedLinks);
      }
    } catch (err: any) {
      console.error('Erro ao carregar dados do Supabase:', err);
      showToast('Erro ao carregar dados da nuvem. Usando modo local.', 'error');
      setCategories(localCategories);
      setLinks(localLinks);
    } finally {
      setIsSyncing(false);
    }
  }, [isConfigured, localCategories, localLinks, showToast]);

  // Handle Auth state changes
  useEffect(() => {
    if (isConfigured && isAuthenticated && user?.id) {
      fetchSupabaseData(user.id);
    } else {
      setCategories(localCategories);
      setLinks(localLinks);
    }
  }, [isAuthenticated, user?.id, isConfigured, fetchSupabaseData, localCategories, localLinks]);

  // CRUD Links
  const addLink = useCallback(async (link: Omit<LinkItem, 'id' | 'createdAt' | 'clicks'>) => {
    const newLink: LinkItem = {
      ...link,
      id: 'link-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      clicks: 0,
      createdAt: Date.now(),
    };

    // Optimistic UI update
    setLinks((prev) => [newLink, ...prev]);

    if (isConfigured && isAuthenticated && user?.id) {
      try {
        const { error } = await supabase.from('links').insert({
          id: newLink.id,
          user_id: user.id,
          category_id: newLink.categoryId || null,
          title: newLink.title,
          url: newLink.url,
          description: newLink.description || null,
          tags: newLink.tags || [],
          is_favorite: newLink.isFavorite,
          clicks: 0,
          custom_icon: newLink.customIcon || null,
        });

        if (error) throw error;
        showToast(`Link "${newLink.title}" salvo no Supabase!`, 'success');
      } catch (err: any) {
        console.error('Erro ao salvar link no Supabase:', err);
        showToast(`Erro ao salvar no banco: ${err.message}`, 'error');
      }
    } else {
      setLocalLinks((prev) => [newLink, ...prev]);
      showToast(`Link "${newLink.title}" adicionado localmente!`, 'success');
    }

    return newLink;
  }, [isAuthenticated, isConfigured, user, setLocalLinks, showToast]);

  const updateLink = useCallback(async (id: string, updatedFields: Partial<Omit<LinkItem, 'id' | 'createdAt'>>) => {
    setLinks((prev) =>
      prev.map((link) => (link.id === id ? { ...link, ...updatedFields, updatedAt: Date.now() } : link))
    );

    if (isConfigured && isAuthenticated && user?.id) {
      try {
        const dbPayload: any = {
          updated_at: new Date().toISOString(),
        };
        if (updatedFields.title !== undefined) dbPayload.title = updatedFields.title;
        if (updatedFields.url !== undefined) dbPayload.url = updatedFields.url;
        if (updatedFields.description !== undefined) dbPayload.description = updatedFields.description || null;
        if (updatedFields.categoryId !== undefined) dbPayload.category_id = updatedFields.categoryId || null;
        if (updatedFields.tags !== undefined) dbPayload.tags = updatedFields.tags;
        if (updatedFields.isFavorite !== undefined) dbPayload.is_favorite = updatedFields.isFavorite;
        if (updatedFields.customIcon !== undefined) dbPayload.custom_icon = updatedFields.customIcon || null;
        if (updatedFields.clicks !== undefined) dbPayload.clicks = updatedFields.clicks;

        const { error } = await supabase
          .from('links')
          .update(dbPayload)
          .eq('id', id);

        if (error) throw error;
        showToast('Link atualizado na nuvem!', 'success');
      } catch (err: any) {
        console.error('Erro ao atualizar link no Supabase:', err);
        showToast(`Erro ao atualizar: ${err.message}`, 'error');
      }
    } else {
      setLocalLinks((prev) =>
        prev.map((link) => (link.id === id ? { ...link, ...updatedFields, updatedAt: Date.now() } : link))
      );
      showToast('Link atualizado localmente!', 'success');
    }
  }, [isAuthenticated, isConfigured, user, setLocalLinks, showToast]);

  const deleteLink = useCallback(async (id: string) => {
    let title = 'Link';
    setLinks((prev) => {
      const linkToDelete = prev.find((l) => l.id === id);
      if (linkToDelete) title = linkToDelete.title;
      return prev.filter((l) => l.id !== id);
    });

    if (isConfigured && isAuthenticated && user?.id) {
      try {
        const { error } = await supabase.from('links').delete().eq('id', id);
        if (error) throw error;
        showToast(`Link "${title}" removido do Supabase.`, 'info');
      } catch (err: any) {
        console.error('Erro ao excluir link:', err);
        showToast(`Erro ao remover: ${err.message}`, 'error');
      }
    } else {
      setLocalLinks((prev) => prev.filter((l) => l.id !== id));
      showToast(`Link "${title}" removido localmente.`, 'info');
    }
  }, [isAuthenticated, isConfigured, user, setLocalLinks, showToast]);

  const toggleFavorite = useCallback(async (id: string) => {
    let nextFav = false;
    let title = '';

    setLinks((prev) =>
      prev.map((link) => {
        if (link.id === id) {
          nextFav = !link.isFavorite;
          title = link.title;
          return { ...link, isFavorite: nextFav };
        }
        return link;
      })
    );

    showToast(nextFav ? `"${title}" adicionado aos favoritos ⭐` : `"${title}" removido dos favoritos`, 'info');

    if (isConfigured && isAuthenticated && user?.id) {
      try {
        await supabase.from('links').update({ is_favorite: nextFav }).eq('id', id);
      } catch (err) {
        console.error('Erro ao alternar favorito no Supabase:', err);
      }
    } else {
      setLocalLinks((prev) =>
        prev.map((link) => (link.id === id ? { ...link, isFavorite: nextFav } : link))
      );
    }
  }, [isAuthenticated, isConfigured, user, setLocalLinks, showToast]);

  const incrementClicks = useCallback(async (id: string) => {
    let nextClicks = 1;
    setLinks((prev) =>
      prev.map((link) => {
        if (link.id === id) {
          nextClicks = (link.clicks || 0) + 1;
          return { ...link, clicks: nextClicks };
        }
        return link;
      })
    );

    if (isConfigured && isAuthenticated && user?.id) {
      try {
        await supabase.from('links').update({ clicks: nextClicks }).eq('id', id);
      } catch (err) {
        console.error('Erro ao incrementar clique no Supabase:', err);
      }
    } else {
      setLocalLinks((prev) =>
        prev.map((link) => (link.id === id ? { ...link, clicks: (link.clicks || 0) + 1 } : link))
      );
    }
  }, [isAuthenticated, isConfigured, user, setLocalLinks]);

  // CRUD Categories
  const addCategory = useCallback(async (cat: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...cat,
      id: 'cat-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    };

    setCategories((prev) => [...prev, newCat]);

    if (isConfigured && isAuthenticated && user?.id) {
      try {
        const { error } = await supabase.from('categories').insert({
          id: newCat.id,
          user_id: user.id,
          name: newCat.name,
          icon: newCat.icon,
          color: newCat.color,
          description: newCat.description || null,
        });
        if (error) throw error;
        showToast(`Categoria "${newCat.name}" salva no Supabase!`, 'success');
      } catch (err: any) {
        console.error('Erro ao criar categoria no Supabase:', err);
        showToast(`Erro ao criar categoria: ${err.message}`, 'error');
      }
    } else {
      setLocalCategories((prev) => [...prev, newCat]);
      showToast(`Categoria "${newCat.name}" criada localmente!`, 'success');
    }

    return newCat;
  }, [isAuthenticated, isConfigured, user, setLocalCategories, showToast]);

  const updateCategory = useCallback(async (id: string, updatedFields: Partial<Omit<Category, 'id'>>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
    );

    if (isConfigured && isAuthenticated && user?.id) {
      try {
        const { error } = await supabase
          .from('categories')
          .update({
            name: updatedFields.name,
            icon: updatedFields.icon,
            color: updatedFields.color,
            description: updatedFields.description || null,
          })
          .eq('id', id);
        if (error) throw error;
        showToast('Categoria atualizada no Supabase!', 'success');
      } catch (err: any) {
        console.error('Erro ao atualizar categoria:', err);
        showToast(`Erro ao atualizar categoria: ${err.message}`, 'error');
      }
    } else {
      setLocalCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
      );
      showToast('Categoria atualizada localmente!', 'success');
    }
  }, [isAuthenticated, isConfigured, user, setLocalCategories, showToast]);

  const deleteCategory = useCallback(async (id: string) => {
    let catName = '';
    setCategories((prev) => {
      const catToDelete = prev.find((c) => c.id === id);
      if (catToDelete) catName = catToDelete.name;
      return prev.filter((c) => c.id !== id);
    });

    setLinks((prev) =>
      prev.map((l) => (l.categoryId === id ? { ...l, categoryId: categories[0]?.id || '' } : l))
    );

    if (selectedCategory === id) {
      setSelectedCategory('all');
    }

    if (isConfigured && isAuthenticated && user?.id) {
      try {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) throw error;
        showToast(`Categoria "${catName}" removida da nuvem.`, 'info');
      } catch (err: any) {
        console.error('Erro ao deletar categoria:', err);
        showToast(`Erro ao deletar categoria: ${err.message}`, 'error');
      }
    } else {
      setLocalCategories((prev) => prev.filter((c) => c.id !== id));
      setLocalLinks((prev) =>
        prev.map((l) => (l.categoryId === id ? { ...l, categoryId: categories[0]?.id || '' } : l))
      );
      showToast(`Categoria "${catName}" removida localmente.`, 'info');
    }
  }, [categories, isAuthenticated, isConfigured, selectedCategory, user, setLocalCategories, setLocalLinks, showToast]);

  // Bulk / Import / Reset
  const importData = useCallback(async (newLinks: Partial<LinkItem>[], newCategoriesList?: string[]) => {
    let createdCats: Category[] = [...categories];

    if (newCategoriesList && newCategoriesList.length > 0) {
      const colors = ['indigo', 'emerald', 'rose', 'amber', 'sky', 'violet', 'teal', 'orange'];
      const icons = ['Folder', 'Bookmark', 'Globe', 'Sparkles', 'Zap', 'BookOpen'];

      for (const catName of newCategoriesList) {
        const existing = createdCats.find((c) => c.name.toLowerCase() === catName.toLowerCase());
        if (!existing) {
          const newCat: Category = {
            id: 'cat-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            name: catName,
            icon: icons[Math.floor(Math.random() * icons.length)],
            color: colors[Math.floor(Math.random() * colors.length)],
          };
          createdCats.push(newCat);

          if (isConfigured && isAuthenticated && user?.id) {
            await supabase.from('categories').insert({
              id: newCat.id,
              user_id: user.id,
              name: newCat.name,
              icon: newCat.icon,
              color: newCat.color,
            });
          }
        }
      }
      setCategories(createdCats);
      setLocalCategories(createdCats);
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
    setLocalLinks((prev) => [...formatted, ...prev]);

    if (isConfigured && isAuthenticated && user?.id) {
      try {
        const dbLinks = formatted.map((l) => ({
          id: l.id,
          user_id: user.id,
          category_id: l.categoryId || null,
          title: l.title,
          url: l.url,
          description: l.description || null,
          tags: l.tags || [],
          is_favorite: l.isFavorite,
          clicks: l.clicks,
        }));
        await supabase.from('links').insert(dbLinks);
        showToast(`${formatted.length} links importados e sincronizados no Supabase!`, 'success');
      } catch (err) {
        console.error('Erro ao importar links no Supabase:', err);
        showToast(`${formatted.length} links importados localmente (erro na nuvem)`, 'info');
      }
    } else {
      showToast(`${formatted.length} links importados com sucesso!`, 'success');
    }
  }, [categories, isAuthenticated, isConfigured, setLocalCategories, setLocalLinks, showToast, user]);

  const resetToDemo = useCallback(async () => {
    setCategories(INITIAL_CATEGORIES);
    setLinks(INITIAL_LINKS);
    setLocalCategories(INITIAL_CATEGORIES);
    setLocalLinks(INITIAL_LINKS);

    if (isConfigured && isAuthenticated && user?.id) {
      try {
        await supabase.from('links').delete().eq('user_id', user.id);
        await supabase.from('categories').delete().eq('user_id', user.id);
        await fetchSupabaseData(user.id);
      } catch (err) {
        console.error('Erro ao redefinir no Supabase:', err);
      }
    }

    showToast('Dados restaurados para o padrão de demonstração!', 'info');
  }, [fetchSupabaseData, isAuthenticated, isConfigured, setLocalCategories, setLocalLinks, showToast, user]);

  const clearAllData = useCallback(async () => {
    setLinks([]);
    setCategories([]);
    setLocalLinks([]);
    setLocalCategories([]);

    if (isConfigured && isAuthenticated && user?.id) {
      try {
        await supabase.from('links').delete().eq('user_id', user.id);
        await supabase.from('categories').delete().eq('user_id', user.id);
      } catch (err) {
        console.error('Erro ao limpar dados no Supabase:', err);
      }
    }

    showToast('Todos os dados foram limpos.', 'info');
  }, [isAuthenticated, isConfigured, setLocalCategories, setLocalLinks, showToast, user]);

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
    isSyncing,
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
    refreshData: () => user?.id && fetchSupabaseData(user.id),
  };
}
