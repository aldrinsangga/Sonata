import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Link as LinkIcon, Settings, LogOut, Check } from 'lucide-react';
import { useAppStore } from '../store';
import SharedQueue from './SharedQueue';
import ParticipantList from './ParticipantList';
import { Footer } from './Footer';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { LiveInteractionsPanel } from './LiveInteractions';
import { usePWAInstall } from './PWAInstallProvider';

export default function RoomSidebar({ roomId }: { roomId: string }) {
  const { currentRoom, isHost, queue, participants, addToast } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'queue' | 'chat' | 'people'>('queue');
  const navigate = useNavigate();
  const { promptInstall, isInstalled } = usePWAInstall();

  const roomLink = window.location.origin + `/room/${currentRoom?.roomCode || roomId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(roomLink).then(() => {
      setCopied(true);
      addToast("Room link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }).catch((err) => {
      console.error(err);
      addToast("Failed to copy link", "error");
    });
  };

  const leaveRoom = () => {
    navigate('/');
  };

  return (
    <div className="flex flex-col h-full w-full bg-white select-none">
      {/* QR Section */}
      <div className="p-4 border-b border-gray-200 text-center flex flex-col items-center shrink-0">
        <div className="inline-block p-2 bg-white rounded-lg mb-3 shadow-sm border border-gray-100">
          <QRCodeSVG value={roomLink} size={100} fgColor="#000000" />
        </div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-black mb-3">SCAN TO JOIN ROOM</p>
        <div className="flex gap-2 w-full max-w-[200px]">
          <button 
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-black hover:bg-gray-800 rounded border border-gray-200 text-[10px] font-bold uppercase text-white transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <LinkIcon className="w-3 h-3" />}
            {copied ? 'Copied' : 'Link'}
          </button>
          <button 
            onClick={leaveRoom}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-[#ff0000]/10 hover:bg-[#ff0000]/20 rounded border border-[#ff0000]/30 text-[10px] font-bold uppercase text-[#ff0000] transition-colors"
          >
            <LogOut className="w-3 h-3" />
            Leave
          </button>
        </div>
      </div>

      {/* Sidebar Tabs Controls */}
      <div className="flex border-b border-gray-200 bg-gray-50/50 shrink-0">
        <button
          onClick={() => setActiveTab('queue')}
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-wider border-b-2 text-center transition-all ${
            activeTab === 'queue'
              ? 'border-[#ff0000] text-[#ff0000] bg-white font-black'
              : 'border-transparent text-gray-500 hover:text-black hover:bg-gray-100/30'
          }`}
        >
          Queue ({queue.length})
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-wider border-b-2 text-center transition-all flex items-center justify-center gap-1 ${
            activeTab === 'chat'
              ? 'border-[#ff0000] text-[#ff0000] bg-white font-black'
              : 'border-transparent text-gray-500 hover:text-black hover:bg-gray-100/30'
          }`}
        >
          Live Chat <span className="w-1.5 h-1.5 bg-[#ff0000] rounded-full animate-ping" />
        </button>
        <button
          onClick={() => setActiveTab('people')}
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-wider border-b-2 text-center transition-all ${
            activeTab === 'people'
              ? 'border-[#ff0000] text-[#ff0000] bg-white font-black'
              : 'border-transparent text-gray-500 hover:text-black hover:bg-gray-100/30'
          }`}
        >
          People ({participants.length})
        </button>
      </div>

      {/* Sidebar Tab Contents wrapper */}
      <div className="flex-1 overflow-y-auto flex flex-col min-h-0 bg-white">
        {activeTab === 'queue' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col h-full">
            <SharedQueue roomId={roomId} />
          </div>
        )}
        
        {activeTab === 'chat' && (
          <LiveInteractionsPanel roomId={roomId} isSidebar={true} />
        )}
        
        {activeTab === 'people' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col h-full">
            <ParticipantList />
          </div>
        )}
      </div>

      {/* Install Sonata section */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 flex flex-col items-center justify-center shrink-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-center text-gray-500 mb-2">
          {isInstalled ? "Sonata is ready on your device" : "Install Sonata for the full Karaoke experience"}
        </p>
        <button
          onClick={promptInstall}
          className={`w-full py-2 rounded font-bold text-xs uppercase tracking-wider transition-colors shadow-sm ${
            isInstalled 
              ? "bg-green-600 hover:bg-green-700 text-white" 
              : "bg-[#ff0000] hover:bg-[#cc0000] text-white"
          }`}
        >
          {isInstalled ? "✓ Sonata Installed" : "Install Sonata"}
        </button>
      </div>
      <Footer className="py-4 text-black bg-gray-50 border-t border-gray-100 shrink-0" />
    </div>
  );
}
