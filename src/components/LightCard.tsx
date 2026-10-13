import type { CSSProperties } from 'react';
import { Device } from '../types';
import { useDevicesStore } from '../store/devicesStore';
import { withBase } from '../utils/assetPath';
import { Ring } from './ui/Ring';
import { Slider } from './ui/Slider';
import { Switch } from './ui/Switch';

export function LightCard({ device }: { device: Device }) {
  const setState = useDevicesStore((s) => s.setState);
  const brightness = Number(device.state.brightness ?? 0);

  const toggleOn = () => {
    const nextOn = !device.isOn;
    setState(device.id, { isOn: nextOn, state: { brightness: nextOn ? Math.max(brightness, 60) : 0 } });
  };

  const setBrightness = (value: number) => {
    setState(device.id, { isOn: value > 0, state: { brightness: value } });
  };

  return (
    <div className="card device">
      <div className="device__head">
        <span className="text-title">Свет</span>
        <Switch checked={device.isOn} onChange={toggleOn} label="Свет" />
      </div>

      <div className="light__stage">
        <img className="light__lamp" src={withBase('/images/lamp.png')} alt="" />
        <div className="light__cone" style={{ ['--brightness' as string]: brightness / 100 } as CSSProperties} />
      </div>

      <Ring value={brightness} size={96} strokeWidth={8}>
        <span className="light__percent">{brightness}%</span>
        <span className="light__percent-label">Яркость</span>
      </Ring>

      <Slider
        className="light__slider"
        value={brightness}
        max={100}
        label="Яркость света"
        onChange={setBrightness}
      />
    </div>
  );
}
