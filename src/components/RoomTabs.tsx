import { Room } from '../types';

interface Props {
  rooms: Room[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export function RoomTabs({ rooms, activeId, onSelect }: Props) {
  return (
    <div className="tabs" role="tablist" aria-label="Комнаты">
      {rooms.map((room) => {
        const isActive = room.id === activeId;
        return (
          <button
            key={room.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`tabs__tab${isActive ? ' tabs__tab--active' : ''}`}
            onClick={() => onSelect(room.id)}
          >
            {room.name}
          </button>
        );
      })}
    </div>
  );
}
