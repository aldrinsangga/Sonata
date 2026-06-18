export interface Room {
  id: string; // Document ID
  roomCode: string;
  hostId: string; // The ID of the host (generated locally and stored in localStorage)
  roomName: string;
  createdAt: number;
  status: 'active' | 'closed';
  settings: {
    autoPlayNext: boolean;
    loopQueue: boolean;
    queueLimit: number;
    allowGuestsToAdd: boolean;
    allowDuplicates: boolean;
    lockRoom: boolean;
    searchKaraokeOnly: boolean;
  };
}

export interface Participant {
  id: string;
  nickname: string;
  role: 'host' | 'guest';
  joinedAt: number;
  lastSeen: number;
}

export interface QueueItem {
  id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  channel: string;
  duration: string;
  seconds: number;
  addedBy: string;
  status: 'pending' | 'playing' | 'played';
  createdAt: number;
}

export interface PlaybackState {
  currentVideoId: string | null;
  currentPlaybackTime: number;
  isPlaying: boolean;
  updatedAt: number;
}

export interface LiveComment {
  id: string;
  senderName: string;
  text: string;
  createdAt: number;
  role: 'host' | 'guest';
}

export interface LiveReaction {
  id: string;
  type: string; // e.g. "love" | "fire" | "like" | "party" | "whoa" | "oops"
  senderName: string;
  createdAt: number;
  xOffset: number; // 0-100 percentage
}
