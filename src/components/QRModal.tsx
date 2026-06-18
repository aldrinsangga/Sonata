import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomLink: string;
}

export const QRModal: React.FC<QRModalProps> = ({ isOpen, onClose, roomLink }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm bg-white rounded-[2.5rem] overflow-hidden shadow-2xl p-8 flex flex-col items-center"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="w-20 h-20 bg-[#ff0000] rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-[#ff0000]/20">
              <QrCode className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-2xl font-display font-black tracking-tighter uppercase mb-2 text-black">Scan to Join</h2>
            <p className="text-sm text-gray-500 mb-8 text-center px-4">Share this code with your friends to let them join the karaoke session.</p>

            <div className="p-6 bg-white rounded-3xl shadow-inner border border-gray-100 mb-8">
              <QRCodeSVG value={roomLink} size={200} fgColor="#000000" />
            </div>

            <div className="w-full text-center py-4 bg-gray-50 rounded-2xl border border-gray-100">
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Room Link</p>
               <p className="text-xs font-mono text-gray-600 truncate px-4">{roomLink}</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
