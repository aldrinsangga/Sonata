import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings, User, Monitor, Search, Info } from 'lucide-react';
import { useAppStore } from '../store';
import { doc, updateDoc, getDocs, query, collection, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, roomId }) => {
  const { nickname, setNickname, userId, isDisplayDevice, setIsDisplayDevice, autoKaraoke, setAutoKaraoke } = useAppStore();
  const [tempNickname, setTempNickname] = useState(nickname);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Update tempNickname when modal opens or nickname changes
  React.useEffect(() => {
    if (isOpen) {
      setTempNickname(nickname);
      setSaveSuccess(false);
      setSaveError('');
    }
  }, [isOpen, nickname]);

  const handleSaveNickname = async () => {
    if (!tempNickname.trim()) return;
    
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError('');
    try {
      // 1. Update in Firebase participants
      const participantDocRef = doc(db, `rooms/${roomId}/participants`, userId);
      await updateDoc(participantDocRef, { nickname: tempNickname.trim() });
      
      // 2. Update locally
      setNickname(tempNickname.trim());
      setSaveSuccess(true);
      
      // Clear success after 2 seconds
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error("Error updating nickname:", error);
      setSaveError("Failed to save name. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="bg-[#ff0000] p-6 flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <Settings className="w-6 h-6" />
                <h2 className="text-xl font-display font-black tracking-tighter uppercase">Settings</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              
              {/* Name Change */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <User className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Name Change</span>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Your Name:</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={tempNickname}
                      onChange={(e) => setTempNickname(e.target.value)}
                      className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#ff0000] text-black"
                      placeholder="Enter new name"
                      maxLength={20}
                    />
                    <button 
                      onClick={handleSaveNickname}
                      disabled={isSaving || !tempNickname.trim() || (tempNickname === nickname && !saveSuccess)}
                      className={`px-6 py-2 text-white font-bold rounded-xl transition-all ${
                        saveSuccess ? 'bg-green-500' : 'bg-[#ff0000] hover:bg-[#cc0000]'
                      } disabled:opacity-50 min-w-[80px]`}
                    >
                      {isSaving ? '...' : saveSuccess ? '✓' : 'Save'}
                    </button>
                  </div>
                  {saveError && (
                    <p className="text-xs text-red-500 mt-1">{saveError}</p>
                  )}
                </div>
              </section>

              {/* Display Device Toggle */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <Monitor className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Display Mode</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="space-y-1">
                    <p className="font-bold text-gray-900">Set as display device</p>
                    <p className="text-xs text-gray-500 max-w-[200px]">
                      Enable this on the device connected to the main screen to show the video player and QR code.
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsDisplayDevice(!isDisplayDevice)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${isDisplayDevice ? 'bg-[#ff0000]' : 'bg-gray-300'}`}
                  >
                    <motion.div 
                      animate={{ x: isDisplayDevice ? 24 : 4 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </button>
                </div>
                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl">
                  <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-blue-700 leading-tight">
                    Recommendation: Only have one (1) device set as display in the same room.
                  </p>
                </div>
              </section>

              {/* Auto Search Toggle */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <Search className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Search Options</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="space-y-1">
                    <p className="font-bold text-gray-900">Automatically search for karaoke versions</p>
                    <p className="text-xs text-gray-500 max-w-[200px]">
                      When enabled, 'karaoke' will be automatically added to your search queries.
                    </p>
                  </div>
                  <button 
                    onClick={() => setAutoKaraoke(!autoKaraoke)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${autoKaraoke ? 'bg-[#ff0000]' : 'bg-gray-200'}`}
                  >
                    <motion.div 
                      animate={{ x: autoKaraoke ? 24 : 4 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </button>
                </div>
              </section>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
