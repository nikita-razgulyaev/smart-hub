import { useEffect, useRef, useState } from 'react';
import { useMusicStore } from '../store/musicStore';
import { MUSIC_TRACKS } from '../data/seedData';
import { withBase } from '../utils/assetPath';
import { Icon } from './ui/Icon';
import { Slider } from './ui/Slider';

const DEFAULT_VOLUME = 0.3;
const INITIAL_FADE_START = 0.1;
const INITIAL_FADE_MS = 5000;
const TRACK_CROSSFADE_MS = 900;

function formatTime(sec: number): string {
  const mm = Math.floor(sec / 60);
  const ss = String(Math.floor(sec % 60)).padStart(2, '0');
  return `${mm}:${ss}`;
}

export function MusicPlayerCard({ roomId }: { roomId: string }) {
  const player = useMusicStore((s) => s.playerByRoom[roomId]);
  const play = useMusicStore((s) => s.play);
  const pause = useMusicStore((s) => s.pause);
  const next = useMusicStore((s) => s.next);
  const prev = useMusicStore((s) => s.prev);

  const audioRef = useRef<HTMLAudioElement>(null);
  const fadeIntervalRef = useRef<number | null>(null);
  const hasStartedRef = useRef(false);
  const resumeListenersRef = useRef<(() => void) | null>(null);

  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [coverMissing, setCoverMissing] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const prevVolumeRef = useRef(DEFAULT_VOLUME);

  const track = MUSIC_TRACKS.find((t) => t.id === player?.trackId);

  const clearFade = () => {
    if (fadeIntervalRef.current !== null) {
      window.clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
  };

  const clearResumeListeners = () => {
    if (resumeListenersRef.current) {
      resumeListenersRef.current();
      resumeListenersRef.current = null;
    }
  };

  // Плавно меняем громкость audio с from до to за durationMs (используется и
  // для разгона громкости при первом запуске, и для кроссфейда между треками).
  const fadeVolume = (audio: HTMLAudioElement, from: number, to: number, durationMs: number, onDone?: () => void) => {
    clearFade();
    audio.volume = Math.max(0, Math.min(1, from));
    const steps = Math.max(6, Math.round(durationMs / 80));
    const stepMs = durationMs / steps;
    let i = 0;
    fadeIntervalRef.current = window.setInterval(() => {
      i += 1;
      const v = from + (to - from) * (i / steps);
      audio.volume = Math.max(0, Math.min(1, v));
      if (i >= steps) {
        clearFade();
        onDone?.();
      }
    }, stepMs);
  };

  // Плавный переход между треками: сначала тихо гасим текущий трек, и только
  // затем переключаемся — без резкого обрыва звука.
  const changeTrack = (action: () => void) => {
    const audio = audioRef.current;
    if (audio && !audio.paused) {
      fadeVolume(audio, audio.volume, 0, TRACK_CROSSFADE_MS, action);
    } else {
      action();
    }
  };

  useEffect(() => {
    setPosition(0);
    setCoverMissing(false);
  }, [track?.id]);

  // Играем/ставим на паузу настоящий <audio> в соответствии со стором.
  // Браузеры блокируют автозапуск со звуком без жеста пользователя — если
  // play() отклонён, ждём первый клик/нажатие клавиши на странице и пробуем снова.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track?.audioUrl) return;

    if (!player?.isPlaying) {
      audio.pause();
      clearResumeListeners();
      return;
    }

    const startPlayback = () => {
      audio
        .play()
        .then(() => {
          if (!hasStartedRef.current) {
            hasStartedRef.current = true;
            fadeVolume(audio, INITIAL_FADE_START, volume, INITIAL_FADE_MS);
          } else {
            // Плавно въезжаем в новый трек вместо резкого включения громкости.
            fadeVolume(audio, 0, volume, TRACK_CROSSFADE_MS);
          }
          clearResumeListeners();
        })
        .catch(() => {
          if (resumeListenersRef.current) return;
          const resume = () => startPlayback();
          document.addEventListener('click', resume, { once: true });
          document.addEventListener('keydown', resume, { once: true });
          resumeListenersRef.current = () => {
            document.removeEventListener('click', resume);
            document.removeEventListener('keydown', resume);
          };
        });
    };

    startPlayback();

    return () => clearResumeListeners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player?.isPlaying, track?.audioUrl]);

  useEffect(() => () => clearFade(), []);

  const handleVolumeChange = (value: number) => {
    clearFade();
    setVolume(value);
    if (value > 0) prevVolumeRef.current = value;
    if (audioRef.current) audioRef.current.volume = value;
  };

  // Клик по иконке динамика: если звук включён — запоминаем громкость и
  // выключаем (0), если выключен — восстанавливаем сохранённое значение.
  const toggleMute = () => {
    if (volume > 0) {
      prevVolumeRef.current = volume;
      handleVolumeChange(0);
    } else {
      handleVolumeChange(prevVolumeRef.current || DEFAULT_VOLUME);
    }
  };

  // Перемотка трека через таймлайн. Пока пользователь тащит ползунок,
  // отображаем выбранную позицию, а не реальное currentTime из <audio>.
  const handleSeek = (value: number) => {
    setPosition(value);
    if (audioRef.current) audioRef.current.currentTime = value;
  };

  if (!player) return null;

  const dur = duration || track?.durationSec || 0;
  const showCover = track?.coverUrl && !coverMissing;

  return (
    <div className="card music">
      <div className="music__art">
        {showCover ? (
          <img className="music__art-img" src={withBase(track!.coverUrl!)} alt={track?.title ?? ''} onError={() => setCoverMissing(true)} />
        ) : (
          <Icon name="volume" size={22} />
        )}
      </div>
      <div className="music__info">
        <div className="music__title">{track?.title ?? '—'}</div>
        <div className="music__artist">{track?.artist}</div>
      </div>

      <div className="music__progress">
        <span className="music__time">{formatTime(position)}</span>
        <Slider
          value={Math.min(position, dur || 0)}
          max={dur || 0}
          label="Позиция в треке"
          onChange={handleSeek}
          onPointerDown={() => setIsSeeking(true)}
          onPointerUp={() => setIsSeeking(false)}
        />
        <span className="music__time music__time--end">{formatTime(dur)}</span>
      </div>

      <div className="music__bar">
        <div className="music__controls">
          <button type="button" className="music__btn" aria-label="Предыдущий трек" onClick={() => changeTrack(() => prev(roomId))}>
            <Icon name="skipBack" size={18} />
          </button>
          <button
            type="button"
            className="music__btn music__btn--play"
            aria-label={player.isPlaying ? 'Пауза' : 'Воспроизвести'}
            onClick={() => (player.isPlaying ? pause(roomId) : play(roomId))}
          >
            <Icon name={player.isPlaying ? 'pause' : 'play'} size={20} />
          </button>
          <button type="button" className="music__btn" aria-label="Следующий трек" onClick={() => changeTrack(() => next(roomId))}>
            <Icon name="skipForward" size={18} />
          </button>
        </div>

        <div className="music__volume">
          <button type="button" className="music__mute" onClick={toggleMute} aria-label="Выключить/включить звук">
            <Icon name={volume === 0 ? 'volumeOff' : 'volume'} size={18} />
          </button>
          <Slider
            value={Math.round(volume * 100)}
            max={100}
            label="Громкость"
            onChange={(value) => handleVolumeChange(value / 100)}
          />
        </div>
      </div>

      {track?.audioUrl && (
        <audio
          ref={audioRef}
          src={withBase(track.audioUrl)}
          onTimeUpdate={(e) => {
            if (!isSeeking) setPosition(e.currentTarget.currentTime);
          }}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onEnded={() => changeTrack(() => next(roomId))}
        />
      )}
    </div>
  );
}
