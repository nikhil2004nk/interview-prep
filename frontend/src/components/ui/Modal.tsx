import React from 'react';
import { AlertTriangle, CheckCircle2, HelpCircle, X, Info } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  title: string;
  message?: string;
  type: 'info' | 'confirm' | 'error' | 'success';
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose: () => void;
  children?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  message = '',
  type,
  onConfirm,
  onCancel,
  onClose,
  children,
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="text-emerald-450" size={24} />;
      case 'error':
        return <AlertTriangle className="text-red-400" size={24} />;
      case 'confirm':
        return <HelpCircle className="text-purple-450" size={24} />;
      default:
        return <Info className="text-blue-400" size={24} />;
    }
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={handleCancel}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      ></div>

      {/* Modal Dialog */}
      <div className="relative bg-slate-900 border border-slate-800/80 rounded-2xl w-full max-w-md p-5 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={handleCancel}
          className="absolute top-4 right-4 p-1 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        <div className="flex gap-4 items-start">
          <div className="shrink-0 p-2 bg-slate-950/50 border border-slate-850 rounded-xl">
            {getIcon()}
          </div>
          <div className="space-y-1.5 flex-1 min-w-0">
            <h3 className="font-extrabold text-slate-100 text-sm leading-snug">
              {title}
            </h3>
            {children ? (
              <div className="pt-2">{children}</div>
            ) : (
              <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">
                {message}
              </p>
            )}
          </div>
        </div>

        {!children && (
          <div className="mt-5 flex justify-end gap-2">
            {type === 'confirm' ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1.5 bg-slate-950/50 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 font-semibold rounded-lg text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-lg text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Confirm
                </button>
              </>
            ) : (
              <button
                onClick={handleConfirm}
                className="px-4 py-1.5 bg-slate-950/50 hover:bg-slate-900 border border-slate-850 hover:border-slate-850 text-purple-400 hover:text-purple-300 font-bold rounded-lg text-xs transition-all cursor-pointer"
              >
                OK
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
