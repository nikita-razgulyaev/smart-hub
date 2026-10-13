import { useEffect, useRef, useState } from 'react';

/** Следит за шириной элемента, чтобы рисовать SVG в реальных пикселях без искажения текста. */
export function useElementWidth<T extends HTMLElement>(fallback = 600) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const update = () => setWidth(Math.round(element.getBoundingClientRect().width) || fallback);
    update();

    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [fallback]);

  return { ref, width };
}
