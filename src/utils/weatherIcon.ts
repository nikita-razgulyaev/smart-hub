import type { IconName } from '../components/ui/Icon';

/** Соответствие кодов WMO (Open-Meteo) иконкам. */
export function weatherIconName(code: number | undefined): IconName {
  if (code === undefined) return 'cloud';
  if (code <= 1) return 'sun';
  if (code <= 3) return 'cloud';
  if (code === 45 || code === 48) return 'cloudFog';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'cloudRain';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'cloudSnow';
  if (code >= 95) return 'cloudLightning';
  return 'cloud';
}
