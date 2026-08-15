import axios from 'axios';
import { WeatherInfo, CurrencyRates, HistoryFact, DayStatus } from '../types';

/**
 * Все функции в этом файле — прямые вызовы бесплатных публичных API из
 * браузера. Backend больше не нужен: раньше он просто проксировал эти же
 * запросы. Каждая функция сохраняет ту же цепочку "основной → резервный →
 * локальный fallback", что была на бэкенде, чтобы сбой одного провайдера не
 * ронял виджет.
 */

const WMO_CODES: Record<number, string> = {
  0: 'ясно',
  1: 'преимущественно ясно',
  2: 'переменная облачность',
  3: 'пасмурно',
  45: 'туман',
  48: 'изморозь',
  51: 'лёгкая морось',
  53: 'морось',
  55: 'сильная морось',
  61: 'небольшой дождь',
  63: 'дождь',
  65: 'сильный дождь',
  71: 'небольшой снег',
  73: 'снег',
  75: 'сильный снег',
  80: 'ливень',
  81: 'сильный ливень',
  82: 'очень сильный ливень',
  95: 'гроза',
};

export async function getWeather(city: string): Promise<WeatherInfo> {
  try {
    return await fetchWeather(city);
  } catch {
    // одна попытка повторить — открытые API иногда отвечают с перебоями
    return await fetchWeather(city);
  }
}

async function fetchWeather(city: string): Promise<WeatherInfo> {
  const geo = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
    params: { name: city, count: 1, language: 'ru', format: 'json' },
    timeout: 8000,
  });

  const place = geo.data?.results?.[0];
  if (!place) throw new Error(`Город "${city}" не найден`);

  const { data } = await axios.get('https://api.open-meteo.com/v1/forecast', {
    params: {
      latitude: place.latitude,
      longitude: place.longitude,
      current: 'temperature_2m,weather_code',
      timezone: 'auto',
    },
    timeout: 8000,
  });

  const code = data.current?.weather_code as number;

  return {
    city: place.name,
    temp: Math.round(data.current?.temperature_2m),
    description: WMO_CODES[code] ?? '',
    source: 'open-meteo',
  };
}

const round2 = (n: number) => Math.round(n * 100) / 100;

async function fetchCbrRates(): Promise<CurrencyRates> {
  const { data } = await axios.get('https://www.cbr-xml-daily.ru/daily_json.js', { timeout: 5000 });
  return {
    usd: round2(data.Valute.USD.Value),
    eur: round2(data.Valute.EUR.Value),
    cny: round2(data.Valute.CNY.Value),
    usdDelta: round2(data.Valute.USD.Value - data.Valute.USD.Previous),
    eurDelta: round2(data.Valute.EUR.Value - data.Valute.EUR.Previous),
    cnyDelta: round2(data.Valute.CNY.Value - data.Valute.CNY.Previous),
    date: data.Date,
    source: 'cbr-xml-daily',
  };
}

async function fetchCurrencyApiRates(): Promise<CurrencyRates> {
  const { data } = await axios.get(
    'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/rub.min.json',
    { timeout: 5000 },
  );
  const rub = data.rub;
  return {
    usd: round2(1 / rub.usd),
    eur: round2(1 / rub.eur),
    cny: round2(1 / rub.cny),
    usdDelta: 0,
    eurDelta: 0,
    cnyDelta: 0,
    date: data.date,
    source: 'currency-api',
  };
}

export async function getCurrencyRates(): Promise<CurrencyRates> {
  try {
    return await fetchCbrRates();
  } catch {
    return await fetchCurrencyApiRates();
  }
}

function fallbackHistoryFact(): HistoryFact {
  return {
    year: '2008',
    text: 'В Пекине открылись XXIX Олимпийские игры — церемонию начали в 8 вечера 8-го числа 8-го месяца, чтобы дата выглядела как «08.08.08».',
  };
}

export async function getHistoryFact(): Promise<HistoryFact> {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const { data } = await axios.get(
      `https://ru.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`,
      { timeout: 5000 },
    );
    const events = data.events ?? [];
    if (events.length === 0) return fallbackHistoryFact();
    const event = events[Math.floor(Math.random() * events.length)];
    return { year: String(event.year), text: event.text };
  } catch {
    return fallbackHistoryFact();
  }
}

const ISDAYOFF_CODES: Record<string, { isDayOff: boolean; label: string }> = {
  '0': { isDayOff: false, label: 'Рабочий день' },
  '1': { isDayOff: true, label: 'Выходной' },
  '2': { isDayOff: false, label: 'Сокращённый рабочий день' },
  '4': { isDayOff: true, label: 'Праздничный день (перенос)' },
};

async function fetchIsDayOff(): Promise<DayStatus> {
  const today = new Date();
  const { data } = await axios.get('https://isdayoff.ru/api/getdata', {
    params: {
      year: today.getFullYear(),
      month: String(today.getMonth() + 1).padStart(2, '0'),
      day: String(today.getDate()).padStart(2, '0'),
      cc: 'ru',
    },
    timeout: 5000,
  });
  const code = String(data).trim();
  const mapped = ISDAYOFF_CODES[code];
  if (!mapped) throw new Error(`Неожиданный ответ isdayoff.ru: "${code}"`);
  return { ...mapped, source: 'isdayoff.ru' };
}

async function fetchNagerDate(country: string): Promise<DayStatus> {
  const year = new Date().getFullYear();
  const { data } = await axios.get(
    `https://date.nager.at/api/v3/PublicHolidays/${year}/${country.toUpperCase()}`,
    { timeout: 5000 },
  );
  const todayStr = new Date().toISOString().slice(0, 10);
  const holiday = (data as Array<{ date: string; localName: string }>).find((h) => h.date === todayStr);
  return holiday
    ? { isDayOff: true, label: holiday.localName, source: 'nager.date' }
    : { isDayOff: false, label: 'Рабочий день', source: 'nager.date' };
}

export interface NewsFeedItem {
  title: string;
  link: string;
  image?: string;
}

export async function getNewsFeed(): Promise<NewsFeedItem[]> {
  const feeds = ['https://habr.com/ru/rss/all/all/', 'https://lenta.ru/rss'];
  for (const feed of feeds) {
    try {
      const { data } = await axios.get('https://api.rss2json.com/v1/api.json', {
        params: { rss_url: feed },
        timeout: 5000,
      });
      const items =
        (data?.items as Array<{ title?: string; link?: string; thumbnail?: string; enclosure?: { link?: string }; content?: string }>) ?? [];
      const parsed = items
        .filter((item): item is typeof item & { title: string; link: string } => Boolean(item.title && item.link))
        .map((item) => ({
          title: item.title,
          link: item.link,
          image: item.thumbnail || item.enclosure?.link || item.content?.match(/<img[^>]+src="([^"]+)"/)?.[1],
        }));
      if (parsed.length > 0) return parsed;
    } catch {
      // пробуем следующую ленту
    }
  }
  return [];
}

export async function getDayStatus(country = 'RU'): Promise<DayStatus> {
  if (country.toUpperCase() === 'RU') {
    try {
      return await fetchIsDayOff();
    } catch {
      // переключаемся на резервный источник ниже
    }
  }
  try {
    return await fetchNagerDate(country);
  } catch {
    return { isDayOff: false, label: 'Рабочий день', source: 'fallback' };
  }
}
