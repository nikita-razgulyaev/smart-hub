import { Device } from '../types';
import { useDevicesStore } from '../store/devicesStore';

export function LightCard({ device }: { device: Device }) {
  const setState = useDevicesStore((s) => s.setState);
  const toggle = useDevicesStore((s) => s.toggle);
  const brightness = Number(device.state.brightness ?? 0);

  const toggleOn = () => {
    const nextOn = !device.isOn;
    setState(device.id, { isOn: nextOn, state: { brightness: nextOn ? Math.max(brightness, 60) : 0 } });
  };

  const setBrightness = (value: number) => {
    setState(device.id, { isOn: value > 0, state: { brightness: value } });
  };

  return (
    <div className="card light-card" style={{ height: '100%' }}>
      <div className="device-top">
        <span className="title-sm">Свет</span>
        <div className={`switch${device.isOn ? ' on' : ''}`} onClick={toggleOn}>
          <div className="dot" />
        </div>
      </div>

      <div className="lamp-stage">
        <img src="/images/lamp.png" alt="Pendant lamp" />
        <div className="lamp-cone" style={{ ['--b' as string]: brightness / 100 }} />
      </div>

      <div className="arc" style={{ ['--bp' as string]: brightness }}>
        <div className="arc-inner">
          <div className="pct">{brightness}%</div>
          <div className="sub">Яркость</div>
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={brightness}
        onChange={(e) => setBrightness(Number(e.target.value))}
      />
    </div>
  );
}
