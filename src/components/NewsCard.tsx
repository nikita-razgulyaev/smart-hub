import { useEffect, useState } from 'react';
import { NEWS_ARTICLES } from '../data/seedData';
import { getNewsFeed, NewsFeedItem } from '../api/external';
import { Icon } from './ui/Icon';

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
    <div className="card card--flush news">
      <div className={`news__fade${visible ? '' : ' news__fade--hidden'}`}>
        <div className="news__media">
          {image ? <img className="news__img" src={image} alt="" /> : <Icon name="newspaper" size={32} />}
        </div>
        <div className="news__body">
          <div className="text-label">Новости</div>
          <div className="news__headline">{headline ?? '—'}</div>
          {link && (
            <a className="news__link" href={link} target="_blank" rel="noopener noreferrer">
              Подробнее →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
