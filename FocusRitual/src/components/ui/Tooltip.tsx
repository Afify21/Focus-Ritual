import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../../styles/theme';

interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactNode;
    position?: 'top' | 'right' | 'bottom' | 'left';
    delay?: number;
    maxWidth?: number;
    className?: string;
    arrow?: boolean;
    interactive?: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({
    content,
    children,
    position = 'top',
    delay = 200,
    maxWidth = 200,
    className = '',
    arrow = true,
    interactive = false,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        const id = setTimeout(() => {
            setIsVisible(true);
        }, delay);
        setTimeoutId(id);
    };

    const handleMouseLeave = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        setIsVisible(false);
    };

    const positions = {
        top: {
            tooltip: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
            arrow: 'bottom-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45',
        },
        right: {
            tooltip: 'left-full top-1/2 -translate-y-1/2 ml-2',
            arrow: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45',
        },
        bottom: {
            tooltip: 'top-full left-1/2 -translate-x-1/2 mt-2',
            arrow: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45',
        },
        left: {
            tooltip: 'right-full top-1/2 -translate-y-1/2 mr-2',
            arrow: 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2 rotate-45',
        },
    };

    const { tooltip, arrow: arrowPosition } = positions[position];

    return (
        <div
            className="relative inline-block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        className={`
                            absolute
                            z-50
                            ${tooltip}
                            ${className}
                        `}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: 'spring', duration: 0.2 }}
                        style={{ maxWidth }}
                    >
                        <div
                            className={`
                                bg-neutral-900
                                text-white
                                text-sm
                                px-3
                                py-2
                                rounded-lg
                                shadow-lg
                                ${interactive ? 'cursor-default' : ''}
                            `}
                        >
                            {content}
                            {arrow && (
                                <div
                                    className={`
                                        absolute
                                        w-2
                                        h-2
                                        bg-neutral-900
                                        ${arrowPosition}
                                    `}
                                />
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Tooltip; 