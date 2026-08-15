import { useEffect } from 'react';
import { DashboardPage } from './pages/DashboardPage';
import { useThemeStore } from './store/themeStore';

export default function App() {
  const isDark = useThemeStore((s) => s.isDark);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <>
      <div className="room-bg">
        <img className="room-day" src="/images/day-room.png" alt="Комната днём" />
        <img className="room-night" src="/images/night-room.png" alt="Комната ночью" />
      </div>
      <DashboardPage />
    </>
  );
}
