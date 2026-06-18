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
    let partsInitial = true;
    const partUnsub = onSnapshot(collection(db, `rooms/${roomId}/participants`), (snapshot) => {
      const parts: Participant[] = [];
      snapshot.forEach(d => parts.push(d.data() as Participant));
      setParticipants(parts);

      if (!partsInitial) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const part = change.doc.data() as Participant;
            // Only toast if it's someone else joining recently
            if (part.id !== userId && Date.now() - (part.joinedAt || 0) < 10000) {
              useAppStore.getState().addToast(`${part.nickname} joined the room`, 'info');
            }
          }
        });
      }
      partsInitial = false;
    });

    // Sync Queue
    let queueInitial = true;
    const qQuery = query(collection(db, `rooms/${roomId}/queue`), orderBy('addedAt', 'asc'));
    const queueUnsub = onSnapshot(qQuery, (snapshot) => {
      const q: QueueItem[] = [];
      snapshot.forEach(d => q.push(d.data() as QueueItem));
      setQueue(q);

      if (!queueInitial) {
         snapshot.docChanges().forEach((change) => {
           if (change.type === 'added') {
             const data = change.doc.data() as QueueItem;
             // Show toast
             useAppStore.getState().addToast(`${data.addedBy} added "${data.title}"`, 'success');
           }
         });
      }
      queueInitial = false;
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
