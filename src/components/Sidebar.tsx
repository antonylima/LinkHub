import React from 'react';
import type { Category, SortOption } from '../types';
import { renderCategoryIcon, getCategoryColor } from '../utils/iconHelper';
import {
  LayoutList,
  Star,
  Flame,
  Plus,
  Tag,
  Edit2,
  Trash2,
} from 'lucide-react';

interface Props {
  categories: (Category & { count?: number })[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  allTags: { name: string; count: number }[];
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  onOpenAddCategory: () => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (id: string) => void;
  stats: {
    totalLinks: number;
    totalFavorites: number;
    totalCategories: number;
    totalClicks: number;
  };
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isAdmin: boolean;
  onRequireAdmin: () => void;
}

export const Sidebar: React.FC<Props> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  selectedTag,
  onSelectTag,
  allTags,
  sortOption,
  onSortChange,
  onOpenAddCategory,
  onEditCategory,
  onDeleteCategory,
  stats,
  isMobileOpen,
  onCloseMobile,
  isAdmin,
  onRequireAdmin,
}) => {
  const content = (
    <div className="flex flex-col h-full space-y-6">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2 px-3">
          Navegação Principal
        </span>
        <div className="space-y-1">
          <button
            onClick={() => {
              onSelectCategory('all');
              onSelectTag(null);
              onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === 'all' && !selectedTag
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutList className="w-4 h-4" />
              <span>Todos os Links</span>
            </div>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
                selectedCategory === 'all' && !selectedTag
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}
            >
              {stats.totalLinks}
            </span>
          </button>

          <button
            onClick={() => {
              onSelectCategory('favorites');
              onSelectTag(null);
              onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === 'favorites' && !selectedTag
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>Apenas Favoritos</span>
            </div>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
                selectedCategory === 'favorites' && !selectedTag
                  ? 'bg-white/20 text-white'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
              }`}
            >
              {stats.totalFavorites}
            </span>
          </button>

          <button
            onClick={() => {
              onSelectCategory('popular');
              onSelectTag(null);
              onCloseMobile();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === 'popular' && !selectedTag
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Flame className="w-4 h-4 text-rose-500" />
              <span>Mais Acessados</span>
            </div>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
                selectedCategory === 'popular' && !selectedTag
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}
            >
              {stats.totalClicks} clicks
            </span>
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex items-center justify-between px-3 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Categorias ({categories.length})
          </span>
          {isAdmin ? (
            <button
              onClick={onOpenAddCategory}
              className="p-1 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
              title="Criar Nova Categoria"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onRequireAdmin}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              title="Desbloquear para gerenciar categorias"
            >
              <Plus className="w-3.5 h-3.5 opacity-50" />
            </button>
          )}
        </div>

        <div className="space-y-1 overflow-y-auto max-h-56 pr-1">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id && !selectedTag;
            const catColor = getCategoryColor(cat.color);

            return (
              <div
                key={cat.id}
                className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                }`}
                onClick={() => {
                  onSelectCategory(cat.id);
                  onSelectTag(null);
                  onCloseMobile();
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`p-1.5 rounded-lg ${catColor.bg} ${catColor.text}`}>
                    {renderCategoryIcon(cat.icon, 'w-3.5 h-3.5')}
                  </span>
                  <span className="truncate">{cat.name}</span>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-slate-400 font-mono group-hover:hidden">
                    {cat.count || 0}
                  </span>

                  {isAdmin && (
                    <div
                      className="hidden group-hover:flex items-center gap-0.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => onEditCategory(cat)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700"
                        title="Editar Categoria"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onDeleteCategory(cat.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-700"
                        title="Excluir Categoria"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {allTags.length > 0 && (
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Tags Populares
            </span>
            {selectedTag && (
              <button
                onClick={() => onSelectTag(null)}
                className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Limpar tag
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1 px-2 max-h-32 overflow-y-auto">
            {allTags.map((t) => {
              const isSelected = selectedTag === t.name;
              return (
                <button
                  key={t.name}
                  onClick={() => {
                    onSelectTag(isSelected ? null : t.name);
                    onCloseMobile();
                  }}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600'
                  }`}
                >
                  <Tag className="w-2.5 h-2.5 opacity-60" />
                  {t.name}
                  <span className="text-[9px] opacity-70 font-mono">({t.count})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-3">
          Ordenar Por
        </label>
        <select
          value={sortOption}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="recent">Mais Recentes</option>
          <option value="alphabetical">Alfabética (A-Z)</option>
          <option value="clicks">Mais Acessados</option>
          <option value="favorite">Favoritos Primeiro</option>
        </select>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:block w-64 shrink-0 py-6 pr-6 border-r border-slate-200/80 dark:border-slate-800 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
        {content}
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-full bg-white dark:bg-slate-900 h-full p-6 shadow-2xl overflow-y-auto border-r border-slate-200 dark:border-slate-800 animate-in slide-in-from-left">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
