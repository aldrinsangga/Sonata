import React from 'react';
import { useAppStore } from '../store';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Trash2, GripVertical, Music } from 'lucide-react';

export default function SharedQueue({ roomId }: { roomId: string }) {
  const { queue, isHost, currentRoom, playbackState } = useAppStore();

  const pendingQueue = queue.filter(q => q.status === 'pending');
  const nowPlaying = queue.find(q => q.videoId === playbackState?.currentVideoId && q.status === 'pending');
  
  // Note: we're visually marking the one playing, but logic-wise, 
  // onEnd marks it played and we pick the next. So nowPlaying might be the first pending.

  const handleRemove = async (queueId: string) => {
    if (!isHost) return;
    try {
      await deleteDoc(doc(db, `rooms/${roomId}/queue`, queueId));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col border-b border-gray-200 bg-white">
      <div className="px-4 py-2 bg-gray-50/50 flex items-center justify-between shrink-0 border-b border-gray-200">
        <span className="text-xs font-bold uppercase tracking-widest text-[#ff0000]">SHARED QUEUE</span>
        <span className="text-[10px] text-gray-500 font-bold">{pendingQueue.length} / {currentRoom?.settings?.queueLimit || 50} SONGS</span>
      </div>
      
      <div className="max-h-[600px] overflow-y-auto px-4 py-4 space-y-2 custom-scrollbar">
        {pendingQueue.map((item, index) => {
           const isPlaying = playbackState?.currentVideoId === item.videoId && index === 0;

           if (isPlaying) {
             return (
               <div key={item.id} className="p-2 bg-red-50 border-l-2 border-[#ff0000] rounded-r flex gap-3 items-center group relative overflow-hidden shadow-sm">
                 <div className="relative w-16 h-10 bg-black rounded overflow-hidden shrink-0 border border-red-200 shadow-sm">
                   {item.thumbnail ? (
                     <img 
                       src={item.thumbnail} 
                       alt={item.title} 
                       referrerPolicy="no-referrer" 
                       className="w-full h-full object-cover" 
                     />
                   ) : (
                     <div className="w-full h-full bg-red-100 flex items-center justify-center">
                       <Music className="w-4 h-4 text-[#ff0000]" />
                     </div>
                   )}
                   <div className="absolute bottom-0 left-0 right-0 bg-[#ff0000]/90 text-[7px] tracking-wider font-extrabold text-white text-center py-0.5 leading-none uppercase">
                     PLAYING
                   </div>
                 </div>
                 <div className="flex-1 min-w-0 pr-6">
                   <p className="text-xs font-bold truncate text-black">{item.title}</p>
                   <p className="text-[10px] text-gray-600 truncate">Now Playing • <span className="text-[#ff0000] font-medium">Added by {item.addedBy}</span></p>
                 </div>
                  {isHost && (
                    <button onClick={() => handleRemove(item.id)} className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 text-[#ff0000] hover:bg-[#ff0000]/10 rounded transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
               </div>
             );
           }

           return (
             <div key={item.id} className="p-2 bg-white border border-gray-200 rounded flex gap-3 items-center hover:border-gray-300 transition-all group relative overflow-hidden shadow-sm">
               <div className="relative w-16 h-10 bg-black rounded overflow-hidden shrink-0 border border-gray-100 shadow-sm">
                 {item.thumbnail ? (
                   <img 
                     src={item.thumbnail} 
                     alt={item.title} 
                     referrerPolicy="no-referrer" 
                     className="w-full h-full object-cover" 
                   />
                 ) : (
                   <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                     <Music className="w-4 h-4 text-gray-400" />
                   </div>
                 )}
                 <div className="absolute top-0.5 left-0.5 px-1 py-0.5 bg-black/75 backdrop-blur-[1px] text-[8px] font-extrabold text-white rounded scale-90 origin-top-left">
                   #{index + 1}
                 </div>
               </div>
               <div className="flex-1 min-w-0 pr-6">
                 <p className="text-xs font-bold text-black truncate">{item.title}</p>
                 <p className="text-[10px] text-[#ff0000] truncate font-medium">Added by {item.addedBy}</p>
               </div>
               {isHost && (
                  <button onClick={() => handleRemove(item.id)} className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 text-[#ff0000] hover:bg-[#ff0000]/10 rounded transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
               )}
             </div>
           );
        })}

        {pendingQueue.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-xs font-bold uppercase tracking-widest">
            Queue is empty
          </div>
        )}
      </div>
    </div>
  );
}
