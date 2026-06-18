import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Room, Participant, QueueItem, PlaybackState } from '../lib/types';

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'error';
}

interface AppState {
  userId: string;
  nickname: string;
  setNickname: (name: string) => void;
  isHost: boolean;
  setIsHost: (isHost: boolean) => void;
  
  // Settings
  isDisplayDevice: boolean;
  setIsDisplayDevice: (val: boolean) => void;
  autoKaraoke: boolean;
  setAutoKaraoke: (val: boolean) => void;

  // Realtime state synced from Firebase
  currentRoom: Room | null;
  setCurrentRoom: (room: Room | null) => void;
  
  participants: Participant[];
  setParticipants: (p: Participant[]) => void;
  
  queue: QueueItem[];
  setQueue: (q: QueueItem[]) => void;
  
  playbackState: PlaybackState | null;
  setPlaybackState: (p: PlaybackState | null) => void;

  // UI state
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      userId: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
      nickname: '',
      setNickname: (name) => set({ nickname: name }),
      isHost: false,
      setIsHost: (isHost) => set({ isHost }),

      isDisplayDevice: false,
      setIsDisplayDevice: (val) => set({ isDisplayDevice: val }),
      autoKaraoke: true,
      setAutoKaraoke: (val) => set({ autoKaraoke: val }),

      currentRoom: null,
      setCurrentRoom: (room) => set({ currentRoom: room }),

      participants: [],
      setParticipants: (participants) => set({ participants }),

      queue: [],
      setQueue: (queue) => set({ queue }),

      playbackState: null,
      setPlaybackState: (playbackState) => set({ playbackState }),

      toasts: [],
      addToast: (message, type = 'success') => {
        const id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
        set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
        setTimeout(() => {
          set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }));
        }, 4000); // clear after 4s
      },
      removeToast: (id) => set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) })),
    }),
    {
      name: 'sonata-storage-v1',
      partialize: (state) => ({ 
        userId: state.userId, 
        nickname: state.nickname,
        isDisplayDevice: state.isDisplayDevice,
        autoKaraoke: state.autoKaraoke
      }),
    }
  )
);
