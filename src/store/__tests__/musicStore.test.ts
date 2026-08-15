import { useMusicStore } from '../musicStore';

describe('musicStore', () => {
  it('play/pause переключают isPlaying для комнаты', () => {
    useMusicStore.getState().pause('living-room');
    expect(useMusicStore.getState().playerByRoom['living-room'].isPlaying).toBe(false);

    useMusicStore.getState().play('living-room');
    expect(useMusicStore.getState().playerByRoom['living-room'].isPlaying).toBe(true);
  });

  it('next сбрасывает позицию трека (при одном треке остаётся на нём же)', () => {
    const before = useMusicStore.getState().playerByRoom['living-room'].trackId;
    useMusicStore.getState().next('living-room');
    const after = useMusicStore.getState().playerByRoom['living-room'];

    expect(after.trackId).toBe(before); // сейчас в плейлисте один трек
    expect(after.positionSec).toBe(0);
  });

  it('tick увеличивает positionSec на 1 секунду при isPlaying', () => {
    useMusicStore.getState().play('living-room');
    const before = useMusicStore.getState().playerByRoom['living-room'].positionSec;

    useMusicStore.getState().tick();

    expect(useMusicStore.getState().playerByRoom['living-room'].positionSec).toBe(before + 1);
  });
});
