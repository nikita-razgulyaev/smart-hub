import { useEffect, useState } from 'react';
import { NEWS_ARTICLES } from '../data/seedData';
import { getNewsFeed, NewsFeedItem } from '../api/external';

const ROTATE_MS = 6000;
const FADE_MS = 450;

export function NewsCard() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [feed, setFeed] = useState<NewsFeedItem[]>([]);

  useEffect(() => {
    getNewsFeed().then(setFeed);
  }, []);

  useEffect(() => {
    const total = feed.length > 0 ? feed.length : NEWS_ARTICLES.length;
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % total);
        setVisible(true);
      }, FADE_MS);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [feed.length]);

  const isReal = feed.length > 0;
  const current = isReal ? feed[index % feed.length] : NEWS_ARTICLES[index % NEWS_ARTICLES.length];
  const headline = isReal ? (current as NewsFeedItem).title : (current as (typeof NEWS_ARTICLES)[number]).headline;
  const link = isReal ? (current as NewsFeedItem).link : undefined;
  const image = isReal ? (current as NewsFeedItem).image : undefined;

  return (
    <div className="card news-card-big">
      <div className={`news-fade${visible ? ' visible' : ''}`}>
        <div className="news-img">{image ? <img src={image} alt="" /> : '📰'}</div>
        <div className="news-text">
          <div className="label">Новости</div>
          <div className="headline">{headline ?? '—'}</div>
          {link ? (
            <a href={link} target="_blank" rel="noopener noreferrer">
              Подробнее →
            </a>
          ) : (
            <span className="news-link-disabled">Подробнее →</span>
          )}
        </div>
      </div>
    </div>
  );
}
