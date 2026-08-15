import { useEffect } from "react";
import { useSensorsStore } from "../store/sensorsStore";
import { useMusicStore } from "../store/musicStore";
import { useStocksStore } from "../store/stocksStore";
import { useDevicesStore } from "../store/devicesStore";

const lastValues: Record<string, number> = {};

export function useSimulation() {
    const setReading = useSensorsStore((s) => s.setReading);
    const musicTick = useMusicStore((s) => s.tick);
    const stocksTick = useStocksStore((s) => s.tick);

    useEffect(() => {
        let timeoutId: number | null = null;
        let cancelled = false;

        const step = () => {
            if (cancelled) return;
            const thermostat =
                useDevicesStore.getState().byId["dev-thermostat"];
            const isOn = thermostat?.isOn ?? true;
            const target = isOn ? Number(thermostat?.state.target ?? 25) : 20;
            const prev = lastValues["sensor-temp"] ?? 24;

            const next =
                Math.abs(prev - target) < 0.05
                    ? target
                    : prev + (target - prev) * 0.018;
            lastValues["sensor-temp"] = next;
            setReading("TEMPERATURE", Math.round(next * 10) / 10);

            let mode: string;
            if (target > next + 0.3) {
                mode = "HEAT";
            } else if (target < next - 0.3) {
                mode = "COOL";
            } else {
                mode = "IDLE";
            }
            if (thermostat && thermostat.state.mode !== mode) {
                useDevicesStore
                    .getState()
                    .setState("dev-thermostat", { state: { mode } });
            }

            timeoutId = window.setTimeout(
                () => requestAnimationFrame(step),
                140,
            );
        };

        step();

        return () => {
            cancelled = true;
            if (timeoutId !== null) window.clearTimeout(timeoutId);
        };
    }, [setReading]);

    useEffect(() => {
        const musicInterval = setInterval(musicTick, 1000);
        const stocksInterval = setInterval(stocksTick, 10000);

        return () => {
            clearInterval(musicInterval);
            clearInterval(stocksInterval);
        };
    }, [musicTick, stocksTick]);
}
