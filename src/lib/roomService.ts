import { collection, doc, query, where, getDocs, setDoc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Room, Participant, PlaybackState } from './types';
import { generateRoomCode } from './utils';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function createRoom(hostId: string): Promise<string> {
  let roomCode = generateRoomCode();
  
  // Basic collision check
  let isUnique = false;
  while (!isUnique) {
    try {
      const q = query(collection(db, 'rooms'), where('roomCode', '==', roomCode));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        isUnique = true;
      } else {
        roomCode = generateRoomCode();
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'rooms');
    }
  }

  const roomRef = doc(collection(db, 'rooms'));
  const newRoom: Room = {
    id: roomRef.id,
    roomCode,
    hostId,
    roomName: `Karaoke Room ${roomCode}`,
    createdAt: Date.now(),
    status: 'active',
    settings: {
      autoPlayNext: true,
      loopQueue: false,
      queueLimit: 50,
      allowGuestsToAdd: true,
      allowDuplicates: false,
      lockRoom: false,
      searchKaraokeOnly: true,
    }
  };

  try {
    await setDoc(roomRef, newRoom);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `rooms/${roomRef.id}`);
  }

  // Initialize playback state
  const playbackRef = doc(db, `rooms/${roomRef.id}/playbackState`, 'current');
  const initialPlayback: PlaybackState = {
    currentVideoId: null,
    currentPlaybackTime: 0,
    isPlaying: false,
    updatedAt: Date.now()
  };
  try {
    await setDoc(playbackRef, initialPlayback);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `rooms/${roomRef.id}/playbackState/current`);
  }

  return roomRef.id;
}

export async function getRoomByCode(code: string): Promise<Room | null> {
  try {
    const q = query(collection(db, 'rooms'), where('roomCode', '==', code), where('status', '==', 'active'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as Room;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'rooms');
    return null;
  }
}

export async function joinRoomParticipant(roomId: string, userId: string, nickname: string, isHost: boolean) {
  const participantRef = doc(db, `rooms/${roomId}/participants`, userId);
  const participant: Participant = {
    id: userId,
    nickname,
    role: isHost ? 'host' : 'guest',
    joinedAt: Date.now(),
    lastSeen: Date.now(),
  };
  try {
    await setDoc(participantRef, participant);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `rooms/${roomId}/participants/${userId}`);
  }
}
