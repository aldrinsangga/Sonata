import React from 'react';
import { useAppStore } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

export function GlobalToast() {
  const { toasts, removeToast } = useAppStore();

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 pointer-events-none w-full max-w-sm px-4">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`pointer-events-auto flex items-center gap-3 w-full px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-md ${
              toast.type === 'success' ? 'bg-green-600/90 border-green-500 text-white shadow-green-900/20' :
              toast.type === 'error' ? 'bg-red-600/90 border-red-500 text-white shadow-red-900/20' :
              'bg-blue-600/90 border-blue-500 text-white shadow-blue-900/20'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 shrink-0" />}
            {toast.type === 'error' && <AlertTriangle className="w-5 h-5 shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 shrink-0" />}
            
            <p className="flex-1 text-sm font-bold tracking-tight">
              {toast.message}
            </p>
            
            <button 
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
