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
}

export const LinkTile: React.FC<Props> = ({
  link,
  onEdit,
  onDelete,
  onToggleFavorite,
  onIncrementClicks,
  isAdmin = false,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  const faviconUrl = getFaviconUrl(link.url);
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
    onIncrementClicks(link.id);
    window.open(formatUrl(link.url), '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-xs hover:shadow-md hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all duration-150 cursor-pointer select-none text-center"
    >
      <div
        className="absolute top-1.5 right-1.5 flex items-center opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleFavoriteClick}
          className="p-1 rounded-md text-slate-300 hover:text-amber-500"
          title="Favoritar"
        >
          <Star className={`w-3 h-3 ${link.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
        </button>

        {isAdmin ? (
          <>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <MoreVertical className="w-3 h-3" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1 w-32 py-1 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 animate-in fade-in zoom-in-95 text-left">
                  <button
                    onClick={handleCopy}
                    className="w-full px-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-slate-400" />}
                    {copied ? 'Copiado!' : 'Copiar URL'}
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(link);
                    }}
                    className="w-full px-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3 h-3" /> Editar
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(link.id);
                    }}
                    className="w-full px-2.5 py-1 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3 h-3" /> Excluir
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <button
            onClick={handleCopy}
            className="p-1 rounded-md text-slate-300 hover:text-slate-600 dark:hover:text-slate-200"
            title="Copiar link"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
          </button>
        )}
      </div>

      <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2 border border-slate-200/60 dark:border-slate-700/60 group-hover:scale-110 group-hover:shadow-md group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/50 group-hover:border-indigo-300 transition-all">
        {!imgError && faviconUrl ? (
          <img
            src={faviconUrl}
            alt={link.title}
            onError={() => setImgError(true)}
            className="w-6 h-6 object-contain"
            loading="lazy"
          />
        ) : (
          <Globe className="w-5 h-5 text-slate-400" />
        )}
      </div>

      <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate w-full group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        {link.title}
      </h3>
      <span className="text-[10px] text-slate-400 font-mono truncate w-full mt-0.5">
        {domain}
      </span>
    </div>
  );
};
