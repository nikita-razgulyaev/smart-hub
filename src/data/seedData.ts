import {
    Device,
    Room,
    MusicTrack,
    EnergyReading,
    NewsArticle,
    Stock,
    Sensor,
} from "../types";

/**
 * Локальные "фабричные" данные умного дома. Раньше это был Prisma seed на
 * бэкенде — теперь backend убран, и всё живёт прямо в браузере (см.
 * store/devicesStore.ts и hooks/useSimulation.ts, которые эмулируют показания
 * датчиков/движение котировок так же, как раньше это делали Socket.IO-гейтвеи).
 */

export const ROOMS: Room[] = [
    { id: "bedroom", name: "Спальня", slug: "bedroom", order: 0, devices: [] },
    {
        id: "living-room",
        name: "Гостиная",
        slug: "living-room",
        order: 1,
        devices: [],
    },
    { id: "kitchen", name: "Кухня", slug: "kitchen", order: 2, devices: [] },
    { id: "office", name: "Кабинет", slug: "office", order: 3, devices: [] },
    { id: "garage", name: "Гараж", slug: "garage", order: 4, devices: [] },
];

// Фото комнат/улицы днём и ночью — переключаются вместе с темой оформления.
export const ROOM_IMAGES: Record<string, { day: string; night: string }> = {
    bedroom: {
        day: "/images/day-bedroom.png",
        night: "/images/night-bedroom.png",
    },
    "living-room": {
        day: "/images/day-living-room.png",
        night: "/images/night-living-room.png",
    },
    kitchen: {
        day: "/images/day-kitchen.png",
        night: "/images/night-kitchen.png",
    },
    office: { day: "/images/day-office.png", night: "/images/night-office.png" },
    garage: {
        day: "/images/day-garage.png",
        night: "/images/night-garage.png",
    },
};

export const STREET_IMAGES = {
    day: "/images/day-outside.png",
    night: "/images/night-outside.png",
};

export const DEVICES: Device[] = [
    // Улица (без привязки к комнате)
    {
        id: "dev-street-cam",
        roomId: null,
        type: "CAMERA",
        name: "Камера на улице",
        order: 0,
        isOn: true,
        state: { live: true },
    },
    {
        id: "dev-sprinkler",
        roomId: null,
        type: "TOGGLE",
        name: "Автополив",
        order: 1,
        isOn: false,
        state: {},
    },
    {
        id: "dev-street-light",
        roomId: null,
        type: "TOGGLE",
        name: "Уличное освещение",
        order: 2,
        isOn: true,
        state: {},
    },
    {
        id: "dev-motion",
        roomId: null,
        type: "TOGGLE",
        name: "Датчик движения",
        order: 3,
        isOn: true,
        state: {},
    },

    // Гостиная
    {
        id: "dev-living-cam",
        roomId: "living-room",
        type: "CAMERA",
        name: "Гостиная (камера)",
        order: 0,
        isOn: true,
        state: { live: true },
    },
    {
        id: "dev-wifi",
        roomId: "living-room",
        type: "TOGGLE",
        name: "Wi-Fi",
        order: 1,
        isOn: true,
        state: {},
    },
    {
        id: "dev-tv",
        roomId: "living-room",
        type: "TOGGLE",
        name: "TV",
        order: 2,
        isOn: false,
        state: {},
    },
    {
        id: "dev-socket",
        roomId: "living-room",
        type: "TOGGLE",
        name: "Розетка",
        order: 3,
        isOn: true,
        state: {},
    },
    {
        id: "dev-thermostat",
        roomId: "living-room",
        type: "THERMOSTAT",
        name: "Термостат",
        order: 4,
        isOn: true,
        state: { target: 25, current: 24, mode: "HEAT" },
    },
    {
        id: "dev-light",
        roomId: "living-room",
        type: "LIGHT",
        name: "Свет",
        order: 5,
        isOn: false,
        state: { brightness: 0 },
    },

    // Остальные комнаты — своя камера в каждой
    {
        id: "dev-bedroom-cam",
        roomId: "bedroom",
        type: "CAMERA",
        name: "Спальня (камера)",
        order: 0,
        isOn: true,
        state: { live: true },
    },
    {
        id: "dev-kitchen-cam",
        roomId: "kitchen",
        type: "CAMERA",
        name: "Кухня (камера)",
        order: 0,
        isOn: true,
        state: { live: true },
    },
    {
        id: "dev-office-cam",
        roomId: "office",
        type: "CAMERA",
        name: "Кабинет (камера)",
        order: 0,
        isOn: true,
        state: { live: true },
    },
    {
        id: "dev-garage-cam",
        roomId: "garage",
        type: "CAMERA",
        name: "Гараж (камера)",
        order: 0,
        isOn: true,
        state: { live: true },
    },
];

