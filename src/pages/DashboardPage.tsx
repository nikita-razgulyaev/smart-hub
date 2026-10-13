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
import { Icon } from '../components/ui/Icon';
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

      <main className="layout">
        {/* LEFT COLUMN */}
        <div className="layout__main">
          {/* STREET */}
          <section className="panel">
            <h2 className="panel__title">Улица</h2>
            <div className="street">
              {streetCamera && (
                <CameraCard title="Камера наблюдения на улице" variant="street" device={streetCamera} />
              )}

              <div className="street__aside">
                <WeatherCard />
                <div className="tile-row">
                  {streetToggles.map((d) => (
                    <ToggleMiniCard key={d.id} device={d} />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* HOME */}
          <section className="panel">
            <h2 className="panel__title">Дом</h2>
            <RoomTabs rooms={ROOMS} activeId={activeRoomId} onSelect={setActiveRoomId} />

            <div className="home">
              <div className="home__main">
                {activeRoom && (
                  <CameraCard title={activeRoom.name} variant="room" roomSlug={activeRoom.slug} device={roomCamera} />
                )}

                <MusicPlayerCard roomId={HOME_ROOM_ID} />

                <div className="card sensors">
                  <div className="sensors__item">
                    <Icon className="sensors__icon" name="thermometer" size={18} />
                    <div className="sensors__value">
                      {latest.TEMPERATURE?.value !== undefined ? `${latest.TEMPERATURE.value}°` : '—'}
                    </div>
                    <div className="sensors__label">Температура</div>
                  </div>
                  <div className="sensors__item">
                    <Icon className="sensors__icon" name="droplet" size={18} />
                    <div className="sensors__value">
                      {latest.HUMIDITY?.value !== undefined ? `${latest.HUMIDITY.value}%` : '—'}
                    </div>
                    <div className="sensors__label">Влажность</div>
                  </div>
                  <div className="sensors__item">
                    <Icon className="sensors__icon" name="wind" size={18} />
                    <div className="sensors__value">
                      {latest.AIR_QUALITY?.value !== undefined ? airQualityLabel(latest.AIR_QUALITY.value) : '—'}
                    </div>
                    <div className="sensors__label">Качество воздуха</div>
                  </div>
                </div>

                <div className="tile-row">
                  {toggles.map((d) => (
                    <ToggleMiniCard key={d.id} device={d} />
                  ))}
                </div>
              </div>

              {thermostat && (
                <div className="home__thermostat">
                  <ThermostatCard device={thermostat} />
                </div>
              )}

              {light && (
                <div className="home__light">
                  <LightCard device={light} />
                </div>
              )}

              <div className="home__energy">
                <EnergyChartCard />
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <aside className="panel panel--side">
          <DateTimeCard />
          <HistoryFactCard />
          <NewsCard />
          <CurrencyCard />
          {stocks.map((s) => (
            <StockCard key={s.id} stock={s} />
          ))}
        </aside>
      </main>

      <AlertBanner />
    </>
  );
}
