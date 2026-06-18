import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SLogo } from './SLogo';
import { useAppStore } from '../store';
import { joinRoomParticipant } from '../lib/roomService';

interface NicknameModalProps {
  isOpen: boolean;
  roomId: string;
  onJoined: () => void;
}

export default function NicknameModal({ isOpen, roomId, onJoined }: NicknameModalProps) {
  const { userId, nickname, setNickname, isHost, setIsDisplayDevice } = useAppStore();
  const [localName, setLocalName] = useState(nickname);
  const [isJoining, setIsJoining] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localName.trim()) return;
    setIsJoining(true);
    try {
      setNickname(localName);
      if (!isHost) setIsDisplayDevice(false);
      await joinRoomParticipant(roomId, userId, localName, isHost);
      onJoined();
    } catch (err) {
      console.error('Failed to join room', err);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#111111] border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl flex flex-col items-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-[#ff0000] flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
          <SLogo className="w-8 h-8 text-accent" />
        </div>
        <h2 className="text-3xl font-bold text-champagne mb-2">Join the Party</h2>
        <p className="text-champagne/60 text-center mb-8">Enter a nickname to let others know who is singing.</p>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <input 
            type="text" 
            placeholder="Your Nickname" 
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            className="w-full py-4 px-6 rounded-xl bg-black border border-white/20 text-center text-xl focus:outline-none focus:border-accent text-champagne"
            maxLength={20}
            autoFocus
          />
          <button 
            type="submit"
            disabled={isJoining || localName.trim().length === 0}
            className="w-full py-4 px-6 rounded-xl bg-accent text-black font-bold text-lg hover:bg-yellow-400 transition-colors disabled:opacity-50"
          >
            {isJoining ? 'Joining...' : "Let's Sing"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
