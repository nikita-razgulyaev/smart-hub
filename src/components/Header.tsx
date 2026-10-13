import { useThemeStore } from '../store/themeStore';
import { Icon } from './ui/Icon';

export function Header() {
  const { isDark, toggle } = useThemeStore();

  return (
    <header className="top-bar">
      <div className="brand">
        <span className="brand__logo">
          <Icon name="home" size={18} />
        </span>
        <span className="brand__name">Smart Hub</span>
      </div>

      <button
        type="button"
        className="theme-toggle"
        onClick={toggle}
        role="switch"
        aria-checked={isDark}
        aria-label="Тёмная тема"
      >
        <span className="theme-toggle__knob" />
        <span className="theme-toggle__icon theme-toggle__icon--sun">
          <Icon name="sun" size={16} />
        </span>
        <span className="theme-toggle__icon theme-toggle__icon--moon">
          <Icon name="moon" size={16} />
        </span>
      </button>
    </header>
  );
}
