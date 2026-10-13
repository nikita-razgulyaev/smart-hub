import { firstSuccess, metSymbolToWmo, wwoCodeToWmo } from '../weather';

describe('wwoCodeToWmo', () => {
  it('сопоставляет коды wttr.in с кодами WMO для иконки', () => {
    expect(wwoCodeToWmo(113)).toBe(0); // ясно
    expect(wwoCodeToWmo(296)).toBe(61); // небольшой дождь
    expect(wwoCodeToWmo(338)).toBe(75); // сильный снег
    expect(wwoCodeToWmo(389)).toBe(95); // гроза
  });

  it('неизвестный код считает облачностью', () => {
    expect(wwoCodeToWmo(99999)).toBe(3);
  });
});

describe('metSymbolToWmo', () => {
  it('сопоставляет символы MET Norway с кодами WMO', () => {
    expect(metSymbolToWmo('clearsky_day')).toBe(0);
    expect(metSymbolToWmo('lightrain')).toBe(61);
    expect(metSymbolToWmo('heavysnowshowers_night')).toBe(75);
    expect(metSymbolToWmo('rainandthunder')).toBe(95);
    expect(metSymbolToWmo('cloudy')).toBe(3);
  });
});

describe('firstSuccess', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });
  afterEach(() => jest.restoreAllMocks());

  it('возвращает результат запасного источника, если основной упал', async () => {
    const result = await firstSuccess([
      { name: 'a', run: () => Promise.reject(new Error('blocked')) },
      { name: 'b', run: () => Promise.resolve('ok') },
    ]);
    expect(result).toBe('ok');
  });

  it('если упали все источники, перечисляет причины каждого', async () => {
    await expect(
      firstSuccess([
        { name: 'a', run: () => Promise.reject(new Error('x')) },
        { name: 'b', run: () => Promise.reject(new Error('y')) },
      ]),
    ).rejects.toThrow('a: x; b: y');
  });
});
