import { create } from 'zustand';
import { Device } from '../types';
import { DEVICES } from '../data/seedData';

interface DevicesState {
  byId: Record<string, Device>;
  toggle: (id: string) => void;
  setState: (id: string, patch: { isOn?: boolean; state?: Record<string, unknown> }) => void;
}

const STORAGE_KEY = 'smart-hub-devices';

function loadInitial(): Record<string, Device> {
  const byId: Record<string, Device> = {};
  for (const d of DEVICES) byId[d.id] = d;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Record<string, Device>;
      for (const id of Object.keys(parsed)) {
        if (byId[id]) byId[id] = { ...byId[id], ...parsed[id] };
      }
    }
  } catch {
    // повреждённые данные в localStorage — просто игнорируем и стартуем с сида
  }

  return byId;
}

function persist(byId: Record<string, Device>) {
  const minimal: Record<string, Pick<Device, 'isOn' | 'state'>> = {};
  for (const id of Object.keys(byId)) {
    minimal[id] = { isOn: byId[id].isOn, state: byId[id].state };
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(minimal));
}

export const useDevicesStore = create<DevicesState>((set, get) => ({
  byId: loadInitial(),

  toggle: (id) => {
    const device = get().byId[id];
    if (!device) return;
    const next = { ...device, isOn: !device.isOn };
    const byId = { ...get().byId, [id]: next };
    set({ byId });
    persist(byId);
  },

  setState: (id, patch) => {
    const device = get().byId[id];
    if (!device) return;
    const next: Device = {
      ...device,
      isOn: patch.isOn ?? device.isOn,
      state: patch.state ? { ...device.state, ...patch.state } : device.state,
    };
    const byId = { ...get().byId, [id]: next };
    set({ byId });
    persist(byId);
  },
}));
