import { useEffect, useRef, useState } from 'react';
import { Device } from '../types';
import { useDevicesStore } from '../store/devicesStore';
import { Icon } from './ui/Icon';
import { Ring } from './ui/Ring';
import { Switch } from './ui/Switch';

const MIN_TARGET = 10;
const MAX_TARGET = 30;

export function ThermostatCard({ device }: { device: Device }) {
  const setState = useDevicesStore((s) => s.setState);
  const toggle = useDevicesStore((s) => s.toggle);
  const [busy, setBusy] = useState(false);
  const [bump, setBump] = useState(false);

  const target = Number(device.state.target ?? 22);
  const mode = String(device.state.mode ?? 'IDLE');
  const frac = ((target - MIN_TARGET) / (MAX_TARGET - MIN_TARGET)) * 100;

  const prevTarget = useRef(target);
  useEffect(() => {
    if (prevTarget.current !== target) {
      prevTarget.current = target;
      setBump(true);
      const t = setTimeout(() => setBump(false), 220);
      return () => clearTimeout(t);
    }
  }, [target]);

  const changeTarget = (delta: number) => {
    if (busy) return;
    setBusy(true);
    const next = Math.max(MIN_TARGET, Math.min(MAX_TARGET, target + delta));
    setState(device.id, { state: { target: next } });
    setTimeout(() => setBusy(false), 150);
  };

  const isHeating = mode === 'HEAT';
  const isCooling = mode === 'COOL';

  return (
    <div className="card device">
      <div className="device__head">
        <span className="text-title">Термостат</span>
        <Switch checked={device.isOn} onChange={() => toggle(device.id)} label="Термостат" />
      </div>

      <Ring value={frac} size={156} strokeWidth={10}>
        <span className="thermostat__goal">Задано</span>
        <span className={`thermostat__value${bump ? ' thermostat__value--bump' : ''}`}>{target}°</span>
      </Ring>

      <div className="thermostat__controls">
        <button
          type="button"
          className="round-btn"
          onClick={() => changeTarget(-1)}
          aria-label="Уменьшить температуру"
        >
          <Icon name="minus" size={18} />
        </button>
        <button
          type="button"
          className="round-btn"
          onClick={() => changeTarget(1)}
          aria-label="Увеличить температуру"
        >
          <Icon name="plus" size={18} />
        </button>
      </div>

      <div className={`thermostat__mode${isHeating || isCooling ? ' thermostat__mode--visible' : ''}`} aria-live="polite">
        {(isHeating || isCooling) && (
          <>
            <Icon name={isHeating ? 'flame' : 'snowflake'} size={18} />
            <span>{isHeating ? 'Нагрев' : 'Охлаждение'}</span>
          </>
        )}
      </div>
    </div>
  );
}
