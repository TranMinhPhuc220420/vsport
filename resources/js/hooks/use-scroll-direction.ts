import { useEffect, useRef, useState } from 'react';

type ScrollDirection = 'up' | 'down';

export function useScrollDirection(threshold = 80): ScrollDirection {
    const [direction, setDirection] = useState<ScrollDirection>('up');
    const lastYRef = useRef(0);

    useEffect(() => {
        let ticking = false;

        const onScroll = () => {
            if (ticking) {
                return;
            }

            ticking = true;

            requestAnimationFrame(() => {
                const y = window.scrollY;
                const lastY = lastYRef.current;

                if (Math.abs(y - lastY) >= 8) {
                    if (y > threshold && y > lastY) {
                        setDirection('down');
                    } else if (y < lastY) {
                        setDirection('up');
                    }

                    lastYRef.current = y;
                }

                ticking = false;
            });
        };

        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    }, [threshold]);

    return direction;
}
