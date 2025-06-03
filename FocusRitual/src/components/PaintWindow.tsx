import React, { useState } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { theme } from '../styles/theme';

interface PaintWindowProps extends HTMLMotionProps<"div"> {
    isOpen: boolean;
    onClose: () => void;
}

export const PaintWindow: React.FC<PaintWindowProps> = ({
    isOpen,
    onClose,
    ...props
}) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={theme.animations.spring}
            drag
            dragMomentum={false}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
            style={{
                position: 'fixed',
                top: '20%',
                left: '20%',
                zIndex: 1000,
                width: '400px',
                height: '300px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: theme.shadows.lg,
                cursor: isDragging ? 'grabbing' : 'grab',
            }}
            {...props}
        >
            <div className="flex items-center justify-between p-3 bg-neutral-100 rounded-t-lg">
                <h3 className="text-sm font-medium text-neutral-700">Paint Window</h3>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-neutral-200 rounded-full transition-colors"
                >
                    <svg
                        className="w-4 h-4 text-neutral-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>
            <div className="p-4">
                {/* Paint canvas will go here */}
                <div className="w-full h-[200px] bg-neutral-50 rounded-lg border border-neutral-200 flex items-center justify-center">
                    <p className="text-sm text-neutral-500">Paint canvas coming soon...</p>
                </div>
            </div>
        </motion.div>
    );
};

export default PaintWindow; 