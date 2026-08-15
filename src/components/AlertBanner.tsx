import { useSensorsStore } from '../store/sensorsStore';

export function AlertBanner() {
  const { alerts, dismissAlert } = useSensorsStore();
  if (alerts.length === 0) return null;

  const alert = alerts[alerts.length - 1];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        maxWidth: 420,
        width: '92%',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          borderRadius: 12,
          background: '#e14b3f',
          color: '#fff',
          padding: '12px 16px',
          boxShadow: '0 8px 22px rgba(0,0,0,0.25)',
        }}
      >
        <span style={{ fontSize: 18 }}>⚠️</span>
        <p style={{ fontSize: 13, flex: 1, margin: 0 }}>{alert.message}</p>
        <button
          onClick={() => dismissAlert(alerts.length - 1)}
          style={{ color: 'rgba(255,255,255,0.8)', background: 'none', border: 'none', cursor: 'pointer' }}
          aria-label="Закрыть уведомление"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
