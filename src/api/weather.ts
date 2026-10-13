import axios from 'axios';
import { WeatherInfo } from '../types';

/**
 * Погода берётся из двух независимых источников ОДНОВРЕМЕННО — побеждает тот,
 * кто ответил первым. Так виджет работает, даже если один из сервисов
 * недоступен из вашей сети (например, из России без VPN), и при этом нет
 * ожидания таймаута перед переключением на запасной источник.
 *
 *  1. wttr.in     — без ключа, понимает русские названия городов.
 *  2. Open-Meteo  — без ключа, геокодинг + прогноз по координатам.
 *  3. MET Norway  — без ключа; координаты города берутся из OpenStreetMap Nominatim.
 *
 * Если не ответил ни один, причина каждого сбоя пишется в консоль браузера
 * (console.warn с префиксом [weather]) — по ней видно, что именно блокируется.
 */

const REQUEST_TIMEOUT_MS = 8000;

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

/** Коды WorldWeatherOnline (их отдаёт wttr.in), сгруппированные в ближайший код WMO для иконки. */
const WWO_TO_WMO: Record<number, number> = {
  113: 0,
  116: 2,
  119: 3,
  122: 3,
  143: 45,
  248: 45,
  260: 48,
  // морось и дождь, в том числе ледяной
  176: 61, 263: 51, 266: 51, 293: 61, 296: 61, 299: 63, 302: 63, 305: 65, 308: 65,
  311: 61, 314: 63, 353: 80, 356: 81, 359: 82,
  // снег, метель, дождь со снегом, крупа
  179: 71, 182: 71, 185: 71, 227: 71, 230: 75, 281: 51, 284: 53, 317: 71, 320: 71,
  323: 71, 326: 71, 329: 73, 332: 73, 335: 75, 338: 75, 350: 71, 362: 71, 365: 73,
  368: 71, 371: 75, 374: 71, 377: 73,
  // грозы
  200: 95, 386: 95, 389: 95, 392: 95, 395: 95,
};

export function wwoCodeToWmo(code: number): number {
  return WWO_TO_WMO[code] ?? 3;
}

interface WttrResponse {
  current_condition?: Array<{
    temp_C: string;
    weatherCode: string;
    lang_ru?: Array<{ value: string }>;
    weatherDesc?: Array<{ value: string }>;
  }>;
  nearest_area?: Array<{ areaName?: Array<{ value: string }> }>;
}

async function fetchWttr(city: string): Promise<WeatherInfo> {
  const { data } = await axios.get<WttrResponse>(`https://wttr.in/${encodeURIComponent(city)}`, {
    params: { format: 'j1', lang: 'ru' },
    timeout: REQUEST_TIMEOUT_MS,
  });

  // Для неизвестного города wttr.in отвечает обычным текстом, а не JSON.
  const current = typeof data === 'object' ? data?.current_condition?.[0] : undefined;
  if (!current) throw new Error(`Город "${city}" не найден`);

  const description = current.lang_ru?.[0]?.value ?? current.weatherDesc?.[0]?.value ?? '';

  return {
    city: data.nearest_area?.[0]?.areaName?.[0]?.value ?? city,
    temp: Math.round(Number(current.temp_C)),
    description: description.toLowerCase(),
    code: wwoCodeToWmo(Number(current.weatherCode)),
    source: 'wttr.in',
  };
}

async function fetchOpenMeteo(city: string): Promise<WeatherInfo> {
  const geo = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
    params: { name: city, count: 1, language: 'ru', format: 'json' },
    timeout: REQUEST_TIMEOUT_MS,
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
    timeout: REQUEST_TIMEOUT_MS,
  });

  const code = data.current?.weather_code as number;

  return {
    city: place.name,
    temp: Math.round(data.current?.temperature_2m),
    description: WMO_CODES[code] ?? '',
    code,
    source: 'open-meteo',
  };
}

/** Символы MET Norway (без суффикса _day/_night) → ближайший код WMO. */
export function metSymbolToWmo(symbol: string): number {
  const base = symbol.replace(/_(day|night|polartwilight)$/, '');
  if (base.includes('thunder')) return 95;
  if (base.includes('snow') || base.includes('sleet')) return base.startsWith('heavy') ? 75 : 71;
  if (base.includes('rain')) return base.startsWith('heavy') ? 65 : base.startsWith('light') ? 61 : 63;
  if (base === 'fog') return 45;
  if (base === 'clearsky') return 0;
  if (base === 'fair') return 1;
  if (base === 'partlycloudy') return 2;
  return 3;
}

async function fetchMetNo(city: string): Promise<WeatherInfo> {
  const geo = await axios.get<Array<{ lat: string; lon: string; name?: string }>>(
    'https://nominatim.openstreetmap.org/search',
    {
      params: { q: city, format: 'json', limit: 1, 'accept-language': 'ru' },
      timeout: REQUEST_TIMEOUT_MS,
    },
  );
  const place = geo.data?.[0];
  if (!place) throw new Error(`Город "${city}" не найден`);

  const { data } = await axios.get('https://api.met.no/weatherapi/locationforecast/2.0/compact', {
    params: { lat: Number(place.lat).toFixed(4), lon: Number(place.lon).toFixed(4) },
    timeout: REQUEST_TIMEOUT_MS,
  });

  const now = data?.properties?.timeseries?.[0];
  const temp = now?.data?.instant?.details?.air_temperature;
  if (typeof temp !== 'number') throw new Error('MET Norway вернул неожиданный ответ');

  const symbol: string = now?.data?.next_1_hours?.summary?.symbol_code ?? 'cloudy';
  const code = metSymbolToWmo(symbol);

  return {
    city: place.name || city,
    temp: Math.round(temp),
    description: WMO_CODES[code] ?? '',
    code,
    source: 'met.no',
  };
}

interface Provider<T> {
  name: string;
  run: () => Promise<T>;
}

function describeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response) return `HTTP ${error.response.status}`;
    if (error.code === 'ECONNABORTED') return 'таймаут';
    return 'сеть/CORS недоступны';
  }
  return error instanceof Error ? error.message : String(error);
}

/**
 * Возвращает результат первого успешно завершившегося источника. Если упали все —
 * пишет причины в консоль и отклоняется с ошибкой, где перечислены все сбои.
 */
export function firstSuccess<T>(providers: Array<Provider<T>>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const failures: string[] = [];
    providers.forEach(({ name, run }) => {
      run()
        .then(resolve)
        .catch((error) => {
          const reason = `${name}: ${describeError(error)}`;
          console.warn(`[weather] ${reason}`, error);
          failures.push(reason);
          if (failures.length === providers.length) reject(new Error(failures.join('; ')));
        });
    });
  });
}

export async function getWeather(city: string): Promise<WeatherInfo> {
  const providers: Array<Provider<WeatherInfo>> = [
    { name: 'wttr.in', run: () => fetchWttr(city) },
    { name: 'open-meteo', run: () => fetchOpenMeteo(city) },
    { name: 'met.no', run: () => fetchMetNo(city) },
  ];
  try {
    return await firstSuccess(providers);
  } catch {
    // одна повторная попытка — открытые API иногда отвечают с перебоями
    return await firstSuccess(providers);
  }
}
