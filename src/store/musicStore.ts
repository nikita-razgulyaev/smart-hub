import { create } from 'zustand';
import { MUSIC_TRACKS, INITIAL_PLAYER_STATE } from '../data/seedData';

interface PlayerState {
  trackId: string;
  positionSec: number;
  isPlaying: boolean;
}

interface MusicState {
  playerByRoom: Record<string, PlayerState>;
  tick: () => void;
  play: (roomId: string) => void;
  pause: (roomId: string) => void;
  next: (roomId: string) => void;
  prev: (roomId: string) => void;
}

function trackDuration(trackId: string): number {
  return MUSIC_TRACKS.find((t) => t.id === trackId)?.durationSec ?? 0;
}

function shiftTrack(trackId: string, delta: number): string {
  const index = MUSIC_TRACKS.findIndex((t) => t.id === trackId);
  const nextIndex = (index + delta + MUSIC_TRACKS.length) % MUSIC_TRACKS.length;
  return MUSIC_TRACKS[nextIndex].id;
}

export const useMusicStore = create<MusicState>((set, get) => ({
  playerByRoom: {
    [INITIAL_PLAYER_STATE.roomId]: {
      trackId: INITIAL_PLAYER_STATE.trackId,
      positionSec: INITIAL_PLAYER_STATE.positionSec,
      isPlaying: INITIAL_PLAYER_STATE.isPlaying,
    },
  },

  // Вызывается раз в секунду из useSimulation — двигает позицию воспроизведения
  // и переключает трек по окончании, как это раньше делал MusicGateway.
  tick: () => {
    const byRoom = { ...get().playerByRoom };
    for (const roomId of Object.keys(byRoom)) {
      const player = byRoom[roomId];
      if (!player.isPlaying) continue;
      const duration = trackDuration(player.trackId);
      const nextPos = player.positionSec + 1;
      if (nextPos >= duration) {
        byRoom[roomId] = { ...player, trackId: shiftTrack(player.trackId, 1), positionSec: 0 };
      } else {
        byRoom[roomId] = { ...player, positionSec: nextPos };
      }
    }
    set({ playerByRoom: byRoom });
  },

  play: (roomId) => {
    const player = get().playerByRoom[roomId];
    if (!player) return;
    set({ playerByRoom: { ...get().playerByRoom, [roomId]: { ...player, isPlaying: true } } });
  },

  pause: (roomId) => {
    const player = get().playerByRoom[roomId];
    if (!player) return;
    set({ playerByRoom: { ...get().playerByRoom, [roomId]: { ...player, isPlaying: false } } });
  },

  next: (roomId) => {
    const player = get().playerByRoom[roomId];
    if (!player) return;
    set({
      playerByRoom: {
        ...get().playerByRoom,
        [roomId]: { ...player, trackId: shiftTrack(player.trackId, 1), positionSec: 0 },
      },
    });
  },

  prev: (roomId) => {
    const player = get().playerByRoom[roomId];
    if (!player) return;
    set({
      playerByRoom: {
        ...get().playerByRoom,
        [roomId]: { ...player, trackId: shiftTrack(player.trackId, -1), positionSec: 0 },
      },
    });
  },
}));
