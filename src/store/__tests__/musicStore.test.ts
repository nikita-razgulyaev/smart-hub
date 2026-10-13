import { useMusicStore } from '../musicStore';
import { MUSIC_TRACKS } from '../../data/seedData';

describe('musicStore', () => {
  it('при загрузке трек стоит на паузе', () => {
    expect(useMusicStore.getState().playerByRoom['living-room'].isPlaying).toBe(false);
  });

  it('play/pause переключают isPlaying для комнаты', () => {
    useMusicStore.getState().pause('living-room');
    expect(useMusicStore.getState().playerByRoom['living-room'].isPlaying).toBe(false);

    useMusicStore.getState().play('living-room');
    expect(useMusicStore.getState().playerByRoom['living-room'].isPlaying).toBe(true);
  });

  it('next переключает на следующий трек по кругу и сбрасывает позицию', () => {
    const before = useMusicStore.getState().playerByRoom['living-room'].trackId;
    const beforeIndex = MUSIC_TRACKS.findIndex((t) => t.id === before);
    const expectedId = MUSIC_TRACKS[(beforeIndex + 1) % MUSIC_TRACKS.length].id;

    useMusicStore.getState().next('living-room');
    const after = useMusicStore.getState().playerByRoom['living-room'];

    expect(after.trackId).toBe(expectedId);
    expect(after.positionSec).toBe(0);
  });

  it('tick не двигает позицию на паузе и увеличивает на 1 секунду при isPlaying', () => {
    useMusicStore.getState().pause('living-room');
    const paused = useMusicStore.getState().playerByRoom['living-room'].positionSec;
    useMusicStore.getState().tick();
    expect(useMusicStore.getState().playerByRoom['living-room'].positionSec).toBe(paused);

    useMusicStore.getState().play('living-room');
    const before = useMusicStore.getState().playerByRoom['living-room'].positionSec;
    useMusicStore.getState().tick();
    expect(useMusicStore.getState().playerByRoom['living-room'].positionSec).toBe(before + 1);
  });
});
