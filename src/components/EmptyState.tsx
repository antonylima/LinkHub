import React from 'react';
import { Search, Plus, BookmarkX } from 'lucide-react';

interface Props {
  isSearch: boolean;
  searchQuery?: string;
  onAddLink: () => void;
  onClearFilters: () => void;
}

export const EmptyState: React.FC<Props> = ({
  isSearch,
  searchQuery,
  onAddLink,
  onClearFilters,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white/60 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 my-6">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 shadow-inner">
        {isSearch ? <Search className="w-8 h-8" /> : <BookmarkX className="w-8 h-8" />}
      </div>

      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">
        {isSearch
          ? `Nenhum resultado para "${searchQuery}"`
          : 'Nenhum link encontrado nesta categoria'}
      </h3>

      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
        {isSearch
          ? 'Tente buscar por outro termo, tag ou limpe o filtro atual para ver todos os links salvos.'
          : 'Adicione seus links favoritos ou importe seus marcadores para começar a organizar sua central.'}
      </p>

      <div className="flex items-center gap-3">
        {isSearch ? (
          <button
            onClick={onClearFilters}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            Limpar Busca
          </button>
        ) : null}

        <button
          onClick={onAddLink}
          className="px-4.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Adicionar Primeiro Link
        </button>
      </div>
    </div>
  );
};
