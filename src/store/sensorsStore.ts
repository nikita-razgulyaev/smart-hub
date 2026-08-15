import { create } from "zustand";
import { SensorType } from "../types";
import { SENSORS_SEED } from "../data/seedData";

interface SensorReading {
    value: number;
    updatedAt: string;
}

interface SensorAlert {
    sensorId: string;
    name: string;
    value: number;
    unit: string;
    message: string;
}

interface SensorsState {
    latest: Record<SensorType, SensorReading | undefined>;
    alerts: SensorAlert[];
    setReading: (type: SensorType, value: number) => void;
    pushAlert: (alert: SensorAlert) => void;
    dismissAlert: (index: number) => void;
}

const INITIAL_VALUES: Partial<Record<SensorType, number>> = {
    TEMPERATURE: 24,
    HUMIDITY: 47,
};

function initialReadings(): Record<SensorType, SensorReading | undefined> {
    const now = new Date().toISOString();
    const readings = {} as Record<SensorType, SensorReading | undefined>;
    for (const sensor of SENSORS_SEED) {
        const value =
            INITIAL_VALUES[sensor.type] ??
            (sensor.minValue + sensor.maxValue) / 2;
        readings[sensor.type] = { value, updatedAt: now };
    }
    return readings;
}

export const useSensorsStore = create<SensorsState>((set, get) => ({
    latest: initialReadings(),
    alerts: [],

    setReading: (type, value) => {
        set({
            latest: {
                ...get().latest,
                [type]: { value, updatedAt: new Date().toISOString() },
            },
        });
    },

    pushAlert: (alert) => set((s) => ({ alerts: [...s.alerts, alert] })),
    dismissAlert: (index) =>
        set((s) => ({ alerts: s.alerts.filter((_, i) => i !== index) })),
}));
