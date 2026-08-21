import React, { useState, useEffect } from 'react';
import type { LinkItem, Category } from '../types';
import { getFaviconUrl, getDomain, formatUrl } from '../utils/favicon';
import { getCategoryColor, renderCategoryIcon } from '../utils/iconHelper';
import {
  X,
  Globe,
  ExternalLink,
  Star,
  Check,
  Sparkles,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (linkData: Omit<LinkItem, 'id' | 'createdAt' | 'clicks'>) => void;
  editingLink?: LinkItem | null;
  categories: Category[];
  availableTags: string[];
}

export const LinkModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  editingLink,
  categories,
  availableTags,
}) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; url?: string }>({});
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (editingLink) {
      setTitle(editingLink.title);
      setUrl(editingLink.url);
      setDescription(editingLink.description || '');
      setCategoryId(editingLink.categoryId || (categories[0]?.id || ''));
      setTags(editingLink.tags || []);
      setIsFavorite(editingLink.isFavorite);
    } else {
      setTitle('');
      setUrl('');
      setDescription('');
      setCategoryId(categories[0]?.id || '');
      setTags([]);
      setIsFavorite(false);
    }
    setTagInput('');
    setErrors({});
    setImgError(false);
  }, [editingLink, isOpen, categories]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    const clean = tagInput.trim().toLowerCase().replace(/,/g, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDownTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleUrlBlur = () => {
    if (url.trim() && !title.trim()) {
      const domain = getDomain(url);
      if (domain) {
        const parts = domain.split('.');
        const autoName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        setTitle(autoName);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { title?: string; url?: string } = {};

    if (!title.trim()) newErrors.title = 'Por favor, informe um título.';
    if (!url.trim()) {
      newErrors.url = 'Por favor, informe a URL do link.';
    } else {
      try {
        const testUrl = formatUrl(url);
        new URL(testUrl);
      } catch {
        newErrors.url = 'URL inválida. Ex: https://google.com';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      title: title.trim(),
      url: formatUrl(url.trim()),
      description: description.trim(),
      categoryId: categoryId || categories[0]?.id || '',
      tags,
      isFavorite,
    });
    onClose();
  };

  const currentCategory = categories.find((c) => c.id === categoryId);
  const catColor = getCategoryColor(currentCategory?.color);
  const previewDomain = url ? getDomain(url) : 'exemplo.com';
  const previewFavicon = url ? getFaviconUrl(url) : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingLink ? 'Editar Link' : 'Adicionar Novo Link'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Organize seus links com categorias, tags e favoritos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* Live Preview Button */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Pré-visualização do Botão
            </span>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                  {!imgError && previewFavicon ? (
                    <img
                      src={previewFavicon}
                      alt="Favicon"
                      onError={() => setImgError(true)}
                      className="w-4.5 h-4.5 object-contain"
                    />
                  ) : (
                    <Globe className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                      {title || 'Título do link'}
                    </h4>
                    {isFavorite && <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 truncate">
                    <span className="font-mono truncate">{previewDomain}</span>
                    {currentCategory && (
                      <>
                        <span>•</span>
                        <span className={`font-medium ${catColor.text}`}>{currentCategory.name}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {currentCategory && (
                <span
                  className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${catColor.bg} ${catColor.text} shrink-0`}
                >
                  {renderCategoryIcon(currentCategory.icon, 'w-3 h-3')}
                  {currentCategory.name}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              URL do Link <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setImgError(false);
                  if (errors.url) setErrors({ ...errors, url: undefined });
                }}
                onBlur={handleUrlBlur}
                placeholder="https://exemplo.com.br"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                  errors.url ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-700'
                }`}
              />
              {url && (
                <a
                  href={formatUrl(url)}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                  title="Testar URL em nova aba"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
            {errors.url && <p className="text-xs text-rose-500 mt-1">{errors.url}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Título / Nome do Link <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({ ...errors, title: undefined });
              }}
              placeholder="Ex: Google Drive, Notion Workspace, Figma..."
              className={`w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                errors.title ? 'border-rose-400 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-700'
              }`}
            />
            {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Categoria
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Descrição (Opcional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adicione uma breve anotação sobre o que é este link..."
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Tags (Pressione Enter para adicionar)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-500 ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDownTag}
                placeholder="Ex: trabalho, design, react, util..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium transition-colors"
              >
                Adicionar
              </button>
            </div>
            {availableTags.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                <span>Sugestões:</span>
                {availableTags.slice(0, 5).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      if (!tags.includes(t)) setTags([...tags, t]);
                    }}
                    className="underline hover:text-indigo-500"
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <div className="flex items-center gap-2.5">
              <Star
                className={`w-5 h-5 ${isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`}
              />
              <div>
                <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                  Marcar como Favorito
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Aparece no carrossel de acesso rápido no topo
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                isFavorite ? 'bg-amber-400' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  isFavorite ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {editingLink ? 'Salvar Alterações' : 'Adicionar Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
