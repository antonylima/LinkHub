import { useState } from 'react';
import { useLinks } from './hooks/useLinks';
import { useTheme } from './hooks/useTheme';
import { useAdmin } from './hooks/useAdmin';
import type { LinkItem, Category } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { FavoritesSection } from './components/FavoritesSection';
import { LinkCard } from './components/LinkCard';
import { LinkTile } from './components/LinkTile';
import { LinkListRow } from './components/LinkListRow';
import { LinkModal } from './components/LinkModal';
import { CategoryModal } from './components/CategoryModal';
import { ImportExportModal } from './components/ImportExportModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { AdminModal } from './components/AdminModal';
import { EmptyState } from './components/EmptyState';
import { ToastContainer } from './components/ToastContainer';
import { renderCategoryIcon, getCategoryColor } from './utils/iconHelper';
import {
  X,
  Star,
  Flame,
  Globe,
  Tag,
} from 'lucide-react';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const {
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
  } = useLinks();

  const {
    isAdmin,
    isModalOpen: isAdminModalOpen,
    modalMode: adminModalMode,
    openAdminModal,
    closeAdminModal,
    unlock,
    lock,
    setMasterPassword,
    changePassword,
    resetPassword,
  } = useAdmin();

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'link' | 'category';
    id: string;
    title: string;
  }>({
    isOpen: false,
    type: 'link',
    id: '',
    title: '',
  });

  const handleOpenAddLink = () => {
    if (!isAdmin) {
      openAdminModal();
      return;
    }
    setEditingLink(null);
    setIsLinkModalOpen(true);
  };

  const handleOpenEditLink = (link: LinkItem) => {
    if (!isAdmin) {
      openAdminModal();
      return;
    }
    setEditingLink(link);
    setIsLinkModalOpen(true);
  };

  const handleSaveLink = (linkData: Omit<LinkItem, 'id' | 'createdAt' | 'clicks'>) => {
    if (editingLink) {
      updateLink(editingLink.id, linkData);
    } else {
      addLink(linkData);
    }
  };

  const handleOpenAddCategory = () => {
    if (!isAdmin) {
      openAdminModal();
      return;
    }
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    if (!isAdmin) {
      openAdminModal();
      return;
    }
    setEditingCategory(cat);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (catData: Omit<Category, 'id'>) => {
    if (editingCategory) {
      updateCategory(editingCategory.id, catData);
    } else {
      addCategory(catData);
    }
  };

  const triggerDeleteLink = (id: string) => {
    if (!isAdmin) {
      openAdminModal();
      return;
    }
    const link = links.find((l) => l.id === id);
    setDeleteConfirm({
      isOpen: true,
      type: 'link',
      id,
      title: link ? `Excluir link "${link.title}"?` : 'Excluir link?',
    });
  };

  const triggerDeleteCategory = (id: string) => {
    if (!isAdmin) {
      openAdminModal();
      return;
    }
    const cat = categories.find((c) => c.id === id);
    setDeleteConfirm({
      isOpen: true,
      type: 'category',
      id,
      title: cat ? `Excluir categoria "${cat.name}"?` : 'Excluir categoria?',
    });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm.type === 'link') {
      deleteLink(deleteConfirm.id);
    } else if (deleteConfirm.type === 'category') {
      deleteCategory(deleteConfirm.id);
    }
    setDeleteConfirm({ isOpen: false, type: 'link', id: '', title: '' });
  };

  const handleUnlockAdmin = async (pwd: string) => {
    const success = await unlock(pwd);
    if (success) {
      showToast('Modo de edição desbloqueado com sucesso! 🔓', 'success');
    }
    return success;
  };

  const handleSetupAdmin = async (pwd: string) => {
    await setMasterPassword(pwd);
    showToast('Senha mestre criada e modo de edição ativo! 🛡️', 'success');
  };

  const handleChangePassword = async (oldPwd: string, newPwd: string) => {
    const success = await changePassword(oldPwd, newPwd);
    if (success) {
      showToast('Senha de administrador atualizada!', 'success');
    }
    return success;
  };

  const handleResetPassword = () => {
    resetPassword();
    showToast('Senha de administrador redefinida.', 'info');
  };

  const currentCategoryObj = categories.find((c) => c.id === selectedCategory);
  let currentViewTitle = 'Todos os Links';
  let currentViewIcon = <Globe className="w-5 h-5" />;
  let currentCatColor = getCategoryColor(currentCategoryObj?.color);

  if (selectedCategory === 'favorites') {
    currentViewTitle = 'Links Favoritos';
    currentViewIcon = <Star className="w-5 h-5 fill-amber-400 text-amber-400" />;
  } else if (selectedCategory === 'popular') {
    currentViewTitle = 'Mais Acessados';
    currentViewIcon = <Flame className="w-5 h-5 text-rose-500" />;
  } else if (currentCategoryObj) {
    currentViewTitle = currentCategoryObj.name;
    currentViewIcon = renderCategoryIcon(currentCategoryObj.icon, 'w-5 h-5');
  }

  const showFavoritesBar =
    selectedCategory === 'all' &&
    !selectedTag &&
    !searchQuery.trim() &&
    favoriteLinks.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        theme={theme}
        onThemeToggle={toggleTheme}
        onOpenAddLink={handleOpenAddLink}
        onOpenImportExport={() => {
          if (!isAdmin) {
            openAdminModal();
          } else {
            setIsImportExportOpen(true);
          }
        }}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
        isAdmin={isAdmin}
        onToggleAdmin={() => {
          if (isAdmin) {
            lock();
            showToast('Painel bloqueado (Modo Leitura ativo) 🔒', 'info');
          } else {
            openAdminModal();
          }
        }}
      />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 flex gap-6">
        <Sidebar
          categories={categoriesWithCount}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
          allTags={allTags}
          sortOption={sortOption}
          onSortChange={setSortOption}
          onOpenAddCategory={handleOpenAddCategory}
          onEditCategory={handleOpenEditCategory}
          onDeleteCategory={triggerDeleteCategory}
          stats={stats}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          isAdmin={isAdmin}
          onRequireAdmin={openAdminModal}
        />

        <main className="flex-1 min-w-0 py-5">
          {showFavoritesBar && (
            <FavoritesSection
              favorites={favoriteLinks}
              categories={categories}
              onOpenLink={(link) => {
                incrementClicks(link.id);
                window.open(link.url, '_blank', 'noopener,noreferrer');
              }}
              onToggleFavorite={toggleFavorite}
            />
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl ${
                  selectedCategory === 'favorites'
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                    : selectedCategory === 'popular'
                    ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                    : currentCategoryObj
                    ? `${currentCatColor.bg} ${currentCatColor.text}`
                    : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                }`}
              >
                {currentViewIcon}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {searchQuery ? `Busca: "${searchQuery}"` : currentViewTitle}
                  </h1>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {filteredLinks.length}
                  </span>
                </div>
                {currentCategoryObj?.description && !searchQuery && !selectedTag && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {currentCategoryObj.description}
                  </p>
                )}
              </div>
            </div>

            {selectedTag && (
              <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-3 py-1 rounded-xl">
                <Tag className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                  Tag: #{selectedTag}
                </span>
                <button
                  onClick={() => setSelectedTag(null)}
                  className="text-indigo-600 hover:text-indigo-900 dark:hover:text-white ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {filteredLinks.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-2.5">
                {filteredLinks.map((link) => (
                  <LinkCard
                    key={link.id}
                    link={link}
                    category={categories.find((c) => c.id === link.categoryId)}
                    onEdit={handleOpenEditLink}
                    onDelete={triggerDeleteLink}
                    onToggleFavorite={toggleFavorite}
                    onIncrementClicks={incrementClicks}
                    onSelectTag={setSelectedTag}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            ) : viewMode === 'compact' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
                {filteredLinks.map((link) => (
                  <LinkTile
                    key={link.id}
                    link={link}
                    category={categories.find((c) => c.id === link.categoryId)}
                    onEdit={handleOpenEditLink}
                    onDelete={triggerDeleteLink}
                    onToggleFavorite={toggleFavorite}
                    onIncrementClicks={incrementClicks}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredLinks.map((link) => (
                  <LinkListRow
                    key={link.id}
                    link={link}
                    category={categories.find((c) => c.id === link.categoryId)}
                    onEdit={handleOpenEditLink}
                    onDelete={triggerDeleteLink}
                    onToggleFavorite={toggleFavorite}
                    onIncrementClicks={incrementClicks}
                    onSelectTag={setSelectedTag}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            )
          ) : (
            <EmptyState
              isSearch={Boolean(searchQuery.trim() || selectedTag)}
              searchQuery={searchQuery || (selectedTag ? `#${selectedTag}` : '')}
              onAddLink={handleOpenAddLink}
              onClearFilters={() => {
                setSearchQuery('');
                setSelectedTag(null);
                setSelectedCategory('all');
              }}
            />
          )}
        </main>
      </div>

      <LinkModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        onSave={handleSaveLink}
        editingLink={editingLink}
        categories={categories}
        availableTags={allTags.map((t) => t.name)}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleSaveCategory}
        editingCategory={editingCategory}
      />

      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        links={links}
        categories={categories}
        onImport={importData}
        onResetToDemo={resetToDemo}
        onClearAll={clearAllData}
      />

      <DeleteConfirmModal
        isOpen={deleteConfirm.isOpen}
        title={deleteConfirm.title}
        message={
          deleteConfirm.type === 'link'
            ? 'Tem certeza de que deseja remover este link? Esta ação não pode ser desfeita.'
            : 'Tem certeza de que deseja remover esta categoria? Os links serão preservados.'
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, type: 'link', id: '', title: '' })}
      />

      <AdminModal
        isOpen={isAdminModalOpen}
        mode={adminModalMode}
        onClose={closeAdminModal}
        onUnlock={handleUnlockAdmin}
        onSetup={handleSetupAdmin}
        onChangePassword={handleChangePassword}
        onReset={handleResetPassword}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
