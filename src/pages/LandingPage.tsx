import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Music, Settings, ArrowRight, QrCode } from 'lucide-react';
import { SLogo } from '../components/SLogo';
import { Footer } from '../components/Footer';
import { createRoom, getRoomByCode, joinRoomParticipant } from '../lib/roomService';
import { useAppStore } from '../store';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { userId, setIsHost, setNickname, setIsDisplayDevice } = useAppStore();
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [showCreatePrompt, setShowCreatePrompt] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nicknameInput.trim()) return;

    setIsCreating(true);
    setError('');
    try {
      const roomId = await createRoom(userId);
      setIsHost(true);
      setIsDisplayDevice(true);
      setNickname(nicknameInput.trim());
      await joinRoomParticipant(roomId, userId, nicknameInput.trim(), true);
      navigate(`/room/${roomId}`);
    } catch (err) {
      console.error(err);
      setError('Failed to create room. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    
    setIsJoining(true);
    setError('');
    try {
      const room = await getRoomByCode(joinCode.toUpperCase());
      if (!room) {
        setError('Room not found or closed.');
        return;
      }
      setIsHost(false);
      setIsDisplayDevice(false);
      navigate(`/room/${room.id}`);
    } catch (err) {
      console.error(err);
      setError('Failed to join room.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-champagne flex flex-col items-center p-6 sm:p-12 font-sans selection:bg-accent selection:text-black">
      
      {/* Main Content */}
      <main className="w-full max-w-5xl flex flex-col items-center justify-center flex-1">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 flex flex-col items-center"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#ff0000] flex items-center justify-center shadow-2xl shadow-[#ff0000]/40 mb-6">
            <SLogo className="w-8 h-8 sm:w-10 sm:h-10 text-accent" />
          </div>
          <h1 className="text-4xl sm:text-6xl font-display font-black tracking-tighter mb-3 text-white uppercase">
            SONATA
          </h1>
          <p className="text-base sm:text-lg text-champagne/70 max-w-2xl mx-auto">
            Create karaoke rooms, invite friends, add songs to a shared queue, and sing along instantly.
          </p>
        </motion.div>

        {error && (
          <div className="mb-6 p-4 bg-[#ff0000]/50 border border-[#ff0000]/50 text-[#ff0000] rounded-lg w-full max-w-xl text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          {/* Create Room Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#ff0000] rounded-3xl p-8 flex flex-col items-center text-center hover:bg-[#cc0000] transition-colors shadow-xl shadow-[#ff0000]/20"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-display font-bold mb-3 text-white">Host a Room</h3>
            <p className="text-white/80 mb-8">Create a new karaoke room and invite your friends via link or QR code.</p>
            
            {!showCreatePrompt ? (
               <button 
                onClick={() => setShowCreatePrompt(true)}
                className="mt-auto w-full py-4 px-6 rounded-xl bg-white text-[#ff0000] font-bold text-lg hover:bg-white/90 transition-colors shadow-lg flex flex-row items-center justify-center gap-2"
              >
                Create New Room
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <form onSubmit={handleCreateRoom} className="mt-auto w-full flex flex-col gap-3">
                <input 
                  type="text" 
                  required
                  placeholder="Your Nickname" 
                  value={nicknameInput}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  className="w-full py-4 px-6 rounded-xl bg-black/20 border border-white/20 text-center text-xl focus:outline-none focus:border-white text-white placeholder:text-white/50"
                  maxLength={20}
                  autoFocus
                />
                <button 
                  type="submit"
                  disabled={isCreating || !nicknameInput.trim()}
                  className="w-full py-4 px-6 rounded-xl bg-white text-[#ff0000] font-bold text-lg hover:bg-white/90 transition-colors disabled:opacity-50 flex flex-row items-center justify-center gap-2"
                >
                  {isCreating ? 'Creating...' : 'Start Party'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            )}
          </motion.div>

          {/* Join Room Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#111111] border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center hover:bg-[#151515] transition-colors shadow-xl"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#ff0000]/10 flex items-center justify-center mb-6">
              <Music className="w-8 h-8 text-[#ff0000]" />
            </div>
            <h3 className="text-2xl font-display font-bold mb-3">Join a Room</h3>
            <p className="text-champagne/60 mb-8">Enter a room code below to jump right into the party.</p>
            
            <form onSubmit={handleJoinRoom} className="mt-auto w-full flex flex-col gap-3">
              <input 
                type="text" 
                placeholder="Enter Room Code" 
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="w-full py-4 px-6 rounded-xl bg-black border border-white/20 text-center text-xl uppercase tracking-widest focus:outline-none focus:border-[#ff0000] font-mono placeholder:normal-case placeholder:tracking-normal placeholder:text-lg text-champagne"
                maxLength={6}
              />
              <button 
                type="submit"
                disabled={isJoining || joinCode.length < 3}
                className="w-full py-4 px-6 rounded-xl bg-[#ff0000] text-white font-bold text-lg hover:bg-[#cc0000] transition-colors disabled:opacity-50 flex flex-row items-center justify-center gap-2"
              >
                {isJoining ? 'Joining...' : 'Join Room'}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-24 w-full max-w-6xl">
          <div className="flex flex-col items-center text-center p-6">
            <SLogo className="w-10 h-10 text-[#ff0000] mb-4" />
            <h4 className="font-bold text-lg mb-2">YouTube Integration</h4>
            <p className="text-champagne/60 text-sm">Search and play any karaoke video directly from YouTube.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6">
            <Settings className="w-10 h-10 text-[#ff0000] mb-4" />
            <h4 className="font-bold text-lg mb-2">Real-time Sync</h4>
            <p className="text-champagne/60 text-sm">Everyone stays in perfect sync. No lag, no desyncs.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6">
            <Users className="w-10 h-10 text-[#ff0000] mb-4" />
            <h4 className="font-bold text-lg mb-2">No Registration</h4>
            <p className="text-champagne/60 text-sm">Enter a nickname and start singing. It's that simple.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6">
            <div className="w-10 h-10 flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-[#ff0000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-bold text-lg mb-2">Ads Free</h4>
            <p className="text-champagne/60 text-sm">No interruptions, no ads, and all free.</p>
          </div>
        </div>

      </main>
      
      <Footer className="mt-auto pt-16 max-w-5xl" />
    </div>
  );
}
