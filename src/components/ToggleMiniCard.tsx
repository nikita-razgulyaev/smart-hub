import { Device } from '../types';
import { useDevicesStore } from '../store/devicesStore';

interface Props {
  device: Device;
  onLabel?: string;
  offLabel?: string;
}

export function ToggleMiniCard({ device, onLabel = 'Вкл', offLabel = 'Выкл' }: Props) {
  const toggle = useDevicesStore((s) => s.toggle);

  return (
    <div className="card toggle-mini" onClick={() => toggle(device.id)}>
      <span className="title-sm">{device.name}</span>
      <div className="bottom">
        <span className="label">{device.isOn ? onLabel : offLabel}</span>
        <div className={`switch${device.isOn ? ' on' : ''}`}>
          <div className="dot" />
        </div>
      </div>
    </div>
  );
}
