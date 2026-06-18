import React, { useState, useEffect, useRef } from 'react';
import { collection, doc, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAppStore } from '../store';
import { LiveComment, LiveReaction } from '../lib/types';
import { Send, MessageSquare, Flame, Heart, HeartOff, Sparkles, ThumbsUp, PartyPopper, Smile, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Maps reaction identifier to actual render properties
export const REACTION_TYPES: Record<string, { emoji: string; label: string; color: string; bg: string }> = {
  love: { emoji: '❤️', label: 'Love', color: 'text-red-500', bg: 'bg-red-50 hover:bg-red-100 border-red-200 text-red-600' },
  fire: { emoji: '🔥', label: 'Fire', color: 'text-orange-500', bg: 'bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-600' },
  haha: { emoji: '😂', label: 'Haha', color: 'text-yellow-500', bg: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-600' },
  party: { emoji: '🎉', label: 'Party', color: 'text-purple-500', bg: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-600' },
  whoa: { emoji: '😮', label: 'Whoa', color: 'text-yellow-500', bg: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-600' },
  clap: { emoji: '👏', label: 'Clap', color: 'text-indigo-500', bg: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-600' }
};

interface LiveInteractionsPanelProps {
  roomId: string;
  isSidebar?: boolean;
}

/**
 * 1. LIVE INTERACTIVE PANEL (Sidebar & Mobile)
 * Allows guests/host to view comments, post new comments, and trigger floating reactions.
 */
export function LiveInteractionsPanel({ roomId, isSidebar = false }: LiveInteractionsPanelProps) {
  const { nickname, isHost } = useAppStore();
  const [comments, setComments] = useState<LiveComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync Live Comments
  useEffect(() => {
    if (!roomId) return;
    const cQuery = query(
      collection(db, `rooms/${roomId}/comments`),
      orderBy('createdAt', 'asc'),
      limit(50)
    );

    const unsub = onSnapshot(cQuery, (snapshot) => {
      const list: LiveComment[] = [];
      snapshot.forEach((snap) => {
        list.push({ id: snap.id, ...snap.data() } as LiveComment);
      });
      setComments(list);
    });

    return () => unsub();
  }, [roomId]);

  // Autoscroll comments when new ones arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || sending) return;

    setSending(true);
    try {
      const cCollection = collection(db, `rooms/${roomId}/comments`);
      await addDoc(cCollection, {
        senderName: nickname || 'Anonymous',
        text: newComment.trim(),
        createdAt: Date.now(),
        role: isHost ? 'host' : 'guest'
      });
      setNewComment('');
    } catch (err) {
      console.error("Error sending live comment:", err);
    } finally {
      setSending(false);
    }
  };

  const handleSendReaction = async (type: string) => {
    try {
      const rCollection = collection(db, `rooms/${roomId}/reactions`);
      await addDoc(rCollection, {
        type,
        senderName: nickname || 'Anonymous',
        createdAt: Date.now(),
        xOffset: Math.floor(Math.random() * 80) + 10 // random percentage 10% - 90%
      });
    } catch (err) {
      console.error("Error triggering reaction:", err);
    }
  };

  return (
    <div className={`flex flex-col bg-white overflow-hidden ${
      isSidebar ? 'flex-1 h-full w-full border-0 rounded-none shadow-none text-black' : 'h-[320px] sm:h-[400px] border border-gray-205 rounded-3xl shadow-sm text-black border-gray-200'
    }`}>
      {/* Panel Header */}
      {!isSidebar && (
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-black">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#ff0000] animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest">Live Room Chat</span>
          </div>
          <span className="text-[10px] font-bold text-gray-400 bg-gray-200/50 px-2 py-0.5 rounded-full">
            {comments.length} msgs
          </span>
        </div>
      )}

      {/* Comment Log */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-50/30">
        {comments.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 gap-2 p-4">
            <MessageSquare className="w-8 h-8 opacity-40 text-gray-500" />
            <p className="text-xs font-bold uppercase tracking-wider">No comments yet</p>
            <p className="text-[11px] opacity-75">Send the first shoutout to the singer!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="text-xs leading-relaxed flex flex-col bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-1.5 mb-1">
                <span className={`font-black tracking-tight ${comment.role === 'host' ? 'text-[#ff0000]' : 'text-gray-950'}`}>
                  {comment.senderName}
                </span>
                {comment.role === 'host' && (
                  <span className="px-1 bg-[#ff0000]/10 text-[#ff0000] text-[8px] uppercase font-extrabold rounded">
                    Host
                  </span>
                )}
                <span className="text-[9px] text-gray-400 ml-auto">
                  {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <p className="text-gray-700 font-sans break-words">{comment.text}</p>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Floating Reactions Bar */}
      <div className="px-4 py-2 border-t border-gray-100 bg-white flex flex-col gap-1.5 shrink-0">
        <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Send Live Reaction:</p>
        <div className="flex justify-between gap-1">
          {Object.entries(REACTION_TYPES).map(([type, item]) => (
            <button
              key={type}
              onClick={() => handleSendReaction(type)}
              className={`flex-1 py-1.5 rounded-xl border flex items-center justify-center text-lg transition-transform hover:scale-125 active:scale-95 shadow-sm ${item.bg}`}
              title={`React with ${item.label}`}
            >
              {item.emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Comment Input */}
      <form onSubmit={handleSendComment} className="p-3 border-t border-gray-200 bg-gray-50 flex gap-2 shrink-0">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Say something friendly..."
          maxLength={150}
          className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs placeholder-gray-400 focus:outline-none focus:border-[#ff0000] text-black"
        />
        <button
          type="submit"
          disabled={!newComment.trim() || sending}
          className="p-1 px-3 bg-[#ff0000] hover:bg-[#cc0000] text-white rounded-xl transition-colors disabled:opacity-40 flex items-center justify-center"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}


/**
 * 2. LIVE OVERLAY (Floats comments and emojis directly OVER the YouTube Player)
 * Shows up only on Display Devices (or screens displaying YouTube player).
 */
export function LivePlayerOverlay({ roomId }: { roomId: string }) {
  const [activeReactions, setActiveReactions] = useState<Array<LiveReaction & { localId: string; speedMultiplier: number }>>([]);
  const [comments, setComments] = useState<LiveComment[]>([]);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const mountTime = useRef(Date.now());

  // Log of reaction IDs seen to avoid duplicating on init
  const processedReactionIds = useRef<Set<string>>(new Set());

  // 1. Listen to reactions in real-time
  useEffect(() => {
    if (!roomId) return;

    // Fetch reactions in real-time, order by creation
    const rQuery = query(
      collection(db, `rooms/${roomId}/reactions`),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubReactions = onSnapshot(rQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const rData = { id: change.doc.id, ...change.doc.data() } as LiveReaction;
          
          // Only show reactions created AFTER component mounts and not already processed
          if (rData.createdAt >= mountTime.current - 5000 && !processedReactionIds.current.has(rData.id)) {
            processedReactionIds.current.add(rData.id);

            // Add reaction with a unique local ID and custom animation qualities
            const localId = `${rData.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
            const speedMultiplier = 0.8 + Math.random() * 0.4; // 0.8x to 1.2x

            setActiveReactions((prev) => [
              ...prev,
              { ...rData, localId, speedMultiplier }
            ]);

            // Automatically purge from React state after animation completes (5 seconds) to save DOM
            setTimeout(() => {
              setActiveReactions((prev) => prev.filter((r) => r.localId !== localId));
            }, 5000);
          }
        }
      });
    });

    return () => unsubReactions();
  }, [roomId]);

  // 2. Listen to comments in real-time
  useEffect(() => {
    if (!roomId) return;

    // Fetch comments in real-time, order by creation
    const cQuery = query(
      collection(db, `rooms/${roomId}/comments`),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const processedCommentIds = new Set<string>();

    const unsubComments = onSnapshot(cQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const cData = { id: change.doc.id, ...change.doc.data() } as LiveComment;
          
          // Only show comments created within the last 10 seconds
          const age = Date.now() - cData.createdAt;
          if (age < 10000 && !processedCommentIds.has(cData.id)) {
            processedCommentIds.add(cData.id);

            // Add to state
            setComments((prev) => {
              if (prev.some((c) => c.id === cData.id)) return prev;
              return [...prev, cData];
            });

            // Automatically clean up after the 10 seconds limit expires from creation
            const displayDuration = 10000 - age;
            setTimeout(() => {
              setComments((prev) => prev.filter((c) => c.id !== cData.id));
            }, displayDuration);
          }
        }
      });
    });

    return () => unsubComments();
  }, [roomId]);

  // Autoscroll comments overlays
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  return (
    <div className="absolute inset-0 pointer-events-none z-15 overflow-hidden select-none">
      {/* Floating Reaction Bubble Emitters */}
      <div className="absolute inset-x-0 bottom-0 h-[400px]">
        <AnimatePresence>
          {activeReactions.map((reaction) => {
            const definition = REACTION_TYPES[reaction.type] || REACTION_TYPES.love;
            
            return (
              <motion.div
                key={reaction.localId}
                initial={{ 
                  x: `${reaction.xOffset}%`, 
                  y: '100%', 
                  opacity: 0, 
                  scale: 0.4,
                  rotate: 0 
                }}
                animate={{
                  y: [-25, -150, -320, -450],
                  x: [
                    `${reaction.xOffset}%`, 
                    `${reaction.xOffset + (Math.random() * 10 - 5)}%`, 
                    `${reaction.xOffset + (Math.random() * 20 - 10)}%`, 
                    `${reaction.xOffset + (Math.random() * 30 - 15)}%`
                  ],
                  opacity: [0, 1, 1, 0.4, 0],
                  scale: [0.5, 1.4, 1.1, 1.2, 0.8],
                  rotate: [0, (Math.random() * 30 - 15), (Math.random() * 60 - 30), (Math.random() * 20 - 10)]
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 4 * reaction.speedMultiplier,
                  ease: [0.1, 0.6, 0.3, 1], // customized spring-like physics deceleration curve
                }}
                className="absolute bottom-0 text-3xl font-display flex flex-col items-center select-none"
                style={{ originX: 0.5, originY: 0.5 }}
              >
                {/* Visual Bubble with delicate drop shadow & organic tilt */}
                <div className="filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)] relative">
                  {definition.emoji}
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black/80 text-[7px] text-white px-1 py-[1px] rounded font-bold scale-75 border border-white/15 opacity-80 max-w-[40px] truncate">
                    {reaction.senderName}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Sleek Live Comments Overlay overlaying bottom-left of player */}
      <div className="absolute bottom-4 left-4 max-w-[380px] sm:max-w-[480px] max-h-[280px] flex flex-col pointer-events-none z-20">
        <div className="overflow-y-auto no-scrollbar space-y-2 p-2 flex flex-col justify-end">
          <AnimatePresence initial={false}>
            {comments.slice(-5).map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, x: -30, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                transition={{ type: 'spring', damping: 15, stiffness: 120 }}
                className="bg-black/65 backdrop-blur-md rounded-2xl p-2.5 px-4 border border-white/15 flex gap-2 items-start shrink-0 shadow-lg"
              >
                <div className="flex-1 min-w-0">
                  <span className={`inline-flex items-center gap-1.5 font-extrabold text-xs sm:text-sm leading-tight ${
                    comment.role === 'host' ? 'text-red-400' : 'text-sky-300'
                  }`}>
                    {comment.senderName}
                    {comment.role === 'host' && (
                      <span className="px-1.5 py-0.5 bg-red-500/20 text-red-300 text-[8px] tracking-wide uppercase font-extrabold rounded leading-none">
                        Host
                      </span>
                    )}
                  </span>
                  <p className="text-xs sm:text-sm md:text-base text-white/95 leading-normal mt-1 break-words font-sans">
                    {comment.text}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={commentsEndRef} />
        </div>
      </div>
    </div>
  );
}
