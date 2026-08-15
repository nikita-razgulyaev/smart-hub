import { render, screen } from '@testing-library/react';
import { SensorCard } from '../SensorCard';

describe('SensorCard', () => {
  it('отображает значение и единицу измерения', () => {
    render(<SensorCard title="Температура CPU" icon="🔥" value={42} unit="°C" />);
    expect(screen.getByText('Температура CPU')).toBeInTheDocument();
    expect(screen.getByText('42 °C')).toBeInTheDocument();
  });

  it('показывает прочерк, если значения ещё нет', () => {
    render(<SensorCard title="Влажность" icon="💧" value={undefined} unit="%" />);
    expect(screen.getByText('— %')).toBeInTheDocument();
  });
});
