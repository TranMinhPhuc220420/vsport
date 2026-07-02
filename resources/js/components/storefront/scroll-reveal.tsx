import {
    cloneElement,
    isValidElement,
    useEffect,
    useRef,
    useState,
    type CSSProperties,
    type ReactElement,
    type ReactNode,
} from 'react';

import { cn } from '@/lib/utils';

type ScrollRevealProps = {
    children: ReactNode;
    className?: string;
    delay?: number;
    staggerChildren?: boolean;
    threshold?: number;
};

function ScrollReveal({
    children,
    className,
    delay = 0,
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

                      const element = child as ReactElement<{ style?: CSSProperties }>;
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
                visible && 'scroll-reveal-visible',
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
