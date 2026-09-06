import React from 'react';
import { CheckSquare, Trash2, X, CheckCheck } from 'lucide-react';

interface Props {
  selectedCount: number;
  totalVisibleCount: number;
  isAllSelected: boolean;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
  onCloseSelectionMode: () => void;
}

export const BulkActionBar: React.FC<Props> = ({
  selectedCount,
  totalVisibleCount,
  isAllSelected,
  onSelectAll,
  onClearSelection,
  onDeleteSelected,
  onCloseSelectionMode,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 inset-x-0 z-40 flex justify-center px-4 pointer-events-none animate-in slide-in-from-bottom-5 duration-200">
      <div className="pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 shadow-2xl rounded-2xl px-4 py-3 flex items-center gap-3 sm:gap-4 max-w-xl w-full justify-between">
        {/* Left: Count */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              {selectedCount} {selectedCount === 1 ? 'link selecionado' : 'links selecionados'}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              de {totalVisibleCount} visíveis
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={isAllSelected ? onClearSelection : onSelectAll}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            title={isAllSelected ? 'Desmarcar todos os visíveis' : 'Selecionar todos os links visíveis'}
          >
            <CheckCheck className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">
              {isAllSelected ? 'Desmarcar' : 'Todos'}
            </span>
          </button>

          <button
            type="button"
            onClick={onDeleteSelected}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/25 transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Excluir</span>
          </button>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-0.5" />

          <button
            type="button"
            onClick={onCloseSelectionMode}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Cancelar seleção"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
