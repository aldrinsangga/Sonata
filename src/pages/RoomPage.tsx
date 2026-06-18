import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoomSync } from '../lib/useRoomSync';
import { useAppStore } from '../store';
import NicknameModal from '../components/NicknameModal';
import { SettingsModal } from '../components/SettingsModal';
import { QRModal } from '../components/QRModal';
import { SocialShare } from '../components/SocialShare';
import AppYoutubePlayer from '../components/YoutubePlayer';
import SongSearch from '../components/SongSearch';
import SharedQueue from '../components/SharedQueue';
import ParticipantList from '../components/ParticipantList';
import RoomSidebar from '../components/RoomSidebar';
import { Footer } from '../components/Footer';
import { SLogo } from '../components/SLogo';
import { getRoomByCode } from '../lib/roomService';
import { LiveInteractionsPanel } from '../components/LiveInteractions';
import { Settings as SettingsIcon, Monitor, QrCode, User, Share2 } from 'lucide-react';
import { motion } from 'motion/react';
import { usePWAInstall } from '../components/PWAInstallProvider';

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { currentRoom, nickname, isHost, isDisplayDevice } = useAppStore();
  const { promptInstall, isInstalled } = usePWAInstall();
  const [actualRoomId, setActualRoomId] = useState<string | null>(null);
  const [showNickModal, setShowNickModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isTheater, setIsTheater] = useState(false);

  const roomLink = window.location.origin + `/room/${currentRoom?.roomCode || actualRoomId}`;

  // Resolve room code to actual roomId if necessary, or just use roomId
  useEffect(() => {
    if (!roomId) return;
    
    // Check if it's a 6 char code or a doc ID
    if (roomId.length === 6) {
      getRoomByCode(roomId.toUpperCase()).then(room => {
        if (room) {
           setActualRoomId(room.id);
        } else {
           navigate('/');
        }
      }).catch(() => navigate('/'));
    } else {
      setActualRoomId(roomId);
    }
  }, [roomId, navigate]);

  useRoomSync(actualRoomId || undefined);

  useEffect(() => {
    if (actualRoomId && !nickname) {
       setShowNickModal(true);
    }
  }, [actualRoomId, nickname]);

  // Handle theater mode toggle (simplified)
  useEffect(() => {
     const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 't' && e.altKey) setIsTheater(t => !t);
     };
     window.addEventListener('keydown', handleKeyDown);
     return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!actualRoomId) {
    return <div className="min-h-screen bg-white flex items-center justify-center text-black font-sans">Loading...</div>;
  }


  return (
    <div className="h-[100dvh] bg-white text-black font-sans flex flex-col overflow-hidden select-none selection:bg-accent selection:text-black">
      <NicknameModal 
        isOpen={showNickModal} 
        roomId={actualRoomId} 
        onJoined={() => setShowNickModal(false)} 
      />

      <SettingsModal 
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        roomId={actualRoomId}
      />

      <QRModal 
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        roomLink={roomLink}
      />

      {!showNickModal && (
        <>
          {/* Top Navigation Bar */}
          <header className="h-16 px-4 sm:px-6 border-b border-[#ff0000]/30 flex items-center justify-between bg-[#ff0000] z-20 shrink-0 sticky top-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#FFFFFF] rounded-full flex items-center justify-center shadow-lg">
                <SLogo className="w-4 h-4 text-black" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-serif font-bold tracking-wider text-white leading-none">SONATA</h1>
                {isDisplayDevice && (
                  <div className="flex items-center gap-1 text-[9px] text-white/70 font-bold uppercase tracking-wider mt-0.5">
                    <Monitor className="w-2 h-2" />
                    Display
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                <span className="text-[10px] font-display font-bold text-black tracking-widest">Room Code:</span>
                <span className="text-[10px] font-display font-bold tracking-widest text-[#ff0000]">{currentRoom?.roomCode || '------'}</span>
              </div>
              
              <button 
                onClick={() => setShowQRModal(true)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
                title="Room QR"
              >
                <QrCode className="w-5 h-5" />
              </button>

              <button 
                onClick={() => setShowSettingsModal(true)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
                title="Settings"
              >
                <SettingsIcon className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* White spacing below the header */}
          <div className="h-[6px] bg-white border-b border-gray-100 shrink-0 select-none" />

          <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Desktop Left / Mobile Main Stack */}
            <div className={`flex-1 flex flex-col min-w-0 ${!isTheater ? 'lg:border-r border-gray-200' : ''} h-full overflow-hidden`}>
              <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-gray-50/50">
                
                {/* Mobile Profile Banner */}
                <div className="lg:hidden p-4 bg-white border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-[#ff0000]">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Profile</p>
                      <p className="text-sm font-bold text-black">{nickname}</p>
                    </div>
                  </div>
                  {isHost && (
                    <span className="px-2 py-0.5 bg-[#ff0000]/10 text-[#ff0000] text-[9px] font-bold uppercase rounded border border-[#ff0000]/20">
                      Host
                    </span>
                  )}
                </div>

                {/* Content Stack */}
                <div className="flex flex-col gap-6 pb-20 lg:pt-0">
                  <div className="flex flex-col gap-[10px]">
                    {/* Search Section */}
                    {!isTheater && (
                      <div className="bg-white lg:bg-transparent px-0 lg:px-0 pt-0 pb-0">
                        <SongSearch roomId={actualRoomId} layoutMode="search" />
                      </div>
                    )}

                    {/* Player - ONLY if display device */}
                    {isDisplayDevice && (
                      <div className="shrink-0 bg-black">
                        <AppYoutubePlayer roomId={actualRoomId} isTheater={isTheater} onToggleTheater={() => setIsTheater(t => !t)} />
                      </div>
                    )}
                  </div>

                  {/* Mobile Only: Shared Queue & Participants */}
                  <div className="lg:hidden flex flex-col gap-6 px-4">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                       <SharedQueue roomId={actualRoomId} />
                    </div>
                    
                    <LiveInteractionsPanel roomId={actualRoomId} />
                    
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-1">
                      <ParticipantList />
                    </div>
                  </div>

                  {/* Desktop Only: Recommendations */}
                  <div className="hidden lg:block lg:bg-transparent lg:px-0 lg:py-0">
                    {!isTheater && (
                      <SongSearch roomId={actualRoomId} layoutMode="recommendations" />
                    )}
                  </div>

                  {/* Mobile Only: recommendations, social share, install, footer */}
                  <div className="lg:hidden flex flex-col gap-6 px-[14px]">
                    {/* Recommendations */}
                    {!isTheater && (
                      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden pb-4 pt-1">
                        <SongSearch roomId={actualRoomId} layoutMode="recommendations" />
                      </div>
                    )}
                    
                    {/* Social Share Icons */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                      <SocialShare roomLink={roomLink} />
                    </div>

                    {/* Install Sonata */}
                    <div className="bg-gradient-to-br from-[#ff0000] to-[#cc0000] p-6 rounded-3xl shadow-lg text-white flex flex-col items-center text-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-inner">
                        <SLogo className="w-6 h-6 text-[#ff0000]" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">
                          {isInstalled ? "App Installed" : "Get the app"}
                        </p>
                        <p className="text-sm font-medium mb-4">
                          {isInstalled ? "Sonata is ready on your device!" : "Install Sonata for the full Karaoke experience"}
                        </p>
                        <button
                          onClick={promptInstall}
                          className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all hover:scale-[1.02] shadow-lg ${
                            isInstalled 
                              ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/10" 
                              : "bg-white text-[#ff0000] shadow-white/20"
                          }`}
                        >
                          {isInstalled ? "✓ Sonata Installed" : "Install Sonata"}
                        </button>
                      </div>
                    </div>

                    <Footer className="opacity-30" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar: Desktop Only */}
            {!isTheater && (
              <aside className="hidden lg:flex w-full lg:w-80 xl:w-96 flex-col bg-white shrink-0 h-full overflow-hidden border-l border-gray-200">
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col h-full">
                  <RoomSidebar roomId={actualRoomId} />
                </div>
              </aside>
            )}
          </main>
        </>
      )}
    </div>
  );
}
