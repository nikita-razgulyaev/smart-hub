import { useState } from 'react';
import { Header } from '../components/Header';
import { WeatherCard } from '../components/WeatherCard';
import { CurrencyCard } from '../components/CurrencyCard';
import { AlertBanner } from '../components/AlertBanner';
import { RoomTabs } from '../components/RoomTabs';
import { ToggleMiniCard } from '../components/ToggleMiniCard';
import { ThermostatCard } from '../components/ThermostatCard';
import { LightCard } from '../components/LightCard';
import { CameraCard } from '../components/CameraCard';
import { MusicPlayerCard } from '../components/MusicPlayerCard';
import { EnergyChartCard } from '../components/EnergyChartCard';
import { DateTimeCard } from '../components/DateTimeCard';
import { HistoryFactCard } from '../components/HistoryFactCard';
import { NewsCard } from '../components/NewsCard';
import { StockCard } from '../components/StockCard';
import { useSimulation } from '../hooks/useSimulation';
import { useSensorsStore } from '../store/sensorsStore';
import { useDevicesStore } from '../store/devicesStore';
import { useStocksStore } from '../store/stocksStore';
import { ROOMS } from '../data/seedData';

function airQualityLabel(value: number): string {
  return value <= 50 ? 'Хорошо' : 'Среднее';
}

export function DashboardPage() {
  useSimulation();

  const { latest } = useSensorsStore();
  const devicesById = useDevicesStore((s) => s.byId);
  const stocksById = useStocksStore((s) => s.byId);

  const [activeRoomId, setActiveRoomId] = useState<string>(
    ROOMS.find((r) => r.slug === 'living-room')?.id ?? ROOMS[0].id,
  );

  const activeRoom = ROOMS.find((r) => r.id === activeRoomId);
  const allDevices = Object.values(devicesById);
  const streetDevices = allDevices.filter((d) => !d.roomId);

  // Термостат, свет, тумблеры, музыка, датчики и энергопотребление всегда
  // показывают данные гостиной — при переключении комнат меняется только
  // камера (и её подпись), а не эти виджеты.
  const HOME_ROOM_ID = 'living-room';
  const homeRoomDevices = allDevices.filter((d) => d.roomId === HOME_ROOM_ID);

  const roomDevices = allDevices.filter((d) => d.roomId === activeRoomId);

  const thermostat = homeRoomDevices.find((d) => d.type === 'THERMOSTAT');
  const light = homeRoomDevices.find((d) => d.type === 'LIGHT');
  const toggles = homeRoomDevices.filter((d) => d.type === 'TOGGLE');
  const roomCamera = roomDevices.find((d) => d.type === 'CAMERA');
  const streetToggles = streetDevices.filter((d) => d.type === 'TOGGLE');
  const streetCamera = streetDevices.find((d) => d.type === 'CAMERA');

  const stocks = Object.values(stocksById);

  return (
    <>
      <Header />

      <div className="layout">
        {/* LEFT COLUMN */}
        <div className="col-left">
          {/* STREET */}
          <div className="section">
            <div className="section-title">Улица</div>
            <div className="street-grid">
              {streetCamera && (
                <CameraCard title="Камера наблюдения на улице" variant="street" device={streetCamera} />
              )}

              <div className="weather-col">
                <WeatherCard />
                <div className="mini-row3">
                  {streetToggles.map((d) => (
                    <ToggleMiniCard key={d.id} device={d} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* HOME */}
          <div className="section">
            <div className="section-title">Дом</div>
            <RoomTabs rooms={ROOMS} activeId={activeRoomId} onSelect={setActiveRoomId} />

            <div className="home-grid">
              <div className="home-left">
                {activeRoom && (
                  <CameraCard title={activeRoom.name} variant="room" roomSlug={activeRoom.slug} device={roomCamera} />
                )}

                <MusicPlayerCard roomId={HOME_ROOM_ID} />

                <div className="card sensor-combo">
                  <div className="sensor-seg">
                    <div className="val">
                      {latest.TEMPERATURE?.value !== undefined ? `${latest.TEMPERATURE.value}°` : '—'}
                    </div>
                    <div className="label">Температура</div>
                  </div>
                  <div className="sensor-seg">
                    <div className="val">
                      {latest.HUMIDITY?.value !== undefined ? `${latest.HUMIDITY.value}%` : '—'}
                    </div>
                    <div className="label">Влажность</div>
                  </div>
                  <div className="sensor-seg">
                    <div className="val">
                      {latest.AIR_QUALITY?.value !== undefined ? airQualityLabel(latest.AIR_QUALITY.value) : '—'}
                    </div>
                    <div className="label">Качество воздуха</div>
                  </div>
                </div>

                <div className="sensor-row3">
                  {toggles.map((d) => (
                    <ToggleMiniCard key={d.id} device={d} />
                  ))}
                </div>
              </div>

              {thermostat && (
                <div className="device-col" style={{ gridColumn: 2, gridRow: 1 }}>
                  <ThermostatCard device={thermostat} />
                </div>
              )}

              {light && (
                <div className="device-col" style={{ gridColumn: 3, gridRow: 1 }}>
                  <LightCard device={light} />
                </div>
              )}

              <div className="energy-card" style={{ gridColumn: '2 / 4', gridRow: 2 }}>
                <EnergyChartCard />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-right section">
          <DateTimeCard />
          <HistoryFactCard />
          <NewsCard />
          <CurrencyCard />
          {stocks.map((s) => (
            <StockCard key={s.id} stock={s} />
          ))}
        </div>
      </div>

      <AlertBanner />
    </>
  );
}
