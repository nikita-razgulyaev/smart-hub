import { useThemeStore } from '../store/themeStore';
import { useDevicesStore } from '../store/devicesStore';
import { ROOM_IMAGES, STREET_IMAGES } from '../data/seedData';
import { Device } from '../types';
import { withBase } from '../utils/assetPath';
import { Icon } from './ui/Icon';
import { Switch } from './ui/Switch';

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
  const src = withBase(isDark ? images.night : images.day);
  const isOn = device ? device.isOn : true;

  return (
    <div className={`cam${variant === 'room' ? ' cam--room' : ''}`}>
      {isOn ? (
        <img className="cam__img" src={src} alt={title} />
      ) : (
        <div className="cam__off">
          <Icon name="videoOff" size={28} />
          <span>Камера отключена</span>
        </div>
      )}
      {isOn && <div className="cam__badge">LIVE</div>}
      <div className="cam__toggle">
        <Switch
          checked={isOn}
          onChange={() => device && toggle(device.id)}
          label={`Камера: ${title}`}
        />
      </div>
      <div className="cam__caption">{title}</div>
    </div>
  );
}
