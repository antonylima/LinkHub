import React, { useState } from 'react';
import type { LinkItem, Category } from '../types';
import { getFaviconUrl, getDomain, formatUrl } from '../utils/favicon';
import { Star, MoreVertical, Edit2, Trash2, Globe, Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  link: LinkItem;
  category?: Category;
  onEdit: (link: LinkItem) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onIncrementClicks: (id: string) => void;
  isAdmin?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  isSelectionMode?: boolean;
}

export const LinkTile: React.FC<Props> = ({
  link,
  onEdit,
  onDelete,
  onToggleFavorite,
  onIncrementClicks,
  isAdmin = false,
  isSelected = false,
  onToggleSelect,
  isSelectionMode = false,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  const faviconUrl = link.customIcon || getFaviconUrl(link.url);
  const domain = getDomain(link.url);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!link.isFavorite) {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      confetti({
        particleCount: 25,
        spread: 40,
        origin: {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight,
        },
        colors: ['#fbbf24', '#f59e0b', '#d97706'],
      });
    }
    onToggleFavorite(link.id);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(formatUrl(link.url));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCardClick = () => {
    if (isSelectionMode && onToggleSelect) {
      onToggleSelect(link.id);
      return;
    }
    onIncrementClicks(link.id);
    window.open(formatUrl(link.url), '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative flex flex-col items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border shadow-xs hover:shadow-lg hover:-translate-y-1 active:translate-y-0 transition-all duration-150 cursor-pointer select-none text-center ${
        isSelected
          ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-indigo-50/20 dark:bg-indigo-950/20'
          : 'border-slate-200/90 dark:border-slate-800/90 hover:border-indigo-400 dark:hover:border-indigo-500'
      }`}
    >
      {/* Selection checkbox */}
      {isAdmin && onToggleSelect && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(link.id);
          }}
          className={`absolute top-2 left-2 z-10 w-4.5 h-4.5 rounded-lg border flex items-center justify-center transition-all ${
            isSelected
              ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
              : isSelectionMode
              ? 'border-slate-300 dark:border-slate-600 bg-white/90 dark:bg-slate-800/90'
              : 'opacity-0 group-hover:opacity-100 border-slate-300 dark:border-slate-600 bg-white/90 dark:bg-slate-800/90 hover:border-indigo-500'
          }`}
          title={isSelected ? 'Desmarcar' : 'Selecionar'}
        >
          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
        </button>
      )}

      {/* Top right: Favorite toggle */}
      <button
        onClick={handleFavoriteClick}
        className={`absolute top-2 right-2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10 ${
          link.isFavorite ? 'text-amber-500' : 'text-slate-200 dark:text-slate-700 group-hover:text-slate-400 hover:text-amber-500'
        }`}
      >
        <Star className={`w-3.5 h-3.5 ${link.isFavorite ? 'fill-amber-400' : ''}`} />
      </button>

      {/* Center: App Icon */}
      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center my-2 shadow-xs group-hover:scale-110 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/40 group-hover:shadow-indigo-500/20 group-hover:shadow-md transition-all">
        {!imgError && faviconUrl ? (
          <img
            src={faviconUrl}
            alt={link.title}
            onError={() => setImgError(true)}
            className="w-7 h-7 object-contain rounded"
            loading="lazy"
          />
        ) : (
          <Globe className="w-6 h-6 text-slate-400" />
        )}
      </div>

      {/* Title & Domain */}
      <div className="w-full px-1">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {link.title}
        </h4>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate block">
          {domain}
        </span>
      </div>

      {/* Hover action menu for admin */}
      {isAdmin && (
        <div
          className="absolute bottom-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 bottom-full mb-1 w-28 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-30">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(link);
                  }}
                  className="w-full px-2.5 py-1 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-700 flex items-center gap-1.5"
                >
                  <Edit2 className="w-3 h-3 text-indigo-500" />
                  Editar
                </button>
                <button
                  onClick={handleCopy}
                  className="w-full px-2.5 py-1 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-700 flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  Copiar
                </button>
                <div className="my-0.5 border-t border-slate-100 dark:border-slate-700" />
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(link.id);
                  }}
                  className="w-full px-2.5 py-1 text-left text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1.5"
                >
                  <Trash2 className="w-3 h-3" />
                  Excluir
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
