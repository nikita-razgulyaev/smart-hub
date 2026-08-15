import { useEffect, useRef, useState } from 'react';
import { Device } from '../types';
import { useDevicesStore } from '../store/devicesStore';

export function ThermostatCard({ device }: { device: Device }) {
  const setState = useDevicesStore((s) => s.setState);
  const toggle = useDevicesStore((s) => s.toggle);
  const [busy, setBusy] = useState(false);
  const [bump, setBump] = useState(false);

  const target = Number(device.state.target ?? 22);
  const mode = String(device.state.mode ?? 'IDLE');
  const frac = Math.min(100, Math.max(0, ((target - 10) / 20) * 100));

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
    const next = Math.max(10, Math.min(30, target + delta));
    setState(device.id, { state: { target: next } });
    setTimeout(() => setBusy(false), 150);
  };

  const showBar = mode === 'HEAT' || mode === 'COOL';
  const modeLabel = mode === 'HEAT' ? 'Нагрев' : mode === 'COOL' ? 'Охлаждение' : '';
  const modeClass = mode === 'HEAT' ? ' mode-heat' : mode === 'COOL' ? ' mode-cool' : '';

  return (
    <div className="card thermo-card" style={{ height: '100%' }}>
      <div className="device-top">
        <span className="title-sm">Термостат</span>
        <div className={`switch${device.isOn ? ' on' : ''}`} onClick={() => toggle(device.id)}>
          <div className="dot" />
        </div>
      </div>

      <div className="dial" style={{ ['--frac' as string]: frac }}>
        <div className={`dial-inner${bump ? ' bump' : ''}`}>
          <div className="goal">Задано</div>
          <div className="val">{target}°</div>
        </div>
      </div>

      <div className="thermo-controls">
        <button className="btn-round" onClick={() => changeTarget(-1)}>
          –
        </button>
        <button className="btn-round" onClick={() => changeTarget(1)}>
          +
        </button>
      </div>

      <div className={`thermo-mode-bar${showBar ? ' show' : ''}${modeClass}`}>
        <div className="thermo-mode-inner">
          <span className="thermo-mode-icon">
            <img className="icon-heat" src="/images/heater.png" alt="Нагрев" />
            <img className="icon-cool" src="/images/air-conditioner.png" alt="Охлаждение" />
          </span>
          <span className="thermo-mode-text">{modeLabel}</span>
        </div>
      </div>
    </div>
  );
}