export const MUSIC_TRACKS: MusicTrack[] = [
    {
        id: "track-1",
        title: "Calm Piano",
        artist: "alex-morgan",
        audioUrl: "/audio/track-1.mp3",
        coverUrl: "/images/track-1.png",
        durationSec: 180,
        order: 0,
    },
    {
        id: "track-2",
        title: "Emotional Piano Music",
        artist: "SigmaMusicArt",
        audioUrl: "/audio/track-2.mp3",
        coverUrl: "/images/track-2.png",
        durationSec: 180,
        order: 1,
    },
    {
        id: "track-3",
        title: "soft piano music",
        artist: "Clavier-Music",
        audioUrl: "/audio/track-3.mp3",
        coverUrl: "/images/track-3.png",
        durationSec: 180,
        order: 2,
    },
];

export const INITIAL_PLAYER_STATE = {
    roomId: "living-room",
    trackId: "track-1",
    positionSec: 96,
    isPlaying: true,
};

function lastNDays(values: number[]): EnergyReading[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return values.map((kwh, i) => {
        const day = new Date(today);
        day.setDate(day.getDate() - (values.length - 1 - i));
        return { id: `energy-${i}`, day: day.toISOString(), kwh };
    });
}

export const ENERGY_READINGS: EnergyReading[] = lastNDays([
    14.2, 16.8, 12.4, 19.1, 22.6, 17.3, 15.9,
]);

export const NEWS_ARTICLES: NewsArticle[] = [
    {
        id: "news-1",
        headline: "Города переходят на энергосберегающие сети освещения",
        url: "#",
    },
    {
        id: "news-2",
        headline: "Новый стандарт умных розеток вышел на рынок",
        url: "#",
    },
    {
        id: "news-3",
        headline: "Умные термостаты экономят до 12% энергии",
        url: "#",
    },
    {
        id: "news-4",
        headline: "Как ИИ предсказывает поломки бытовой техники",
        url: "#",
    },
];

export const STOCKS_SEED: Stock[] = [
    {
        id: "stock-aapl",
        ticker: "AAPL",
        name: "Apple Inc.",
        currency: "USD",
        prices: [225.1, 226.4, 227.0, 226.2, 228.4],
        latest: 228.4,
        changePct: 0.5,
    },
    {
        id: "stock-tsla",
        ticker: "TSLA",
        name: "Tesla Inc.",
        currency: "USD",
        prices: [178.3, 180.1, 179.4, 181.0, 182.1],
        latest: 182.1,
        changePct: 0.6,
    },
    {
        id: "stock-sber",
        ticker: "SBER",
        name: "Сбербанк",
        currency: "RUB",
        prices: [300.2, 302.5, 301.8, 303.9, 305.0],
        latest: 305.0,
        changePct: 0.4,
    },
];

export const SENSORS_SEED: Sensor[] = [
    {
        id: "sensor-temp",
        type: "TEMPERATURE",
        name: "Температура",
        unit: "°",
        minValue: 15,
        maxValue: 30,
    },
    {
        id: "sensor-humidity",
        type: "HUMIDITY",
        name: "Влажность",
        unit: "%",
        minValue: 30,
        maxValue: 50,
    },
    {
        id: "sensor-air",
        type: "AIR_QUALITY",
        name: "Качество воздуха",
        unit: "",
        minValue: 0,
        maxValue: 100,
    },
];
