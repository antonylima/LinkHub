import React, { useRef, useEffect } from 'react';
import type { ViewMode } from '../types';
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  Grid2X2,
  Moon,
  Sun,
  Laptop,
  Download,
  X,
  Bookmark,
  Menu,
  Lock,
  Unlock,
  User,
  LogIn,
  RefreshCw,
} from 'lucide-react';
import type { ThemeMode } from '../hooks/useTheme';

interface Props {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (v: ViewMode) => void;
  theme: ThemeMode;
  onThemeToggle: () => void;
  onOpenAddLink: () => void;
  onOpenImportExport: () => void;
  onToggleMobileSidebar: () => void;
  isAdmin: boolean;
  onToggleAdmin: () => void;
  userEmail?: string | null;
  isAuthenticated?: boolean;
  isConfigured?: boolean;
  isSyncing?: boolean;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<Props> = ({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  theme,
  onThemeToggle,
  onOpenAddLink,
  onOpenImportExport,
  onToggleMobileSidebar,
  isAdmin,
  onToggleAdmin,
  userEmail,
  isAuthenticated,
  isConfigured,
  isSyncing,
  onOpenAuth,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        if (!['INPUT', 'TEXTAREA'].includes((document.activeElement as HTMLElement)?.tagName)) {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Mobile Toggle & Logo */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Abrir Menu Lateral"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onSearchChange('')}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
              <Bookmark className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight flex items-center gap-1">
                Link<span className="text-indigo-600 dark:text-indigo-400">Hub</span>
              </span>
              {isSyncing && (
                <span title="Sincronizando com Supabase...">
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-xl mx-2 sm:mx-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar links, tags ou URLs... (Ctrl + K)"
              className="w-full pl-9 pr-8 py-1.5 sm:py-2 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/60 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Botões Compactos"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onViewModeChange('compact')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'compact'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Ícones de Apps / Speed Dial"
            >
              <Grid2X2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Lista de Links"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={onThemeToggle}
            className="p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={`Tema: ${theme === 'dark' ? 'Escuro' : theme === 'light' ? 'Claro' : 'Automático'}`}
          >
            {theme === 'dark' ? (
              <Moon className="w-4 h-4 text-indigo-400" />
            ) : theme === 'light' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Laptop className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Supabase Auth / Account Button */}
          {isAuthenticated ? (
            <button
              onClick={onOpenAuth}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all hover:bg-emerald-100 dark:hover:bg-emerald-900/60"
              title={`Conectado como ${userEmail || 'Usuário'}. Clique para gerenciar.`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <User className="w-3.5 h-3.5" />
              <span className="hidden xl:inline text-[11px] max-w-[120px] truncate">
                {userEmail?.split('@')[0]}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isConfigured
                  ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
                  : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isConfigured ? 'Fazer login no Supabase' : 'Configurar Supabase'}
            >
              <LogIn className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline text-[11px]">
                {isConfigured ? 'Entrar' : 'Supabase'}
              </span>
            </button>
          )}

          {/* Local Admin Lock/Unlock Button if not logged in */}
          {!isAuthenticated && !isConfigured && (
            <button
              onClick={onToggleAdmin}
              className={`p-1.5 sm:px-2 sm:py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
                isAdmin
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isAdmin ? 'Modo Local Desbloqueado' : 'Modo Local Bloqueado'}
            >
              {isAdmin ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Backup Button (Only active if admin / authenticated) */}
          {isAdmin && (
            <button
              onClick={onOpenImportExport}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Importar ou Exportar Links"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Backup</span>
            </button>
          )}

          {/* Add Link Button */}
          {isAdmin ? (
            <button
              onClick={onOpenAddLink}
              className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Link</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5"
              title="Entre para adicionar ou editar links"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Editar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
