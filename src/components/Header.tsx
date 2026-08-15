import { useThemeStore } from '../store/themeStore';

export function Header() {
  const { isDark, toggle } = useThemeStore();

  return (
    <div className="top-bar">
      <div className="brand">Smart Hub</div>
      <div className="theme-toggle" onClick={toggle} role="button" aria-label="Переключить тему">
        <div className="knob">{isDark ? '🌙' : '☀️'}</div>
      </div>
    </div>
  );
}
