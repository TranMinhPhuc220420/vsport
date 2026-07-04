import { useEffect, useRef, useState } from 'react';

type ScrollDirection = 'up' | 'down';

type UseScrollDirectionOptions = {
    /** Scroll Y below which the bar always stays visible. */
    threshold?: number;
    /** Pixels scrolled down before hiding. */
    hideDelta?: number;
    /** Pixels scrolled up before showing again. */
    showDelta?: number;
    /** Minimum ms between direction changes (should match CSS transition). */
    cooldownMs?: number;
};

export function useScrollDirection(
    thresholdOrOptions: number | UseScrollDirectionOptions = 80,
): ScrollDirection {
    const options =
        typeof thresholdOrOptions === 'number'
            ? { threshold: thresholdOrOptions }
            : thresholdOrOptions;

    const {
        threshold = 80,
        hideDelta = 24,
        showDelta = 16,
        cooldownMs = 280,
    } = options;

    const [direction, setDirection] = useState<ScrollDirection>('up');
    const lastYRef = useRef(0);
    const accumulatedRef = useRef(0);
    const lastToggleRef = useRef(0);
    const directionRef = useRef<ScrollDirection>('up');

    useEffect(() => {
        let ticking = false;

        const setDirectionStable = (next: ScrollDirection, now: number) => {
            if (directionRef.current === next) {
                return;
            }

            directionRef.current = next;
            setDirection(next);
            lastToggleRef.current = now;
            accumulatedRef.current = 0;
        };

        const onScroll = () => {
            if (ticking) {
                return;
            }

            ticking = true;

            requestAnimationFrame(() => {
                const y = window.scrollY;
                const delta = y - lastYRef.current;
                const now = performance.now();

                if (Math.abs(delta) >= 2) {
                    if (y <= threshold) {
                        setDirectionStable('up', now);
                    } else {
                        if (
                            (delta > 0 && accumulatedRef.current >= 0) ||
                            (delta < 0 && accumulatedRef.current <= 0)
                        ) {
                            accumulatedRef.current += delta;
                        } else {
                            accumulatedRef.current = delta;
                        }

                        const canToggle = now - lastToggleRef.current >= cooldownMs;

                        if (canToggle) {
                            if (
                                directionRef.current === 'up' &&
                                accumulatedRef.current >= hideDelta
                            ) {
                                setDirectionStable('down', now);
                            } else if (
                                directionRef.current === 'down' &&
                                accumulatedRef.current <= -showDelta
                            ) {
                                setDirectionStable('up', now);
                            }
                        }
                    }

                    lastYRef.current = y;
                }

                ticking = false;
            });
        };

        lastYRef.current = window.scrollY;
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    }, [threshold, hideDelta, showDelta, cooldownMs]);

    return direction;
}
