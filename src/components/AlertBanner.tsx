import { useSensorsStore } from '../store/sensorsStore';
import { Icon } from './ui/Icon';

export function AlertBanner() {
  const { alerts, dismissAlert } = useSensorsStore();
  if (alerts.length === 0) return null;

  const alert = alerts[alerts.length - 1];

  return (
    <div className="alert" role="alert">
      <Icon name="alert" size={20} />
      <p className="alert__text">{alert.message}</p>
      <button
        type="button"
        className="alert__close"
        onClick={() => dismissAlert(alerts.length - 1)}
        aria-label="Закрыть уведомление"
      >
        <Icon name="close" size={18} />
      </button>
    </div>
  );
}
