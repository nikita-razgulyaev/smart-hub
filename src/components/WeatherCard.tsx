import { useEffect, useState } from 'react';
import { getWeather } from '../api/external';
import { WeatherInfo } from '../types';

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

  return (
    <div className="card weather-main">
      <div className="top">
        <div>
          <div className="label">Погода</div>
          <div className="temp">{weather ? `${weather.temp}°` : '—°'}</div>
        </div>
        <span style={{ fontSize: 30 }}>{weather?.temp !== undefined && weather.temp < 0 ? '❄️' : '☀️'}</span>
      </div>

      {error && (
        <div className="label" style={{ color: 'var(--down)' }}>
          {error}
        </div>
      )}
      {weather?.description && <div className="label">{weather.description}</div>}

      <div className={`city-edit${editing ? ' editing' : ''}`}>
        {!editing && <span className="val">{city}</span>}
        {editing && (
          <input
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
          />
        )}
        <span
          style={{ textDecoration: 'underline', cursor: 'pointer', opacity: 0.7 }}
          onClick={() => {
            if (editing) search(draft);
            setEditing(!editing);
            setDraft(city);
          }}
        >
          изменить
        </span>
      </div>
    </div>
  );
}
