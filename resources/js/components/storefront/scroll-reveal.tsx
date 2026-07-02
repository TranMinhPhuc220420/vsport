import {
    cloneElement,
    isValidElement,
    useEffect,
    useRef,
    useState,
} from 'react';
import type { CSSProperties, ReactElement, ReactNode } from 'react';

import { cn } from '@/lib/utils';

type ScrollRevealDirection = 'up' | 'left' | 'right' | 'clip';

type ScrollRevealProps = {
    children: ReactNode;
    className?: string;
    delay?: number;
    direction?: ScrollRevealDirection;
    staggerChildren?: boolean;
    threshold?: number;
};

const directionClass: Record<ScrollRevealDirection, string> = {
    up: '',
    left: 'scroll-reveal-left',
    right: 'scroll-reveal-right',
    clip: 'scroll-reveal-clip',
};

function ScrollReveal({
    children,
    className,
    delay = 0,
    direction = 'up',
    staggerChildren = false,
    threshold = 0.15,
}: ScrollRevealProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const node = ref.current;

        if (!node) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry?.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { threshold },
        );

        observer.observe(node);

        return () => observer.disconnect();
    }, [threshold]);

    const content =
        staggerChildren && visible
            ? (Array.isArray(children) ? children : [children]).map(
                  (child, index) => {
                      if (!isValidElement(child)) {
                          return child;
                      }

                      const element = child as ReactElement<{
                          style?: CSSProperties;
                      }>;
                      const style = {
                          ...(element.props.style ?? {}),
                          '--stagger-index': index,
                      } as CSSProperties;

                      return cloneElement(element, {
                          key: element.key ?? index,
                          style,
                      });
                  },
              )
            : children;

    return (
        <div
            ref={ref}
            className={cn(
                !visible && 'scroll-reveal-pending',
                !visible && directionClass[direction],
                visible && 'scroll-reveal-visible',
                visible && directionClass[direction],
                visible && staggerChildren && 'scroll-reveal-stagger',
                className,
            )}
            style={
                visible && delay > 0
                    ? ({ animationDelay: `${delay}ms` } as CSSProperties)
                    : undefined
            }
        >
            {content}
        </div>
    );
}

export { ScrollReveal };
export type { ScrollRevealDirection };
