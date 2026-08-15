export type SensorType = 'TEMPERATURE' | 'HUMIDITY' | 'AIR_QUALITY';

export interface Sensor {
  id: string;
  type: SensorType;
  name: string;
  unit: string;
  minValue: number;
  maxValue: number;
}

export interface WeatherInfo {
  city: string;
  temp: number;
  description: string;
  source?: 'open-meteo';
}

export interface CurrencyRates {
  usd: number;
  eur: number;
  cny: number;
  usdDelta: number;
  eurDelta: number;
  cnyDelta: number;
  date: string;
  source?: 'cbr-xml-daily' | 'currency-api';
}

export type DeviceType = 'TOGGLE' | 'LIGHT' | 'THERMOSTAT' | 'CAMERA';

export interface Device {
  id: string;
  roomId: string | null;
  type: DeviceType;
  name: string;
  order: number;
  isOn: boolean;
  state: Record<string, unknown>;
}

export interface Room {
  id: string;
  name: string;
  slug: string;
  order: number;
  devices: Device[];
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  coverUrl?: string | null;
  durationSec: number;
  order: number;
}

export interface EnergyReading {
  id: string;
  day: string;
  kwh: number;
}

export interface NewsArticle {
  id: string;
  headline: string;
  imageUrl?: string | null;
  url?: string | null;
}

export interface Stock {
  id: string;
  ticker: string;
  name: string;
  currency: string;
  prices: number[];
  latest: number;
  changePct: number;
}

export interface HistoryFact {
  year: string;
  text: string;
}

export interface DayStatus {
  isDayOff: boolean;
  label: string;
  source?: 'isdayoff.ru' | 'nager.date' | 'fallback';
}
