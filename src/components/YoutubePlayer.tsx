import React, { useEffect, useRef, useState } from 'react';
import YouTube, { YouTubeProps, YouTubePlayer } from 'react-youtube';
import { useAppStore } from '../store';
import { doc, updateDoc, setDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PlaybackState } from '../lib/types';
import { Play, Pause, SkipForward, Maximize, Music, Sparkles } from 'lucide-react';
import { SLogo } from './SLogo';
import { generateRoomCode } from '../lib/utils';
import { LivePlayerOverlay } from './LiveInteractions';

export default function AppYoutubePlayer({ roomId, isTheater, onToggleTheater }: { roomId: string, isTheater?: boolean, onToggleTheater?: () => void }) {
  const { isHost, playbackState, queue, isDisplayDevice, nickname } = useAppStore();
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [localPlaying, setLocalPlaying] = useState(false);
  const skipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const currentVideoId = playbackState?.currentVideoId;

  const SUGGESTED_SONGS = [
    {
      videoId: "Tiaby1lXiVU",
      title: "Dancing Queen - ABBA (Karaoke Version)",
      thumbnail: "https://i.ytimg.com/vi/Tiaby1lXiVU/mqdefault.jpg",
      channel: "Musisi Karaoke",
      duration: "4:14",
      seconds: 254
    },
    {
      videoId: "TBxAAOOJzL8",
      title: "Sweet Child O' Mine - Guns N' Roses (Karaoke Version)",
      thumbnail: "https://i.ytimg.com/vi/TBxAAOOJzL8/mqdefault.jpg",
      channel: "Musisi Karaoke",
      duration: "6:07",
      seconds: 367
    },
    {
      videoId: "96d9nUfSvkk",
      title: "Bohemian Rhapsody - Queen (Karaoke Version)",
      thumbnail: "https://i.ytimg.com/vi/96d9nUfSvkk/mqdefault.jpg",
      channel: "Musisi Karaoke",
      duration: "6:11",
      seconds: 371
    },
    {
      videoId: "2QXYrut1PLs",
      title: "Can't Help Falling in Love - Elvis Presley (Karaoke Version)",
      thumbnail: "https://i.ytimg.com/vi/2QXYrut1PLs/mqdefault.jpg",
      channel: "Musisi Karaoke",
      duration: "3:06",
      seconds: 186
    },
    {
      videoId: "B3O1OlTWXSA",
      title: "Rolling in The Deep - Adele (Karaoke Version)",
      thumbnail: "https://i.ytimg.com/vi/B3O1OlTWXSA/mqdefault.jpg",
      channel: "Musisi Karaoke",
      duration: "4:22",
      seconds: 262
    },
    {
      videoId: "8Bd6qbR-3BY",
      title: "All Of Me - John Legend (Karaoke Version)",
      thumbnail: "https://i.ytimg.com/vi/8Bd6qbR-3BY/mqdefault.jpg",
      channel: "Musisi Karaoke",
      duration: "5:01",
      seconds: 301
    },
    {
      videoId: "5QBn1B-6cPc",
      title: "Perfect - Ed Sheeran (Karaoke Version)",
      thumbnail: "https://i.ytimg.com/vi/5QBn1B-6cPc/mqdefault.jpg",
      channel: "Musisi Karaoke",
      duration: "4:38",
      seconds: 278
    },
    {
      videoId: "DIC1AzEgnnw",
      title: "Just The Way You Are - Bruno Mars (Karaoke Version)",
      thumbnail: "https://i.ytimg.com/vi/DIC1AzEgnnw/mqdefault.jpg",
      channel: "Musisi Karaoke",
      duration: "3:54",
      seconds: 234
    },
    {
      videoId: "Kq8zlXS2bUg",
      title: "Talking To The Moon - Bruno Mars (Karaoke Version)",
      thumbnail: "https://i.ytimg.com/vi/Kq8zlXS2bUg/mqdefault.jpg",
      channel: "Musisi Karaoke",
      duration: "3:49",
      seconds: 229
    },
    {
      videoId: "xor3sfFCdIk",
      title: "Love Story - Taylor Swift (Karaoke Version)",
      thumbnail: "https://i.ytimg.com/vi/xor3sfFCdIk/mqdefault.jpg",
      channel: "EdKara",
      duration: "3:55",
      seconds: 235
    },
    {
      videoId: "w-bGMo4q-aA",
      title: "Stayin' Alive - Bee Gees (Karaoke Version)",
      thumbnail: "https://i.ytimg.com/vi/w-bGMo4q-aA/mqdefault.jpg",
      channel: "Atomic Karaoke",
      duration: "3:50",
      seconds: 230
    },
    {
      videoId: "k7aQR_2UHL0",
      title: "Hotel California - Eagles (Karaoke Version)",
      thumbnail: "https://i.ytimg.com/vi/k7aQR_2UHL0/mqdefault.jpg",
      channel: "Miditech Karaoke",
      duration: "6:26",
      seconds: 386
    },
    {
      videoId: "NgsfuwjPlCY",
      title: "Careless Whisper - George Michael (Karaoke Version)",
      thumbnail: "https://i.ytimg.com/vi/NgsfuwjPlCY/mqdefault.jpg",
      channel: "Musisi Karaoke",
      duration: "4:55",
      seconds: 295
    },
    {
      videoId: "R9tH0cwgYNA",
      title: "Creep - Radiohead (Piano Karaoke Version)",
      thumbnail: "https://i.ytimg.com/vi/R9tH0cwgYNA/mqdefault.jpg",
      channel: "KaraoKeysPH",
      duration: "5:13",
      seconds: 313
    },
    {
      videoId: "CSmaRJ5O9nQ",
      title: "Let It Go - Frozen (Karaoke Version)",
      thumbnail: "https://i.ytimg.com/vi/CSmaRJ5O9nQ/mqdefault.jpg",
      channel: "Musisi Karaoke",
      duration: "4:08",
      seconds: 248
    },
    {
      videoId: "RZilucf-3no",
      title: "Hallelujah - Leonard Cohen (Karaoke Version)",
      thumbnail: "https://i.ytimg.com/vi/RZilucf-3no/mqdefault.jpg",
      channel: "PianoNest",
      duration: "3:53",
      seconds: 233
    },
    {
      videoId: "I4RwbQ9zUEU",
      title: "Wonderwall - Oasis (Karaoke Version)",
      thumbnail: "https://i.ytimg.com/vi/I4RwbQ9zUEU/mqdefault.jpg",
      channel: "CC Karaoke",
      duration: "4:21",
      seconds: 261
    },
    {
      videoId: "c7qAHxBt-z4",
      title: "My Way - Frank Sinatra (Karaoke Version)",
      thumbnail: "https://i.ytimg.com/vi/c7qAHxBt-z4/mqdefault.jpg",
      channel: "Atomic Karaoke",
      duration: "4:47",
      seconds: 287
    },
    {
      videoId: "1x1d8WqHU_s",
      title: "Yellow - Coldplay (Karaoke Version)",
      thumbnail: "https://i.ytimg.com/vi/1x1d8WqHU_s/mqdefault.jpg",
      channel: "Agaw Music Karaoke",
      duration: "4:33",
      seconds: 273
    },
    {
      videoId: "RSP_Ld0drEs",
      title: "Yesterday - The Beatles (Karaoke Version)",
      thumbnail: "https://i.ytimg.com/vi/RSP_Ld0drEs/mqdefault.jpg",
      channel: "Acoustic Lounge",
      duration: "2:34",
      seconds: 154
    },
    {
      videoId: "UcWEfvu6F_s",
      title: "Sweet Caroline - Neil Diamond (Karaoke Version)",
      thumbnail: "https://i.ytimg.com/vi/UcWEfvu6F_s/mqdefault.jpg",
      channel: "Atomic Karaoke",
      duration: "3:45",
      seconds: 225
    },
    {
      videoId: "oVAyWQHzHJI",
      title: "Livin' on a Prayer - Bon Jovi (Karaoke Version)",
      thumbnail: "https://i.ytimg.com/vi/oVAyWQHzHJI/mqdefault.jpg",
      channel: "Mihai Doboga",
      duration: "4:26",
      seconds: 266
    },
    {
      videoId: "2HGEFy7aXwc",
      title: "Billie Jean - Michael Jackson (Karaoke Version)",
      thumbnail: "https://i.ytimg.com/vi/2HGEFy7aXwc/mqdefault.jpg",
      channel: "Karaoke Original",
      duration: "6:27",
      seconds: 387
    },
    {
      videoId: "hPp_SbVp8Os",
      title: "Bad Guy - Billie Eilish (Karaoke Version)",
      thumbnail: "https://i.ytimg.com/vi/hPp_SbVp8Os/mqdefault.jpg",
      channel: "anz works",
      duration: "3:32",
      seconds: 212
    },
    {
      videoId: "Zn3hp1BSFV8",
      title: "Africa - Toto (Karaoke Version)",
      thumbnail: "https://i.ytimg.com/vi/Zn3hp1BSFV8/mqdefault.jpg",
      channel: "Chris Jackson Music",
      duration: "5:24",
      seconds: 324
    }
  ];

  const handleAddSuggestion = async (video: typeof SUGGESTED_SONGS[0]) => {
    if (addedIds.has(video.videoId)) return;
    
    const queueId = generateRoomCode(10);
    const qDoc = doc(db, `rooms/${roomId}/queue`, queueId);
    await setDoc(qDoc, {
      id: queueId,
      videoId: video.videoId,
      title: video.title,
      thumbnail: video.thumbnail,
      channel: video.channel,
      duration: video.duration,
      seconds: video.seconds,
      addedBy: nickname || 'Guest',
      status: 'pending',
      addedAt: Date.now()
    });

    setAddedIds(prev => new Set(prev).add(video.videoId));
  };

  // Auto-start next video if queue has items and nothing is playing
  useEffect(() => {
    if (isHost && !currentVideoId) {
      const pendingQueue = queue.filter(q => q.status === 'pending');
      if (pendingQueue.length > 0) {
        const nextVideo = pendingQueue[0];
        
        // Mark next video as playing
        const ref = doc(db, `rooms/${roomId}/playbackState`, 'current');
        updateDoc(ref, {
          currentVideoId: nextVideo.videoId,
          currentPlaybackTime: 0,
          isPlaying: true,
          updatedAt: Date.now()
        }).catch(console.error);

        // Mark as played
        const qRef = doc(db, `rooms/${roomId}/queue`, nextVideo.id);
        updateDoc(qRef, { status: 'played' }).catch(console.error);
      }
    }
  }, [queue, currentVideoId, isHost, roomId]);

  // Sync to remote state
  useEffect(() => {
    if (!playerRef.current || !playbackState || isHost) return;

    const player = playerRef.current;
    
    // Play/Pause sync
    const state = player.getPlayerState();
    // 1 is playing, 2 is paused
    if (playbackState.isPlaying && state !== 1 && state !== 3) {
      player.playVideo();
    } else if (!playbackState.isPlaying && state === 1) {
      player.pauseVideo();
    }

    // Drift correction
    const currentTime = player.getCurrentTime();
    // Expected time = remote time + elapsed time since update
    const elapsedSinceUpdate = (Date.now() - playbackState.updatedAt) / 1000;
    const expectedTime = playbackState.isPlaying 
      ? playbackState.currentPlaybackTime + elapsedSinceUpdate 
      : playbackState.currentPlaybackTime;

    if (Math.abs(currentTime - expectedTime) > 3) {
       player.seekTo(expectedTime, true);
    }

  }, [playbackState, isHost]);

  // Host syncing loop
  useEffect(() => {
    if (!isHost || !playerRef.current || !playbackState || !currentVideoId) return;

    const interval = setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      
      const state = player.getPlayerState();
      const isPlaying = state === 1;
      const currentTime = player.getCurrentTime();

      // Only update if there's a significant change to save firebase writes, 
      // but update at least every 5s for drift correction
      const timeSinceLastUpdate = Date.now() - playbackState.updatedAt;
      
      if (
        playbackState.isPlaying !== isPlaying || 
        timeSinceLastUpdate > 5000 || 
        Math.abs(playbackState.currentPlaybackTime - currentTime) > 3
      ) {
        const ref = doc(db, `rooms/${roomId}/playbackState`, 'current');
        updateDoc(ref, {
          isPlaying,
          currentPlaybackTime: currentTime,
          updatedAt: Date.now()
        }).catch(console.error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isHost, playbackState, roomId, currentVideoId]);

  const onReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    // Autoplay for host if there's a video
    if (isHost && currentVideoId && playbackState?.isPlaying) {
      event.target.playVideo();
    }
  };

  const onStateChange: YouTubeProps['onStateChange'] = (event) => {
    // 1 is PLAYING, 2 is PAUSED
    setLocalPlaying(event.data === 1);
    
    if (isHost && playbackState) {
      const isPlaying = event.data === 1;
      const ref = doc(db, `rooms/${roomId}/playbackState`, 'current');
      updateDoc(ref, {
        isPlaying,
        currentPlaybackTime: event.target.getCurrentTime(),
        updatedAt: Date.now()
      }).catch(console.error);
    }
  };

  const onEnd: YouTubeProps['onEnd'] = async () => {
     if (isHost) {
        // Find next video in queue
        const pendingQueue = queue.filter(q => q.status === 'pending');
        if (pendingQueue.length > 0) {
           const nextVideo = pendingQueue[0];
           
           // Mark next video as playing or update playback state
           const ref = doc(db, `rooms/${roomId}/playbackState`, 'current');
           await updateDoc(ref, {
             currentVideoId: nextVideo.videoId,
             currentPlaybackTime: 0,
             isPlaying: true,
             updatedAt: Date.now()
           });

           // Mark as played
           const qRef = doc(db, `rooms/${roomId}/queue`, nextVideo.id);
           await updateDoc(qRef, { status: 'played' });
        } else {
           const ref = doc(db, `rooms/${roomId}/playbackState`, 'current');
           await updateDoc(ref, {
             currentVideoId: null,
             currentPlaybackTime: 0,
             isPlaying: false,
             updatedAt: Date.now()
           });
        }
     }
  };

  const onError: YouTubeProps['onError'] = (event) => {
     console.error("YouTube Player Error", event.data);
     if (isHost) {
       setErrorMsg("Video restricted by owner. Skipping in 3s...");
       setTimeout(() => {
         setErrorMsg(null);
         onEnd({ target: playerRef.current } as any);
       }, 3000);
     }
  };

  const handleSkip = () => {
     if (playerRef.current) {
        onEnd({ target: playerRef.current } as any);
     }
  };

  const togglePlay = () => {
    if (!playerRef.current) return;
    const state = playerRef.current.getPlayerState();
    if (state === 1) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const opts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      modestbranding: 1,
      rel: 0,
      controls: isHost ? 1 : 0, // hide controls for guests
      disablekb: isHost ? 0 : 1,
      origin: window.location.origin,
    },
  };

  if (!currentVideoId) {
    return (
      <div className="w-full shrink-0 flex flex-col">
        <div className="aspect-video w-full bg-black flex items-center justify-center group overflow-hidden relative shrink-0">
          <div className="text-center">
             <SLogo className="w-12 h-12 sm:w-16 sm:h-16 text-[#ff0000] mx-auto mb-4" />
             <p className="text-[#FFFFFF] text-sm sm:text-base uppercase tracking-widest font-bold">Queue is empty</p>
             <p className="text-[#FFFFFF]/30 text-xs sm:text-sm mt-1 mb-6">Add a song to start the party</p>
             
             {!showSuggestions ? (
               <button 
                 onClick={() => setShowSuggestions(true)}
                 className="px-6 py-2.5 bg-[#ff0000] text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#cc0000] transition-all transform hover:scale-105 shadow-lg shadow-[#ff0000]/20 flex items-center gap-2 mx-auto"
               >
                 <Sparkles className="w-4 h-4" />
                 Suggest Songs
               </button>
             ) : (
               <div className="w-full max-w-5xl mx-auto px-4 absolute inset-0 bg-black/90 z-30 flex flex-col p-6 overflow-hidden">
                  <div className="flex items-center justify-between mb-4 shrink-0">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#ff0000]" />
                      <span className="text-sm font-bold text-white uppercase tracking-widest">Karaoke Suggestions</span>
                    </div>
                    <button 
                      onClick={() => setShowSuggestions(false)} 
                      className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest rounded-full transition-colors"
                    >
                      Close
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 pr-2 custom-scrollbar">
                    {SUGGESTED_SONGS.map(song => (
                      <div key={song.videoId} className="bg-white/5 rounded-2xl p-2.5 border border-white/10 flex flex-col gap-3 group/song hover:bg-white/10 transition-colors">
                         <div className="relative aspect-video rounded-xl overflow-hidden">
                           <img src={song.thumbnail} className="w-full h-full object-cover transition-transform group-hover/song:scale-110" />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/song:opacity-100 transition-opacity flex items-center justify-center">
                             <Music className="w-6 h-6 text-[#ff0000]" />
                           </div>
                         </div>
                         <div className="flex-1 flex flex-col gap-1 min-w-0">
                           <p className="text-[11px] font-bold text-white line-clamp-2 text-left leading-tight">{song.title}</p>
                           <p className="text-[9px] text-white/40 text-left font-medium">{song.channel}</p>
                         </div>
                         <button 
                           onClick={() => handleAddSuggestion(song)}
                           disabled={addedIds.has(song.videoId)}
                           className={`w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all shadow-lg ${
                             addedIds.has(song.videoId) 
                               ? 'bg-green-500 text-white scale-95 opacity-80' 
                               : 'bg-white text-black hover:bg-[#ff0000] hover:text-white transform group-hover/song:translate-y-[-2px]'
                           }`}
                         >
                           {addedIds.has(song.videoId) ? 'Added ✓' : 'Add to queue'}
                         </button>
                      </div>
                    ))}
                  </div>
               </div>
             )}
          </div>
          <LivePlayerOverlay roomId={roomId} />
        </div>
        
        {/* Controls Overlay from Design HTML */}
        {isHost && (
          <div className="w-full p-4 bg-white flex items-center justify-center gap-6 border-b border-gray-200 shrink-0">
            <button onClick={onToggleTheater} className="px-5 py-2 text-xs font-bold bg-[#ff0000] hover:bg-[#cc0000] text-white rounded-full transition-colors uppercase cursor-pointer">
              {isTheater ? 'Exit Theater' : 'Theater Mode'}
            </button>
            <button className="bg-[#ff0000] text-white p-3 rounded-full opacity-50 cursor-not-allowed">
              <Play className="w-6 h-6" fill="currentColor" />
            </button>
            <button className="px-5 py-2 text-xs font-bold bg-[#ff0000] text-white rounded-full opacity-50 cursor-not-allowed uppercase">
              SKIP SONG
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full shrink-0 flex flex-col">
      <div className="aspect-video w-full relative group bg-black shrink-0">
        <div className="w-full h-full overflow-hidden relative pointer-events-none sm:pointer-events-auto">
          <YouTube 
            videoId={currentVideoId}
            opts={opts}
            onReady={onReady}
            onStateChange={onStateChange}
            onEnd={onEnd}
            onError={onError}
            className="w-full h-full"
            iframeClassName="w-full h-full pb-[1px]" // tiny hack to hide youtube timeline
          />
          
          {/* Guest Overlay to prevent interaction */}
          {!isHost && (
            <div className="absolute inset-0 bg-transparent z-10" />
          )}

          {errorMsg && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
              <p className="text-white text-lg font-bold bg-[#ff0000] px-4 py-2 rounded">{errorMsg}</p>
            </div>
          )}
          <LivePlayerOverlay roomId={roomId} />
        </div>
      </div>

      {/* Controls Overlay from Design HTML */}
      {isHost && (
        <div className="w-full p-4 bg-white flex items-center justify-center gap-6 border-b border-gray-200 shrink-0">
          <button onClick={onToggleTheater} className="px-5 py-2 text-xs font-bold bg-[#ff0000] hover:bg-[#cc0000] text-white rounded-full transition-colors uppercase cursor-pointer">
            {isTheater ? 'Exit Theater' : 'Theater Mode'}
          </button>
          <button onClick={togglePlay} className="bg-[#ff0000] text-white p-3 rounded-full hover:scale-110 transition-transform">
            {localPlaying ? <Pause className="w-6 h-6" fill="currentColor" /> : <Play className="w-6 h-6" fill="currentColor" />}
          </button>
          <button onClick={handleSkip} className="px-5 py-2 text-xs font-bold bg-[#ff0000] text-white rounded-full hover:bg-[#cc0000] transition-colors uppercase cursor-pointer">
            SKIP SONG
          </button>
        </div>
      )}
    </div>
  );
}
