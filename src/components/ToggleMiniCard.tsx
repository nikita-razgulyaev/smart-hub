import { Device } from '../types';
import { useDevicesStore } from '../store/devicesStore';
import { Icon, IconName } from './ui/Icon';
import { Switch } from './ui/Switch';

interface Props {
  device: Device;
  onLabel?: string;
  offLabel?: string;
}

// Иконка подбирается по id устройства, чтобы не менять модель данных.
const DEVICE_ICONS: Record<string, IconName> = {
  'dev-sprinkler': 'sprinkler',
  'dev-street-light': 'bulb',
  'dev-motion': 'motion',
  'dev-wifi': 'wifi',
  'dev-tv': 'tv',
  'dev-socket': 'plug',
};

export function ToggleMiniCard({ device, onLabel = 'Вкл', offLabel = 'Выкл' }: Props) {
  const toggle = useDevicesStore((s) => s.toggle);

  return (
    <button
      type="button"
      className={`tile${device.isOn ? ' tile--on' : ''}`}
      aria-pressed={device.isOn}
      onClick={() => toggle(device.id)}
    >
      <span className="tile__icon">
        <Icon name={DEVICE_ICONS[device.id] ?? 'plug'} size={18} />
      </span>
      <span>
        <span className="tile__title">{device.name}</span>
        <span className="tile__footer">
          <span className="text-label">{device.isOn ? onLabel : offLabel}</span>
          <Switch checked={device.isOn} decorative />
        </span>
      </span>
    </button>
  );
}
