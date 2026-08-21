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
}) => {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  const domain = getDomain(link.url);
  const faviconUrl = getFaviconUrl(link.url);
  const catColor = getCategoryColor(category?.color);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(formatUrl(link.url));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCardClick = () => {
    onIncrementClicks(link.id);
    window.open(formatUrl(link.url), '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={handleCardClick}
      className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/60 hover:shadow-xs transition-all duration-150 cursor-pointer gap-2.5"
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(link.id);
          }}
          className={`p-1.5 rounded-lg transition-colors shrink-0 ${
            link.isFavorite
              ? 'text-amber-500 bg-amber-50 dark:bg-amber-500/10'
              : 'text-slate-300 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title={link.isFavorite ? 'Remover dos favoritos' : 'Favoritar link'}
        >
          <Star className={`w-3.5 h-3.5 ${link.isFavorite ? 'fill-amber-400' : ''}`} />
        </button>

        <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
          {!imgError && faviconUrl ? (
            <img
              src={faviconUrl}
              alt={link.title}
              onError={() => setImgError(true)}
              className="w-4 h-4 object-contain"
              loading="lazy"
            />
          ) : (
            <Globe className="w-3.5 h-3.5 text-slate-400" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
              {link.title}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-mono hidden md:inline">
              ({domain})
            </span>
          </div>
        </div>
      </div>

      <div
        className="flex items-center gap-2 justify-between sm:justify-end shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {category && (
          <span
            className={`hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${catColor.bg} ${catColor.text}`}
          >
            {renderCategoryIcon(category.icon, 'w-3 h-3')}
            <span className="truncate max-w-[90px]">{category.name}</span>
          </span>
        )}

        {link.tags && link.tags.length > 0 && (
          <div className="hidden xl:flex items-center gap-1">
            {link.tags.slice(0, 2).map((t) => (
              <button
                key={t}
                onClick={() => onSelectTag && onSelectTag(t)}
                className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                #{t}
              </button>
            ))}
          </div>
        )}

        {link.clicks > 0 && (
          <span
            title={`Acessado ${link.clicks} vezes`}
            className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 font-mono"
          >
            <MousePointerClick className="w-3 h-3" />
            {link.clicks}
          </span>
        )}

        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            title={copied ? 'Link copiado!' : 'Copiar URL'}
            className={`p-1.5 rounded-lg border transition-all ${
              copied
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() => onEdit(link)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                title="Editar link"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onDelete(link.id)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                title="Excluir link"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          <a
            href={formatUrl(link.url)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onIncrementClicks(link.id)}
            title="Abrir link"
            className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors ml-0.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
