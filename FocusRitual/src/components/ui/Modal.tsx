import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../../styles/theme';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    showCloseButton?: boolean;
    closeOnOverlayClick?: boolean;
    className?: string;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    description,
    children,
    size = 'md',
    showCloseButton = true,
    closeOnOverlayClick = true,
    className = '',
}) => {
    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        full: 'max-w-full mx-4',
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleOverlayClick}
                >
                    <motion.div
                        className={`
                            relative
                            w-full
                            ${sizes[size]}
                            bg-white
                            rounded-lg
                            shadow-xl
                            ${className}
                        `}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ type: 'spring', duration: 0.5 }}
                    >
                        {(title || description || showCloseButton) && (
                            <div className="px-6 py-4 border-b border-neutral-200">
                                <div className="flex items-start justify-between">
                                    <div>
                                        {title && (
                                            <h3 className="text-lg font-semibold text-neutral-900">
                                                {title}
                                            </h3>
                                        )}
                                        {description && (
                                            <p className="mt-1 text-sm text-neutral-600">
                                                {description}
                                            </p>
                                        )}
                                    </div>
                                    {showCloseButton && (
                                        <motion.button
                                            className="p-1 text-neutral-400 hover:text-neutral-500 focus:outline-none"
                                            onClick={onClose}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <svg
                                                className="w-5 h-5"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                        )}
                        <div className="px-6 py-4">
                            {children}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export const ModalHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = '',
}) => (
    <div className={`px-6 py-4 border-b border-neutral-200 ${className}`}>
        {children}
    </div>
);

export const ModalBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = '',
}) => (
    <div className={`px-6 py-4 ${className}`}>
        {children}
    </div>
);

export const ModalFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = '',
}) => (
    <div className={`px-6 py-4 border-t border-neutral-200 ${className}`}>
        {children}
    </div>
);

export default Modal; 