import React, { useState } from 'react';
import type { LinkItem, Category } from '../types';
import { getFaviconUrl, getDomain, formatUrl } from '../utils/favicon';
import { getCategoryColor, renderCategoryIcon } from '../utils/iconHelper';
import {
  Star,
  ExternalLink,
  Copy,
  Check,
  Edit2,
  Trash2,
  Globe,
  MousePointerClick,
} from 'lucide-react';

interface Props {
  link: LinkItem;
  category?: Category;
  onEdit: (link: LinkItem) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onIncrementClicks: (id: string) => void;
  onSelectTag?: (tag: string) => void;
  isAdmin?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  isSelectionMode?: boolean;
}

export const LinkListRow: React.FC<Props> = ({
  link,
  category,
  onEdit,
  onDelete,
  onToggleFavorite,
  onIncrementClicks,
  onSelectTag,
  isAdmin = false,
  isSelected = false,
  onToggleSelect,
  isSelectionMode = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  const domain = getDomain(link.url);
  const faviconUrl = link.customIcon || getFaviconUrl(link.url);
  const catColor = getCategoryColor(category?.color);

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
      className={`group flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border transition-all duration-150 cursor-pointer gap-2.5 ${
        isSelected
          ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-indigo-50/20 dark:bg-indigo-950/20'
          : 'border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/60 hover:shadow-xs'
      }`}
    >
      {/* Left: Checkbox + Favicon + Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {isAdmin && onToggleSelect && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(link.id);
            }}
            className={`shrink-0 w-4.5 h-4.5 rounded-lg border flex items-center justify-center transition-all ${
              isSelected
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                : isSelectionMode
                ? 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 bg-slate-50 dark:bg-slate-800'
                : 'opacity-0 group-hover:opacity-100 border-slate-300 dark:border-slate-600 hover:border-indigo-500 bg-slate-50 dark:bg-slate-800'
            }`}
            title={isSelected ? 'Desmarcar' : 'Selecionar'}
          >
            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
          </button>
        )}

        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
          {!imgError && faviconUrl ? (
            <img
              src={faviconUrl}
              alt={link.title}
              onError={() => setImgError(true)}
              className="w-4 h-4 object-contain"
              loading="lazy"
            />
          ) : (
            <Globe className="w-4 h-4 text-slate-400" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {link.title}
            </h4>
            {link.isFavorite && (
              <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
            <span className="font-mono truncate max-w-[200px]">{domain}</span>
            {link.description && (
              <>
                <span>•</span>
                <span className="truncate hidden md:inline">{link.description}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Center/Right: Category badge + Tags */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        {category && (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border ${catColor.bg} ${catColor.text} ${catColor.border}`}
          >
            {renderCategoryIcon(category.icon, 'w-3 h-3')}
            <span>{category.name}</span>
          </span>
        )}

        {link.tags && link.tags.length > 0 && onSelectTag && (
          <div className="hidden lg:flex items-center gap-1">
            {link.tags.slice(0, 2).map((t) => (
              <button
                key={t}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTag(t);
                }}
                className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                #{t}
              </button>
            ))}
          </div>
        )}

        {link.clicks > 0 && (
          <span className="text-[10px] text-slate-400 flex items-center gap-0.5 hidden xl:flex">
            <MousePointerClick className="w-3 h-3" />
            {link.clicks}
          </span>
        )}

        {/* Row actions */}
        <div className="flex items-center gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onToggleFavorite(link.id)}
            className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
              link.isFavorite ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600 hover:text-amber-500'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${link.isFavorite ? 'fill-amber-400' : ''}`} />
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Copiar URL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => window.open(formatUrl(link.url), '_blank', 'noopener,noreferrer')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Abrir link"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() => onEdit(link)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Editar"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(link.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Excluir"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
