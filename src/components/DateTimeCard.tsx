import { useEffect, useState } from 'react';
import { getDayStatus } from '../api/external';
import { DayStatus } from '../types';

export function DateTimeCard() {
  const [now, setNow] = useState(new Date());
  const [status, setStatus] = useState<DayStatus | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    getDayStatus('RU')
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);

  const time = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const date = now.toLocaleDateString('ru-RU');
  let day = now.toLocaleDateString('ru-RU', { weekday: 'long' });
  day = day.charAt(0).toUpperCase() + day.slice(1);

  return (
    <div className="card datetime-card">
      <div>
        <div className="day">{day}</div>
        <div className="date">{date}</div>
        {status && (
          <div
            className="label"
            style={{ marginTop: 6, color: status.isDayOff ? 'var(--accent-2)' : 'var(--ink-soft)' }}
          >
            {status.label}
          </div>
        )}
      </div>
      <div className="time">{time}</div>
    </div>
  );
}
