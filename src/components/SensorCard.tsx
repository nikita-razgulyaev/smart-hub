interface Props {
  title: string;
  icon: string;
  value: number | undefined;
  unit: string;
}

export function SensorCard({ title, icon, value, unit }: Props) {
  return (
    <div className="card sensor-mini">
      <span style={{ fontSize: 20 }}>{icon}</span>
      <div className="val">
        {value ?? '—'} {unit}
      </div>
      <div className="label" style={{ margin: 0 }}>
        {title}
      </div>
    </div>
  );
}
