import React from 'react';
import { useAppStore } from '../store';
import { Users, Crown } from 'lucide-react';

export default function ParticipantList() {
  const { participants } = useAppStore();

  const activeParticipants = participants.filter(p => {
    // consider active if seen in the last 30 seconds
    return Date.now() - p.lastSeen < 30000;
  });

  return (
    <div className="flex flex-col bg-white">
      <div className="px-4 py-2 bg-gray-50/50 shrink-0 border-b border-gray-200">
        <span className="text-xs font-bold uppercase tracking-widest text-[#ff0000]">IN THE ROOM ({activeParticipants.length})</span>
      </div>
      <div className="p-4 flex flex-wrap gap-2 items-start content-start">
        {activeParticipants.map((p) => (
          <div key={p.id} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full ${p.role === 'host' ? 'bg-[#ff0000]/10 border border-[#ff0000]/30' : 'bg-gray-100 border border-gray-200'}`}>
            {p.role === 'host' ? (
              <div className="w-4 h-4 bg-[#ff0000] rounded-full text-[8px] flex items-center justify-center text-white font-bold shrink-0">H</div>
            ) : (
              <div className="w-2 h-2 bg-green-500 rounded-full shrink-0"></div>
            )}
            <span className="text-[11px] font-medium text-black whitespace-nowrap">
              {p.nickname} {p.role === 'host' && '(Host)'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
