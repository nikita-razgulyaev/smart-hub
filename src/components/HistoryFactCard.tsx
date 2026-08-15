import { useEffect, useState } from 'react';
import { getHistoryFact } from '../api/external';
import { HistoryFact } from '../types';

export function HistoryFactCard() {
  const [fact, setFact] = useState<HistoryFact | null>(null);

  useEffect(() => {
    getHistoryFact()
      .then(setFact)
      .catch(() => setFact(null));
  }, []);

  return (
    <div className="card event-card">
      <div className="label">Сегодня в истории</div>
      {fact ? `${fact.year} год: ${fact.text}` : 'Загрузка…'}
    </div>
  );
}
