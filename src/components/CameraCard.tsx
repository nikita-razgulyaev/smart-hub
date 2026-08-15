import { useThemeStore } from '../store/themeStore';
import { useDevicesStore } from '../store/devicesStore';
import { ROOM_IMAGES, STREET_IMAGES } from '../data/seedData';
import { Device } from '../types';

interface Props {
  title: string;
  variant?: 'street' | 'room';
  roomSlug?: string;
  device?: Device;
}

export function CameraCard({ title, variant = 'street', roomSlug, device }: Props) {
  const isDark = useThemeStore((s) => s.isDark);
  const toggle = useDevicesStore((s) => s.toggle);

  const images = variant === 'street' ? STREET_IMAGES : (roomSlug && ROOM_IMAGES[roomSlug]) || STREET_IMAGES;
  const src = isDark ? images.night : images.day;
  const isOn = device ? device.isOn : true;

  return (
    <div className={variant === 'street' ? 'cam-card' : 'room-preview'}>
      {isOn ? (
        <img className="media-img" src={src} alt={title} />
      ) : (
        <div className="cam-off">
          <span>📷</span>
          <span>Камера отключена</span>
        </div>
      )}
      {isOn && <div className="cam-badge">LIVE</div>}
      <div className="cam-toggle">
        <div
          className={`switch${isOn ? ' on' : ''}`}
          onClick={() => device && toggle(device.id)}
          role="button"
          aria-label="Включить/выключить камеру"
        >
          <div className="dot" />
        </div>
      </div>
      <div className="cam-caption">{title}</div>
    </div>
  );
}
