interface Props {
  title: string;
  icon: string;
  value: number | undefined;
  unit: string;
}

export function SensorCard({ title, icon, value, unit }: Props) {
  return (
    <div className="card sensors__item">
      <span className="sensors__icon">{icon}</span>
      <div className="sensors__value">
        {value ?? '—'} {unit}
      </div>
      <div className="sensors__label">{title}</div>
    </div>
  );
}
