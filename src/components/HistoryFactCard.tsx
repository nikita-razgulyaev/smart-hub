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

  const text = fact ? `${fact.year} год: ${fact.text}` : 'Загрузка…';

  return (
    <div className="card fact">
      <div className="text-label">Сегодня в истории</div>
      <p className="fact__text" title={text}>
        {text}
      </p>
    </div>
  );
}
