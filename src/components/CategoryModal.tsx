import React, { useState, useEffect } from 'react';
import type { Category } from '../types';
import {
  AVAILABLE_ICONS,
  AVAILABLE_COLORS,
  renderCategoryIcon,
  getCategoryColor,
} from '../utils/iconHelper';
import { X, Check, Palette } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryData: Omit<Category, 'id'>) => void;
  editingCategory?: Category | null;
}

export const CategoryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  editingCategory,
}) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Folder');
  const [color, setColor] = useState('indigo');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
      setIcon(editingCategory.icon || 'Folder');
      setColor(editingCategory.color || 'indigo');
      setDescription(editingCategory.description || '');
    } else {
      setName('');
      setIcon('Folder');
      setColor('indigo');
      setDescription('');
    }
    setError('');
  }, [editingCategory, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, informe o nome da categoria.');
      return;
    }

    onSave({
      name: name.trim(),
      icon,
      color,
      description: description.trim(),
    });
    onClose();
  };

  const selectedColor = getCategoryColor(color);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personalize nome, ícone e cor da categoria
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Preview:</span>
            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold ${selectedColor.bg} ${selectedColor.text} border ${selectedColor.border}`}
            >
              {renderCategoryIcon(icon, 'w-4 h-4')}
              <span>{name || 'Nome da Categoria'}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Nome da Categoria <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Ex: Trabalho, Games, Cripto, Estudos..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Ícone
            </label>
            <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
              {AVAILABLE_ICONS.map((item) => {
                const isSelected = icon === item.name;
                const IconComp = item.icon;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setIcon(item.name)}
                    title={item.label}
                    className={`p-2.5 rounded-lg flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 ring-2 ring-indigo-400'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <IconComp className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Cor do Tema
            </label>
            <div className="flex flex-wrap gap-2.5">
              {AVAILABLE_COLORS.map((c) => {
                const isSelected = color === c.name;
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setColor(c.name)}
                    className={`w-7 h-7 rounded-full transition-transform ${c.bg} border-2 flex items-center justify-center ${
                      isSelected ? 'scale-125 ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-slate-900' : 'hover:scale-110'
                    }`}
                  >
                    {isSelected && <Check className={`w-3.5 h-3.5 ${c.text}`} />}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Descrição (Opcional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descrição da categoria..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
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
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {editingCategory ? 'Salvar Categoria' : 'Criar Categoria'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
