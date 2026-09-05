import React, { useState, useEffect } from 'react';
import {
  LogIn,
  UserPlus,
  KeyRound,
  X,
  AlertCircle,
  CheckCircle2,
  Database,
  Lock,
  ShieldCheck,
  Unlock,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  // Fallback local admin methods if Supabase not configured
  localIsAdmin?: boolean;
  localHasPassword?: boolean;
  onLocalUnlock?: (password: string) => Promise<boolean>;
  onLocalSetup?: (password: string) => Promise<void>;
}

type AuthTab = 'login' | 'signup' | 'forgot' | 'local';

export const AuthModal: React.FC<Props> = ({
  isOpen,
  onClose,
  localHasPassword,
  onLocalUnlock,
  onLocalSetup,
}) => {
  const { isConfigured, user, isAuthenticated, signIn, signUp, signOut, resetPassword } = useAuth();

  const [tab, setTab] = useState<AuthTab>(() => (isConfigured ? 'login' : 'local'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localPassword, setLocalPassword] = useState('');
  const [localConfirm, setLocalConfirm] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setLocalPassword('');
      setLocalConfirm('');
      setError(null);
      setSuccessMessage(null);
      if (!isConfigured) {
        setTab('local');
      } else if (!isAuthenticated) {
        setTab('login');
      }
    }
  }, [isOpen, isConfigured, isAuthenticated]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setError('Preencha seu e-mail e senha.');
      return;
    }

    setLoading(true);
    const { error: err } = await signIn(email, password);
    setLoading(false);

    if (err) {
      setError(err);
    } else {
      onClose();
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setError('Preencha todos os campos.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas digitadas não coincidem.');
      return;
    }

    setLoading(true);
    const { error: err, message } = await signUp(email, password);
    setLoading(false);

    if (err) {
      setError(err);
    } else {
      setSuccessMessage(message || 'Conta criada com sucesso!');
      if (message && message.includes('verifique seu e-mail')) {
        // Keep modal open to let user read message
      } else {
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setError('Digite seu e-mail para receber as instruções de redefinição.');
      return;
    }

    setLoading(true);
    const { error: err, message } = await resetPassword(email);
    setLoading(false);

    if (err) {
      setError(err);
    } else {
      setSuccessMessage(message || 'Verifique sua caixa de entrada.');
    }
  };

  const handleLocalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!localHasPassword && onLocalSetup) {
        if (!localPassword.trim() || localPassword.length < 3) {
          setError('A senha local deve ter pelo menos 3 caracteres.');
          setLoading(false);
          return;
        }
        if (localPassword !== localConfirm) {
          setError('As senhas não coincidem.');
          setLoading(false);
          return;
        }
        await onLocalSetup(localPassword);
        onClose();
      } else if (onLocalUnlock) {
        if (!localPassword.trim()) {
          setError('Digite a senha local.');
          setLoading(false);
          return;
        }
        const ok = await onLocalUnlock(localPassword);
        if (ok) {
          onClose();
        } else {
          setError('Senha local incorreta.');
        }
      }
    } catch {
      setError('Erro ao processar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              {isAuthenticated ? (
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
              ) : isConfigured ? (
                <LogIn className="w-5 h-5" />
              ) : (
                <Database className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isAuthenticated
                  ? 'Sessão do Usuário'
                  : isConfigured
                  ? tab === 'signup'
                    ? 'Criar Conta no LinkHub'
                    : tab === 'forgot'
                    ? 'Recuperar Senha'
                    : 'Acessar LinkHub'
                  : 'Autenticação & Supabase'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAuthenticated
                  ? user?.email
                  : isConfigured
                  ? 'Conectado via Supabase Cloud'
                  : 'Modo Local / Configuração Pendente'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-medium text-emerald-700 dark:text-emerald-300 flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Logged in state */}
        {isAuthenticated ? (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Logado como:</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white break-all mt-0.5">
                {user?.email}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Sincronização Ativa
                </span>
                <span className="text-[11px] text-slate-400">Modo de edição liberado</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors"
              >
                Sair da Conta
              </button>
            </div>
          </div>
        ) : isConfigured ? (
          <>
            {/* Tabs for Supabase Auth */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 mb-4">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
                  tab === 'login'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('signup');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
                  tab === 'signup'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                Criar Conta
              </button>
              {tab === 'forgot' && (
                <button
                  type="button"
                  className="pb-2.5 px-3 text-xs font-semibold border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400"
                >
                  Recuperar
                </button>
              )}
            </div>

            {/* Login Form */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    E-mail
                  </label>
                  <input
                    type="email"
                    autoFocus
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Senha
                    </label>
                    <button
                      type="button"
                      onClick={() => setTab('forgot')}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400">
                    Não tem conta?{' '}
                    <button
                      type="button"
                      onClick={() => setTab('signup')}
                      className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                    >
                      Cadastre-se
                    </button>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/25 transition-all flex items-center gap-1.5"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Signup Form */}
            {tab === 'signup' && (
              <form onSubmit={handleSignup} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    E-mail
                  </label>
                  <input
                    type="email"
                    autoFocus
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Senha (mínimo 6 dígitos)
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Confirmar Senha
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400">
                    Já possui conta?{' '}
                    <button
                      type="button"
                      onClick={() => setTab('login')}
                      className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                    >
                      Fazer Login
                    </button>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/25 transition-all flex items-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      {loading ? 'Criando...' : 'Criar Conta'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Forgot Password Form */}
            {tab === 'forgot' && (
              <form onSubmit={handleForgot} className="space-y-3.5">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Informe o seu e-mail de cadastro. Enviaremos um link seguro para redefinir sua senha.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    E-mail
                  </label>
                  <input
                    type="email"
                    autoFocus
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setTab('login')}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                  >
                    Voltar ao login
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/25 transition-all flex items-center gap-1.5"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      {loading ? 'Enviando...' : 'Enviar Link'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </>
        ) : (
          /* Supabase not configured yet - Guide & Local Fallback */
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-2 font-bold text-xs mb-1">
                <Database className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Supabase não configurado</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                Para ativar o login em nuvem e a persistência no PostgreSQL:
              </p>
              <ol className="list-decimal list-inside text-[11px] space-y-1 mt-2 text-amber-900/90 dark:text-amber-200/90 font-medium">
                <li>Abra o arquivo <code className="bg-amber-100 dark:bg-amber-900/80 px-1 py-0.5 rounded text-[10px]">.env</code> na raiz do projeto.</li>
                <li>Preencha <code className="bg-amber-100 dark:bg-amber-900/80 px-1 py-0.5 rounded text-[10px]">VITE_SUPABASE_URL</code> e <code className="bg-amber-100 dark:bg-amber-900/80 px-1 py-0.5 rounded text-[10px]">VITE_SUPABASE_ANON_KEY</code>.</li>
                <li>Execute o script <code className="bg-amber-100 dark:bg-amber-900/80 px-1 py-0.5 rounded text-[10px]">supabase/schema.sql</code> no SQL Editor do Supabase.</li>
              </ol>
            </div>

            {/* Offline fallback local admin */}
            {onLocalUnlock && (
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  <Lock className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Modo Local / Desbloqueio Rápido</span>
                </div>
                <form onSubmit={handleLocalSubmit} className="space-y-2.5">
                  <input
                    type="password"
                    value={localPassword}
                    onChange={(e) => setLocalPassword(e.target.value)}
                    placeholder={localHasPassword ? 'Senha mestre local...' : 'Defina uma senha local...'}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {!localHasPassword && (
                    <input
                      type="password"
                      value={localConfirm}
                      onChange={(e) => setLocalConfirm(e.target.value)}
                      placeholder="Confirme a senha local..."
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  )}
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-3 py-1.5 rounded-xl text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Fechar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1"
                    >
                      <Unlock className="w-3 h-3" />
                      {localHasPassword ? 'Desbloquear Local' : 'Salvar Senha Local'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
