import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Loader2, RefreshCw } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAppStore } from '../store';
import { generateRoomCode } from '../lib/utils';
import { GENRE_DATA, SugSong } from '../data/genreSongs';
import { motion } from 'motion/react';
import { identifySongTags } from '../lib/genreTagging';

export default function SongSearch({ roomId }: { roomId: string }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { currentRoom, nickname, autoKaraoke } = useAppStore();

  const [activeCategory, setActiveCategory] = useState('pop');
  const [suggestedSongs, setSuggestedSongs] = useState<SugSong[]>([]);
  const [isRotating, setIsRotating] = useState(false);
  const [isFetchingRecs, setIsFetchingRecs] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45); // Countdown to next auto-shuffle

  // Shuffling logic fetching verified unblocked embeddable karaoke tracks from Youtube on the backend
  const shuffleCategory = useCallback(async (catId: string) => {
    setIsRotating(true);
    setIsFetchingRecs(true);
    try {
      const res = await fetch(`/api/recommendations?genre=${encodeURIComponent(catId)}`);
      const data = await res.json();
      if (data.results) {
        setSuggestedSongs(data.results);
      }
    } catch (err) {
      console.error("Error loading recommendations:", err);
    } finally {
      setIsRotating(false);
      setIsFetchingRecs(false);
      setTimeLeft(45); // reset visual shuffle timer
    }
  }, []);

  // Refetch when category changes
  useEffect(() => {
    shuffleCategory(activeCategory);
  }, [activeCategory, shuffleCategory]);

  // Periodic automatic shuffling timer & visual countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(p => {
        if (p <= 1) {
          shuffleCategory(activeCategory);
          return 45;
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeCategory, shuffleCategory]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const finalQuery = autoKaraoke && !query.toLowerCase().includes('karaoke') 
        ? `${query} karaoke` 
        : query;

      const res = await fetch(`/api/search?q=${encodeURIComponent(finalQuery)}`);
      const data = await res.json();
      if (data.results) {
        setResults(data.results);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const [addingMap, setAddingMap] = useState<Record<string, 'idle' | 'loading' | 'success'>>({});

  const handleAdd = async (video: any) => {
    if (addingMap[video.videoId] === 'loading' || addingMap[video.videoId] === 'success') {
      return;
    }
    setAddingMap(prev => ({ ...prev, [video.videoId]: 'loading' }));
    try {
      const queueId = generateRoomCode(10);
      const qDoc = doc(db, `rooms/${roomId}/queue`, queueId);
      await setDoc(qDoc, {
        id: queueId,
        videoId: video.videoId,
        title: video.title,
        thumbnail: video.thumbnail,
        channel: video.channel || "Sing King",
        duration: video.duration,
        seconds: video.seconds,
        addedBy: nickname,
        status: 'pending',
        addedAt: Date.now()
      });
      setAddingMap(prev => ({ ...prev, [video.videoId]: 'success' }));
      setTimeout(() => {
        setAddingMap(prev => ({ ...prev, [video.videoId]: 'idle' }));
      }, 4000); // UI feedback for 4 seconds to prevent double additions
    } catch (err) {
      console.error(err);
      setAddingMap(prev => ({ ...prev, [video.videoId]: 'idle' }));
    }
  };

  return (
    <div className="flex-1 bg-white p-4 lg:p-6 border-b lg:border-b-0 border-gray-200 flex flex-col min-h-[400px]">
      
      {/* Search form */}
      <form onSubmit={handleSearch} className="relative flex items-center mb-6 shrink-0 z-10 w-full">
        <input 
          type="text"
          placeholder="Search for karaoke songs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-white border border-gray-300 rounded-full py-2.5 pl-12 pr-28 focus:outline-none focus:border-[#ff0000] text-sm text-black placeholder:text-gray-500"
        />
        <Search className="absolute left-4 w-4 h-4 text-gray-400" />
        <button 
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 py-1.5 px-4 bg-[#ff0000] text-white rounded-full font-bold text-xs uppercase tracking-wider hover:bg-[#cc0000] transition-colors flex items-center justify-center disabled:opacity-50"
          disabled={isSearching}
        >
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
        </button>
      </form>

      {/* Dynamic Results vs Standard Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">
           {query && !isSearching ? `Search Results for "${query}"` : 'Search Results'}
        </h3>
        {results.length > 0 && <span className="text-[10px] text-gray-500 font-mono">{results.length} tracks matched</span>}
      </div>

      <div className="flex-1 flex flex-col pr-1 overflow-y-auto custom-scrollbar">
        {/* Searched Results List */}
        {results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-6 border-b border-gray-150 mb-8">
            {results.map((video) => (
              <div 
                key={video.videoId} 
                className={`flex gap-3 p-2 rounded-xl border transition-all cursor-pointer group ${
                  addingMap[video.videoId] === 'success'
                    ? 'bg-green-50 border-green-300 hover:border-green-400'
                    : 'bg-gray-50 border-gray-200 hover:border-[#ff0000]/50'
                }`} 
                onClick={() => handleAdd(video)}
              >
                <div className="w-28 sm:w-32 h-18 sm:h-20 bg-black rounded-lg overflow-hidden shrink-0 relative">
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 text-[10px] rounded text-white font-mono">
                    {video.duration}
                  </div>
                </div>
                
                <div className="flex flex-col justify-center min-w-0 flex-1">
                  <p className={`text-xs sm:text-sm font-bold truncate transition-colors ${
                    addingMap[video.videoId] === 'success' ? 'text-green-800' : 'text-black'
                  }`} title={video.title}>
                    {video.title}
                  </p>
                  <p className="text-[10px] text-gray-500 truncate mb-1">
                    {video.channel}
                  </p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleAdd(video); }}
                    disabled={addingMap[video.videoId] === 'loading' || addingMap[video.videoId] === 'success'}
                    className={`mt-auto px-3 py-1 font-bold text-[10px] uppercase tracking-wider rounded-lg self-start transition-colors ${
                      addingMap[video.videoId] === 'success'
                        ? 'bg-green-600 text-white cursor-default'
                        : addingMap[video.videoId] === 'loading'
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-[#ff0000] text-white hover:bg-[#cc0000]'
                    }`}
                  >
                    {addingMap[video.videoId] === 'success' ? (
                      '✓ Added'
                    ) : addingMap[video.videoId] === 'loading' ? (
                      <span className="flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Adding...
                      </span>
                    ) : (
                      '+ Add'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {results.length === 0 && !isSearching && query && (
          <div className="text-center py-8 text-gray-400 text-sm border-b border-gray-150 mb-8">
            No search results found. Try another search or explore categories below.
          </div>
        )}

        {/* Categories of Genres Section */}
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-display font-black text-black uppercase tracking-wider">
                Recommendations
              </h4>
            </div>
            
            <button
              onClick={() => shuffleCategory(activeCategory)}
              disabled={isRotating || isFetchingRecs}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-black font-bold text-xs uppercase tracking-wider rounded-full border border-gray-200 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isRotating ? 'animate-spin text-[#ff0000]' : ''}`} />
              <span>Shuffle Selection</span>
            </button>
          </div>

          {/* Genre Tabs Selector */}
          <div className="flex flex-wrap gap-2 py-2">
            {GENRE_DATA.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`py-1.5 px-4 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${
                  activeCategory === cat.id
                    ? 'border-[#ff0000] bg-[#ff0000] text-white shadow-sm hover:bg-[#cc0000]'
                    : 'border-black bg-black text-white hover:bg-gray-900 shadow-sm'
                }`}
              >
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          {/* 5 columns x 5 rows grid (exact 25 cards) */}
          {isFetchingRecs ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 pb-8">
              {Array.from({ length: 15 }).map((_, index) => (
                <div key={index} className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 animate-pulse flex flex-col justify-between aspect-[4/5]">
                  <div className="aspect-video w-full rounded-lg bg-gray-200 mb-2 shrink-0 animate-pulse" />
                  <div className="space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="h-3 bg-gray-200 rounded w-5/6 mb-1.5 animate-pulse" />
                      <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
                    </div>
                    <div className="flex items-center justify-between gap-1 mt-auto pt-2">
                      <div className="h-2 bg-gray-200 rounded w-1/2 animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div 
              layout 
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 pb-8"
            >
              {suggestedSongs.map((song, idx) => (
                <motion.div
                  key={`${song.videoId}-${idx}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25, delay: Math.min(idx * 0.015, 0.2) }}
                  className={`flex flex-col justify-between p-2.5 rounded-xl border transition-all cursor-pointer group ${
                    addingMap[song.videoId] === 'success'
                      ? 'bg-green-50 border-green-300 hover:border-green-400 font-medium'
                      : 'bg-gray-50 border-gray-100 hover:border-[#ff0000]/40 hover:bg-white hover:shadow-md'
                  }`}
                  onClick={() => handleAdd(song)}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black mb-2 shrink-0">
                    <img 
                      src={song.thumbnail} 
                      alt={song.title} 
                      className="w-full h-full object-cover opacity-75 group-hover:opacity-100 transition-opacity" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 text-[9px] rounded text-white font-mono leading-none">
                      {song.duration}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col justify-between min-w-0 flex-1">
                    <p className={`text-xs font-bold leading-tight mb-1 line-clamp-2 transition-colors ${
                      addingMap[song.videoId] === 'success'
                        ? 'text-green-800'
                        : 'text-gray-950 group-hover:text-[#ff0000]'
                    }`} title={song.title}>
                      {song.title}
                    </p>
                    <div className="flex items-center justify-between gap-1 mt-auto pt-1">
                      <span className="text-[9px] text-gray-400 truncate max-w-[65%]">
                        {song.channel}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAdd(song); }}
                        disabled={addingMap[song.videoId] === 'loading' || addingMap[song.videoId] === 'success'}
                        className={`p-1 px-1.5 rounded-md text-[9px] uppercase font-bold tracking-wider transition-colors ${
                          addingMap[song.videoId] === 'success'
                            ? 'bg-green-600 text-white cursor-default shadow-sm'
                            : addingMap[song.videoId] === 'loading'
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-[#ff0000]/10 text-[#ff0000] hover:bg-[#ff0000] hover:text-white'
                        }`}
                        title={addingMap[song.videoId] === 'success' ? "Added to queue" : "Add to queue"}
                      >
                        {addingMap[song.videoId] === 'success' ? (
                          '✓ Added'
                        ) : addingMap[song.videoId] === 'loading' ? (
                          '...'
                        ) : (
                          '+ Add'
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
