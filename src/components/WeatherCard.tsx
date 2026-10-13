import { useEffect, useState } from 'react';
import { getWeather } from '../api/external';
import { WeatherInfo } from '../types';
import { weatherIconName } from '../utils/weatherIcon';
import { Icon } from './ui/Icon';

export function WeatherCard() {
  const [city, setCity] = useState('Вологда');
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(city);
  const [error, setError] = useState<string | null>(null);

  const search = async (nextCity: string) => {
    setError(null);
    try {
      const data = await getWeather(nextCity);
      setWeather(data);
      setCity(nextCity);
    } catch {
      setError('Не удалось получить погоду');
    }
  };

  // Загружаем погоду один раз при монтировании. cancelled защищает от гонки
  // состояний, если React (в StrictMode) смонтирует компонент дважды.
  useEffect(() => {
    let cancelled = false;
    getWeather(city)
      .then((data) => {
        if (!cancelled) {
          setWeather(data);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) setError('Не удалось получить погоду');
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const iconName = weather?.temp !== undefined && weather.temp < -2 && weather.code === undefined ? 'cloudSnow' : weatherIconName(weather?.code);

  return (
    <div className="card weather">
      <div className="weather__top">
        <div>
          <div className="text-label">Погода</div>
          <div className="weather__temp">{weather ? `${weather.temp}°` : '—°'}</div>
        </div>
        <span className="weather__icon">
          <Icon name={iconName} size={24} />
        </span>
      </div>

      {error && <div className="text-label weather__error">{error}</div>}
      {weather?.description && <div className="text-label">{weather.description}</div>}

      <div className="weather__city">
        {!editing && <span>{city}</span>}
        {editing && (
          <input
            className="weather__input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                search(draft);
                setEditing(false);
              }
            }}
            autoFocus
            placeholder="Город"
            aria-label="Город"
          />
        )}
        <button
          type="button"
          className="weather__edit"
          onClick={() => {
            if (editing) search(draft);
            setEditing(!editing);
            setDraft(city);
          }}
        >
          {editing ? 'готово' : 'изменить'}
        </button>
      </div>
    </div>
  );
}
