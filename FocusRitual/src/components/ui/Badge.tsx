import React from 'react';
import { motion } from 'framer-motion';
import { theme } from '../../styles/theme';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
    size?: 'sm' | 'md' | 'lg';
    rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
    className?: string;
    dot?: boolean;
    pulse?: boolean;
    onClick?: () => void;
    interactive?: boolean;
}

const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    rounded = 'full',
    className = '',
    dot = false,
    pulse = false,
    onClick,
    interactive = false,
}) => {
    const variants = {
        primary: 'bg-primary-100 text-primary-800',
        secondary: 'bg-secondary-100 text-secondary-800',
        success: 'bg-success-100 text-success-800',
        warning: 'bg-warning-100 text-warning-800',
        error: 'bg-error-100 text-error-800',
        info: 'bg-info-100 text-info-800',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-sm',
        lg: 'px-3 py-1 text-base',
    };

    const roundings = {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full',
    };

    const baseStyles = `
        inline-flex
        items-center
        font-medium
        ${variants[variant]}
        ${sizes[size]}
        ${roundings[rounded]}
        ${interactive ? 'cursor-pointer hover:opacity-80' : ''}
        ${className}
    `;

    const dotStyles = `
        w-2
        h-2
        mr-1.5
        rounded-full
        ${variants[variant].split(' ')[0]}
    `;

    const pulseStyles = pulse
        ? `
            relative
            before:absolute
            before:inset-0
            before:rounded-full
            before:animate-ping
            before:bg-current
            before:opacity-75
        `
        : '';

    const Component = onClick || interactive ? motion.span : 'span';

    return (
        <Component
            className={baseStyles}
            onClick={onClick}
            whileHover={interactive ? { scale: 1.05 } : undefined}
            whileTap={interactive ? { scale: 0.95 } : undefined}
        >
            {dot && <span className={`${dotStyles} ${pulseStyles}`} />}
            {children}
        </Component>
    );
};

export default Badge; 