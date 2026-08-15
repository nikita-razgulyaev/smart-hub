import { useDevicesStore } from '../devicesStore';

describe('devicesStore', () => {
  it('toggle переключает isOn у существующего устройства', () => {
    const before = useDevicesStore.getState().byId['dev-wifi'];
    expect(before).toBeDefined();
    const initialIsOn = before.isOn;

    useDevicesStore.getState().toggle('dev-wifi');

    expect(useDevicesStore.getState().byId['dev-wifi'].isOn).toBe(!initialIsOn);
  });

  it('setState сливает частичный state с текущим', () => {
    useDevicesStore.getState().setState('dev-thermostat', { state: { target: 26 } });

    const device = useDevicesStore.getState().byId['dev-thermostat'];
    expect(device.state.target).toBe(26);
    // остальные поля state должны сохраниться (не перетёрты)
    expect(device.state.mode).toBeDefined();
  });

  it('toggle игнорирует несуществующий id без ошибок', () => {
    expect(() => useDevicesStore.getState().toggle('nope')).not.toThrow();
  });
});
