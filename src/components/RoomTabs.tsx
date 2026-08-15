import { Room } from '../types';

interface Props {
  rooms: Room[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export function RoomTabs({ rooms, activeId, onSelect }: Props) {
  return (
    <div className="room-tabs">
      {rooms.map((room) => (
        <span
          key={room.id}
          className={room.id === activeId ? 'active' : ''}
          onClick={() => onSelect(room.id)}
        >
          {room.name}
        </span>
      ))}
    </div>
  );
}
