import React from 'react';
import type { ToastMessage } from '../types';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';

interface Props {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<Props> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4 sm:px-0">
      {toasts.map((toast) => {
        let bg = 'bg-slate-900/90 text-white dark:bg-white/95 dark:text-slate-900 border-slate-700/50';
        let Icon = CheckCircle2;
        let iconColor = 'text-emerald-400 dark:text-emerald-600';

        if (toast.type === 'info') {
          Icon = Info;
          iconColor = 'text-sky-400 dark:text-sky-600';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          iconColor = 'text-rose-400 dark:text-rose-600';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 p-3.5 rounded-xl shadow-xl backdrop-blur-md border text-sm font-medium transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in ${bg}`}
          >
            <Icon className={`w-5 h-5 shrink-0 ${iconColor}`} />
            <span className="flex-1 leading-snug">{toast.message}</span>
            <button
              onClick={() => onRemove(toast.id)}
              className="p-1 rounded-lg hover:bg-white/10 dark:hover:bg-black/10 transition-colors opacity-70 hover:opacity-100"
              aria-label="Fechar notificação"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
