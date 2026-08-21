import React, { useState } from 'react';
import type { LinkItem, Category } from '../types';
import { getFaviconUrl } from '../utils/favicon';
import { Star, Globe } from 'lucide-react';

interface Props {
  favorites: LinkItem[];
  categories: Category[];
  onOpenLink: (link: LinkItem) => void;
  onToggleFavorite: (id: string) => void;
}

export const FavoritesSection: React.FC<Props> = ({
  favorites,
  onOpenLink,
  onToggleFavorite,
}) => {
  if (favorites.length === 0) return null;

  return (
    <div className="mb-6 bg-gradient-to-r from-amber-500/5 via-indigo-500/5 to-purple-500/5 p-3.5 sm:p-4 rounded-2xl border border-amber-500/20 dark:border-amber-500/10">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-amber-500/10 text-amber-500 dark:text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
          </div>
          <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Favoritos & Acesso Rápido
          </h2>
          <span className="text-[11px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300">
            {favorites.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {favorites.map((link) => (
          <FavQuickButton
            key={link.id}
            link={link}
            onOpen={() => onOpenLink(link)}
            onUnfav={(e) => {
              e.stopPropagation();
              onToggleFavorite(link.id);
            }}
          />
        ))}
      </div>
    </div>
  );
};

interface FavQuickButtonProps {
  link: LinkItem;
  onOpen: () => void;
  onUnfav: (e: React.MouseEvent) => void;
}

const FavQuickButton: React.FC<FavQuickButtonProps> = ({ link, onOpen, onUnfav }) => {
  const [imgError, setImgError] = useState(false);
  const faviconUrl = getFaviconUrl(link.url);

  return (
    <button
      onClick={onOpen}
      className="group relative flex items-center gap-2 px-2.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-amber-400/80 dark:hover:border-amber-500/50 hover:shadow-xs active:scale-[0.98] transition-all cursor-pointer overflow-hidden text-left w-full"
    >
      <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200/50 dark:border-slate-700/50 group-hover:scale-105 transition-transform">
        {!imgError && faviconUrl ? (
          <img
            src={faviconUrl}
            alt={link.title}
            onError={() => setImgError(true)}
            className="w-3.5 h-3.5 object-contain"
            loading="lazy"
          />
        ) : (
          <Globe className="w-3.5 h-3.5 text-slate-400" />
        )}
      </div>

      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate flex-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
        {link.title}
      </span>

      <button
        onClick={onUnfav}
        title="Desfavoritar"
        className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-300 hover:text-amber-500 transition-opacity shrink-0"
      >
        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
      </button>
    </button>
  );
};
