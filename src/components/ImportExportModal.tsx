import React, { useRef, useState } from 'react';
import type { Category, LinkItem } from '../types';
import { exportToJson, exportToHtmlBookmarks, parseChromeBookmarksHtml } from '../utils/bookmarksParser';
import {
  X,
  Download,
  FileJson,
  FileCode,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Globe,
  Folder,
  ArrowRight,
  Sparkles,
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

interface ChromePreviewData {
  fileName: string;
  links: Partial<LinkItem>[];
  categories: { name: string; count: number }[];
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
  const [preview, setPreview] = useState<ChromePreviewData | null>(null);
  const [replaceMode, setReplaceMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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

  const processHtmlFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const result = parseChromeBookmarksHtml(content);

        if (result.links.length > 0) {
          const formattedLinks: Partial<LinkItem>[] = result.links.map((item) => ({
            title: item.title,
            url: item.url,
            description: item.description,
            categoryId: item.categoryName,
            customIcon: item.customIcon,
            tags: item.tags,
            isFavorite: false,
            createdAt: item.createdAt,
          }));

          setPreview({
            fileName: file.name,
            links: formattedLinks,
            categories: result.categories,
          });
          setImportStatus(null);
        } else {
          setImportStatus('Nenhum link detectado no arquivo HTML de favoritos.');
        }
      } catch {
        setImportStatus('Erro ao processar o arquivo de favoritos do Chrome.');
      }
    };
    reader.readAsText(file);
  };

  const processJsonFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.links && Array.isArray(parsed.links)) {
          const catNames = parsed.categories ? parsed.categories.map((c: any) => c.name) : undefined;
          setPreview({
            fileName: file.name,
            links: parsed.links,
            categories: catNames ? catNames.map((name: string) => ({ name, count: parsed.links.filter((l: any) => l.categoryId === name).length })) : [],
          });
          setImportStatus(null);
        } else {
          setImportStatus('Arquivo JSON inválido. Estrutura não compatível.');
        }
      } catch {
        setImportStatus('Erro ao ler o arquivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (!preview) return;

    if (replaceMode) {
      onClearAll();
    }

    const categoryNames = preview.categories.map((c) => c.name);
    onImport(preview.links, categoryNames);

    setImportStatus(`Sucesso! ${preview.links.length} links importados.`);
    setPreview(null);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
      processHtmlFile(file);
    } else if (file.name.endsWith('.json')) {
      processJsonFile(file);
    } else {
      setImportStatus('Formato não suportado. Use .html (Chrome) ou .json (LinkHub).');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Importar & Exportar Favoritos
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Compatível com Google Chrome, Edge, Firefox e backups JSON
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

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {importStatus && (
            <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-xs font-medium text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{importStatus}</span>
            </div>
          )}

          {/* If Preview is available */}
          {preview ? (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-bold text-sm">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <span>Pré-visualização da Importação</span>
                  </div>
                  <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    {preview.fileName}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 my-3">
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/60">
                    <span className="text-[11px] text-slate-500 block">Links encontrados</span>
                    <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                      {preview.links.length}
                    </span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/60">
                    <span className="text-[11px] text-slate-500 block">Categorias detectadas</span>
                    <span className="text-lg font-extrabold text-slate-800 dark:text-slate-200">
                      {preview.categories.length}
                    </span>
                  </div>
                </div>

                {/* Categories badges */}
                {preview.categories.length > 0 && (
                  <div className="mb-3">
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1.5">
                      Categorias que serão criadas:
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1">
                      {preview.categories.map((c) => (
                        <span
                          key={c.name}
                          className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1"
                        >
                          <Folder className="w-3 h-3 text-indigo-500" />
                          <span>{c.name}</span>
                          <span className="text-[10px] text-slate-400">({c.count})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sample links list */}
                <div>
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1.5">
                    Amostra de links:
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto bg-white dark:bg-slate-900 rounded-xl p-2 border border-indigo-100 dark:border-indigo-900/60">
                    {preview.links.slice(0, 5).map((l, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs py-1 border-b border-slate-100 dark:border-slate-800/60 last:border-none">
                        {l.customIcon ? (
                          <img src={l.customIcon} alt="" className="w-3.5 h-3.5 object-contain rounded" />
                        ) : (
                          <Globe className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate flex-1">
                          {l.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">
                          {l.categoryId}
                        </span>
                      </div>
                    ))}
                    {preview.links.length > 5 && (
                      <div className="text-[11px] text-slate-400 text-center pt-1 font-medium">
                        + {preview.links.length - 5} outros links
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Mode checkbox */}
              <div className="flex items-center gap-2 px-1">
                <input
                  type="checkbox"
                  id="replaceMode"
                  checked={replaceMode}
                  onChange={(e) => setReplaceMode(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="replaceMode" className="text-xs text-slate-600 dark:text-slate-300 select-none cursor-pointer">
                  Substituir links existentes (apaga os atuais antes de importar)
                </label>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="px-4.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/25 flex items-center gap-1.5 transition-all"
                >
                  <span>Importar {preview.links.length} Links</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Import Section with Drop Zone */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Importar do Google Chrome & Navegadores
                </h4>

                <input
                  type="file"
                  ref={htmlFileInputRef}
                  accept=".html,.htm"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) processHtmlFile(file);
                  }}
                />

                <input
                  type="file"
                  ref={jsonFileInputRef}
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) processJsonFile(file);
                  }}
                />

                {/* Drag and Drop Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => htmlFileInputRef.current?.click()}
                  className={`p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-2 ${
                    isDragging
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 scale-[1.01]'
                      : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
                    <FileCode className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white block">
                      Importar arquivo HTML do Chrome
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Arraste seu arquivo <code className="text-indigo-600 dark:text-indigo-400 font-mono">bookmarks.html</code> aqui ou clique para selecionar
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full mt-1">
                    No Chrome: Pressione <b>Ctrl + Shift + O</b> &gt; clique nos três pontos (⋮) &gt; <b>Exportar favoritos</b>
                  </div>
                </div>

                <div className="mt-3 text-right">
                  <button
                    type="button"
                    onClick={() => jsonFileInputRef.current?.click()}
                    className="text-xs text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 underline font-medium inline-flex items-center gap-1"
                  >
                    <FileJson className="w-3.5 h-3.5" />
                    Ou importar de um arquivo de backup JSON
                  </button>
                </div>
              </div>

              {/* Export Section */}
              <div className="pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Exportar Backup dos Seus Links
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleExportHtml}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 transition-all text-left group"
                  >
                    <FileCode className="w-5 h-5 text-amber-600 dark:text-amber-400 mb-1.5 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Exportar HTML
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Compatível com Chrome & Edge
                    </span>
                  </button>

                  <button
                    onClick={handleExportJson}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 transition-all text-left group"
                  >
                    <FileJson className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mb-1.5 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Exportar JSON
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Backup com estrutura completa
                    </span>
                  </button>
                </div>
              </div>

              {/* Demo / Reset Section */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => {
                    onResetToDemo();
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restaurar demonstração
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};
