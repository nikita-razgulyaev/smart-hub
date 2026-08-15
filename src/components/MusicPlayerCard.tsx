import { useEffect, useRef, useState } from 'react';
import { useMusicStore } from '../store/musicStore';
import { MUSIC_TRACKS } from '../data/seedData';

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
    <div className="card music-card">
      <div className="music-art">
        {showCover ? (
          <img src={track!.coverUrl!} alt={track?.title ?? ''} onError={() => setCoverMissing(true)} />
        ) : (
          '🎵'
        )}
      </div>
      <div className="music-info">
        <div className="t">{track?.title ?? '—'}</div>
        <div className="a">{track?.artist}</div>
      </div>
      <div className="music-progress">
        <span className="time">{formatTime(position)}</span>
        <input
          type="range"
          min={0}
          max={dur || 0}
          step={1}
          value={Math.min(position, dur || 0)}
          onPointerDown={() => setIsSeeking(true)}
          onPointerUp={() => setIsSeeking(false)}
          onChange={(e) => handleSeek(Number(e.target.value))}
        />
        <span className="time">{formatTime(dur)}</span>
      </div>

      <div className="music-bottom-row">
        <div className="music-controls">
          <button onClick={() => changeTrack(() => prev(roomId))}>⏮</button>
          <button className="play" onClick={() => (player.isPlaying ? pause(roomId) : play(roomId))}>
            {player.isPlaying ? '⏸' : '▶'}
          </button>
          <button onClick={() => changeTrack(() => next(roomId))}>⏭</button>
        </div>

        <div className="music-volume">
          <span className="icon" onClick={toggleMute} role="button" aria-label="Выключить/включить звук">
            {volume === 0 ? '🔇' : '🔉'}
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(volume * 100)}
            onChange={(e) => handleVolumeChange(Number(e.target.value) / 100)}
          />
        </div>
      </div>

      {track?.audioUrl && (
        <audio
          ref={audioRef}
          src={track.audioUrl}
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
