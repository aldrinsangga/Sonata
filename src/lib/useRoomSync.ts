import { useEffect } from 'react';
import { doc, onSnapshot, collection, query, orderBy, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { useAppStore } from '../store';
import { Room, Participant, QueueItem, PlaybackState } from './types';

export function useRoomSync(roomId: string | undefined) {
  const { 
    setCurrentRoom, 
    setParticipants, 
    setQueue, 
    setPlaybackState,
    userId 
  } = useAppStore();

  useEffect(() => {
    if (!roomId) return;

    // Sync Room Date
    const roomUnsub = onSnapshot(doc(db, 'rooms', roomId), (docSnap) => {
      if (docSnap.exists()) {
        setCurrentRoom(docSnap.data() as Room);
      } else {
        setCurrentRoom(null);
      }
    });

    // Sync Participants
    const partUnsub = onSnapshot(collection(db, `rooms/${roomId}/participants`), (snapshot) => {
      const parts: Participant[] = [];
      snapshot.forEach(d => parts.push(d.data() as Participant));
      setParticipants(parts);
    });

    // Sync Queue
    const qQuery = query(collection(db, `rooms/${roomId}/queue`), orderBy('addedAt', 'asc'));
    const queueUnsub = onSnapshot(qQuery, (snapshot) => {
      const q: QueueItem[] = [];
      snapshot.forEach(d => q.push(d.data() as QueueItem));
      setQueue(q);
    });

    // Sync Playback State
    const playUnsub = onSnapshot(doc(db, `rooms/${roomId}/playbackState`, 'current'), (docSnap) => {
      if (docSnap.exists()) {
        setPlaybackState(docSnap.data() as PlaybackState);
      }
    });

    // Update lastSeen for current user periodically if they are in the participants list
    let interval: NodeJS.Timeout | null = null;
    if (userId) {
      interval = setInterval(() => {
        const userRef = doc(db, `rooms/${roomId}/participants`, userId);
        updateDoc(userRef, { lastSeen: Date.now() }).catch(() => {});
      }, 30000); // 30s is enough to be "active" while reducing writes
    }

    return () => {
      roomUnsub();
      partUnsub();
      queueUnsub();
      playUnsub();
      if (interval) clearInterval(interval);
    };
  }, [roomId, setCurrentRoom, setParticipants, setQueue, setPlaybackState, userId]);
}
