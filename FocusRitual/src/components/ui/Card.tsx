import React from 'react';
import { motion } from 'framer-motion';
import { theme } from '../../styles/theme';

interface CardProps {
    children: React.ReactNode;
    variant?: 'elevated' | 'outlined' | 'filled';
    className?: string;
    onClick?: () => void;
    hoverable?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
    shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    border?: 'none' | 'thin' | 'medium' | 'thick';
    background?: 'white' | 'neutral' | 'primary' | 'secondary';
}

const Card: React.FC<CardProps> = ({
    children,
    variant = 'elevated',
    className = '',
    onClick,
    hoverable = false,
    padding = 'md',
    rounded = 'lg',
    shadow = 'md',
    border = 'none',
    background = 'white',
}) => {
    const baseStyles = 'transition-all duration-200';

    const variants = {
        elevated: 'bg-white border-none',
        outlined: 'bg-transparent border border-neutral-200',
        filled: 'bg-neutral-50 border-none',
    };

    const paddings = {
        none: 'p-0',
        sm: 'p-3',
        md: 'p-6',
        lg: 'p-8',
    };

    const roundings = {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full',
    };

    const shadows = {
        none: 'shadow-none',
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg',
        xl: 'shadow-xl',
        '2xl': 'shadow-2xl',
    };

    const borders = {
        none: 'border-0',
        thin: 'border',
        medium: 'border-2',
        thick: 'border-4',
    };

    const backgrounds = {
        white: 'bg-white',
        neutral: 'bg-neutral-50',
        primary: 'bg-primary-50',
        secondary: 'bg-secondary-50',
    };

    const hoverStyles = hoverable
        ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer'
        : '';

    const cardStyles = `
        ${baseStyles}
        ${variants[variant]}
        ${paddings[padding]}
        ${roundings[rounded]}
        ${shadows[shadow]}
        ${borders[border]}
        ${backgrounds[background]}
        ${hoverStyles}
        ${className}
    `;

    const MotionComponent = onClick || hoverable ? motion.div : 'div';

    return (
        <MotionComponent
            className={cardStyles}
            onClick={onClick}
            whileHover={hoverable ? { scale: 1.02 } : undefined}
            whileTap={onClick ? { scale: 0.98 } : undefined}
        >
            {children}
        </MotionComponent>
    );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = '',
}) => (
    <div className={`mb-4 ${className}`}>
        {children}
    </div>
);

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = '',
}) => (
    <h3 className={`text-xl font-semibold text-neutral-900 ${className}`}>
        {children}
    </h3>
);

export const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = '',
}) => (
    <p className={`text-sm text-neutral-600 ${className}`}>
        {children}
    </p>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = '',
}) => (
    <div className={className}>
        {children}
    </div>
);

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = '',
}) => (
    <div className={`mt-4 pt-4 border-t border-neutral-200 ${className}`}>
        {children}
    </div>
);

export default Card; 