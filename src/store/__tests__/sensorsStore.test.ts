import { useSensorsStore } from '../sensorsStore';

describe('sensorsStore', () => {
  beforeEach(() => {
    useSensorsStore.setState({
      latest: { TEMPERATURE: undefined, HUMIDITY: undefined, AIR_QUALITY: undefined },
      alerts: [],
    });
  });

  it('setReading обновляет последнее показание датчика', () => {
    useSensorsStore.getState().setReading('TEMPERATURE', 55);
    expect(useSensorsStore.getState().latest.TEMPERATURE?.value).toBe(55);
  });

  it('добавляет и удаляет алерты', () => {
    useSensorsStore.getState().pushAlert({
      sensorId: 's1',
      name: 'CPU',
      value: 90,
      unit: '°C',
      message: 'Критично',
    });
    expect(useSensorsStore.getState().alerts).toHaveLength(1);

    useSensorsStore.getState().dismissAlert(0);
    expect(useSensorsStore.getState().alerts).toHaveLength(0);
  });
});
