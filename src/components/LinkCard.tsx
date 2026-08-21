import React, { useState } from 'react';
import type { LinkItem, Category } from '../types';
import { getFaviconUrl, getDomain, formatUrl } from '../utils/favicon';
import { getCategoryColor } from '../utils/iconHelper';
import {
  Star,
  Copy,
  Check,
  MoreVertical,
  Edit2,
  Trash2,
  Globe,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';

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

export const LinkCard: React.FC<Props> = ({
  link,
  category,
  onEdit,
  onDelete,
  onToggleFavorite,
  onIncrementClicks,
  isAdmin = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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

  const handleCardClick = () => {
    onIncrementClicks(link.id);
    window.open(formatUrl(link.url), '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-150 cursor-pointer select-none gap-2.5 overflow-visible"
    >
      {/* Left: Favicon + Titles */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="relative w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200/60 dark:border-slate-700/60 group-hover:scale-105 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/40 group-hover:border-indigo-200 dark:group-hover:border-indigo-800 transition-all shrink-0">
          {!imgError && faviconUrl ? (
            <img
              src={faviconUrl}
              alt={link.title}
              onError={() => setImgError(true)}
              className="w-5 h-5 object-contain"
              loading="lazy"
            />
          ) : (
            <Globe className="w-4 h-4 text-slate-400" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {link.title}
            </h3>
            {link.isFavorite && (
              <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 truncate">
            <span className="font-mono truncate">{domain}</span>
            {category && (
              <>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className={`truncate font-medium ${catColor.text}`}>
                  {category.name}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div
        className="flex items-center gap-0.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleFavoriteClick}
          title={link.isFavorite ? 'Remover dos favoritos' : 'Favoritar link'}
          className={`p-1.5 rounded-lg transition-colors ${
            link.isFavorite
              ? 'text-amber-500 bg-amber-50 dark:bg-amber-500/10'
              : 'text-slate-300 dark:text-slate-600 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${link.isFavorite ? 'fill-amber-400' : ''}`} />
        </button>

        <button
          onClick={handleCopy}
          title={copied ? 'Link copiado!' : 'Copiar link'}
          className={`p-1.5 rounded-lg border transition-all ${
            copied
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        </button>

        {isAdmin ? (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Opções de administrador"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1 w-36 py-1 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 animate-in fade-in zoom-in-95">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(link);
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center gap-2"
                  >
                    <Edit2 className="w-3 h-3" /> Editar
                  </button>
                  <a
                    href={formatUrl(link.url)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => {
                      setMenuOpen(false);
                      onIncrementClicks(link.id);
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 flex items-center gap-2"
                  >
                    <ExternalLink className="w-3 h-3" /> Abrir Link
                  </a>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(link.id);
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-2"
                  >
                    <Trash2 className="w-3 h-3" /> Excluir
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <a
            href={formatUrl(link.url)}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => {
              e.stopPropagation();
              onIncrementClicks(link.id);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Abrir em nova aba"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
};
