import React, { useRef, useState } from 'react';
import type { Category, LinkItem } from '../types';
import { exportToJson, exportToHtmlBookmarks, parseHtmlBookmarks } from '../utils/bookmarksParser';
import {
  X,
  Download,
  Upload,
  FileJson,
  FileCode,
  RotateCcw,
  Trash2,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  links: LinkItem[];
  categories: Category[];
  onImport: (links: Partial<LinkItem>[], newCategories?: string[]) => void;
  onResetToDemo: () => void;
  onClearAll: () => void;
}

export const ImportExportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  links,
  categories,
  onImport,
  onResetToDemo,
  onClearAll,
}) => {
  const jsonFileInputRef = useRef<HTMLInputElement>(null);
  const htmlFileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  const handleExportJson = () => {
    const jsonStr = exportToJson(links, categories);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `linkhub_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportHtml = () => {
    const htmlStr = exportToHtmlBookmarks(links, categories);
    const blob = new Blob([htmlStr], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookmarks_linkhub_${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.links && Array.isArray(parsed.links)) {
          onImport(parsed.links, parsed.categories ? parsed.categories.map((c: any) => c.name) : undefined);
          setImportStatus(`Importados com sucesso ${parsed.links.length} links!`);
          setTimeout(() => onClose(), 1200);
        } else {
          setImportStatus('Arquivo JSON inválido. Formato esperado não encontrado.');
        }
      } catch {
        setImportStatus('Erro ao ler o arquivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleHtmlUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const defaultCatId = categories[0]?.id || 'cat-general';
        const { links: parsedLinks, newCategories } = parseHtmlBookmarks(content, defaultCatId);

        if (parsedLinks.length > 0) {
          onImport(parsedLinks, newCategories);
          setImportStatus(`Importados ${parsedLinks.length} links e ${newCategories.length} categorias do navegador!`);
          setTimeout(() => onClose(), 1200);
        } else {
          setImportStatus('Nenhum link encontrado no arquivo HTML de favoritos.');
        }
      } catch {
        setImportStatus('Erro ao processar o arquivo HTML.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Importar & Exportar Favoritos
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Faça backup ou importe links do Chrome, Edge, Firefox ou arquivo JSON
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

        <div className="p-6 space-y-5">
          {importStatus && (
            <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-xs font-medium text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{importStatus}</span>
            </div>
          )}

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Exportar Seus Links
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleExportJson}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 transition-all text-left group"
              >
                <FileJson className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Exportar JSON
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Backup completo de links e categorias
                </span>
              </button>

              <button
                onClick={handleExportHtml}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 transition-all text-left group"
              >
                <FileCode className="w-6 h-6 text-amber-600 dark:text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Exportar Navegador (HTML)
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Compatível com Chrome, Firefox e Edge
                </span>
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Importar Links
            </h4>
            <input
              type="file"
              ref={jsonFileInputRef}
              accept=".json"
              className="hidden"
              onChange={handleJsonUpload}
            />
            <input
              type="file"
              ref={htmlFileInputRef}
              accept=".html,.htm"
              className="hidden"
              onChange={handleHtmlUpload}
            />

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => jsonFileInputRef.current?.click()}
                className="p-3.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all text-left"
              >
                <Upload className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mb-2" />
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Importar de JSON
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Carregar arquivo de backup
                </span>
              </button>

              <button
                onClick={() => htmlFileInputRef.current?.click()}
                className="p-3.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all text-left"
              >
                <Upload className="w-5 h-5 text-amber-600 dark:text-amber-400 mb-2" />
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Importar do Navegador
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Arquivo HTML de favoritos
                </span>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  onResetToDemo();
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restaurar dados de demonstração
              </button>

              {!confirmClear ? (
                <button
                  onClick={() => setConfirmClear(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-600 hover:underline font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Limpar todos os dados
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-rose-500 font-bold">Tem certeza?</span>
                  <button
                    onClick={() => {
                      onClearAll();
                      onClose();
                    }}
                    className="px-2 py-1 rounded bg-rose-600 text-white text-[11px] font-bold hover:bg-rose-700"
                  >
                    Sim, apagar tudo
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="text-[11px] text-slate-400 hover:underline"
                  >
                    Não
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
