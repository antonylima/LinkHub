import React, { useState, useEffect } from 'react';
import { Lock, Unlock, KeyRound, X, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  mode: 'unlock' | 'setup' | 'change';
  onClose: () => void;
  onUnlock: (password: string) => Promise<boolean>;
  onSetup: (password: string) => Promise<void>;
  onChangePassword: (oldPwd: string, newPwd: string) => Promise<boolean>;
  onReset: () => void;
}

export const AdminModal: React.FC<Props> = ({
  isOpen,
  mode,
  onClose,
  onUnlock,
  onSetup,
  onChangePassword,
  onReset,
}) => {
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    setPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setShowResetConfirm(false);
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'setup') {
        if (!password.trim() || password.length < 3) {
          setError('A senha deve ter pelo menos 3 caracteres.');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('As senhas não coincidem.');
          setLoading(false);
          return;
        }
        await onSetup(password);
      } else if (mode === 'unlock') {
        if (!password.trim()) {
          setError('Por favor, digite sua senha.');
          setLoading(false);
          return;
        }
        const success = await onUnlock(password);
        if (!success) {
          setError('Senha incorreta. Tente novamente.');
        }
      } else if (mode === 'change') {
        if (!newPassword.trim() || newPassword.length < 3) {
          setError('A nova senha deve ter pelo menos 3 caracteres.');
          setLoading(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          setError('A confirmação da nova senha não confere.');
          setLoading(false);
          return;
        }
        const success = await onChangePassword(password, newPassword);
        if (!success) {
          setError('Senha atual incorreta.');
        }
      }
    } catch {
      setError('Ocorreu um erro ao processar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              {mode === 'setup' ? (
                <ShieldCheck className="w-5 h-5" />
              ) : mode === 'change' ? (
                <KeyRound className="w-5 h-5" />
              ) : (
                <Lock className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {mode === 'setup'
                  ? 'Configurar Senha de Administrador'
                  : mode === 'change'
                  ? 'Alterar Senha de Administrador'
                  : 'Desbloquear Modo Edição'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {mode === 'setup'
                  ? 'Crie uma senha para proteger a alteração de links'
                  : mode === 'change'
                  ? 'Atualize a senha mestre do painel'
                  : 'Digite sua senha para adicionar, editar ou excluir links'}
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

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'unlock' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Senha Master
              </label>
              <input
                type="password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {mode === 'setup' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nova Senha Master
                </label>
                <input
                  type="password"
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Defina uma senha..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirmar Senha
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a senha..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </>
          )}

          {mode === 'change' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Senha Atual
                </label>
                <input
                  type="password"
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a senha atual..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nova Senha
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite a nova senha..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme a nova senha..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            {mode === 'unlock' ? (
              <div>
                {!showResetConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(true)}
                    className="text-[11px] text-slate-400 hover:text-rose-500 underline"
                  >
                    Esqueci a senha
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-rose-500 font-bold">Redefinir senha?</span>
                    <button
                      type="button"
                      onClick={onReset}
                      className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold hover:bg-rose-700"
                    >
                      Sim
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(false)}
                      className="text-[10px] text-slate-400 hover:underline"
                    >
                      Não
                    </button>
                  </div>
                )}
              </div>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/25 transition-all flex items-center gap-1.5"
              >
                {mode === 'unlock' ? <Unlock className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                {loading
                  ? 'Processando...'
                  : mode === 'setup'
                  ? 'Salvar Senha'
                  : mode === 'change'
                  ? 'Atualizar Senha'
                  : 'Desbloquear'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
