import React from 'react';
import { motion } from 'framer-motion';
import { theme } from '../../styles/theme';

interface AvatarProps {
    src?: string;
    alt?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
    className?: string;
    status?: 'online' | 'offline' | 'away' | 'busy';
    onClick?: () => void;
    interactive?: boolean;
    fallback?: React.ReactNode;
}

const Avatar: React.FC<AvatarProps> = ({
    src,
    alt = '',
    size = 'md',
    rounded = 'full',
    className = '',
    status,
    onClick,
    interactive = false,
    fallback,
}) => {
    const sizes = {
        xs: 'w-6 h-6 text-xs',
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg',
        xl: 'w-16 h-16 text-xl',
    };

    const roundings = {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full',
    };

    const statusColors = {
        online: 'bg-success-500',
        offline: 'bg-neutral-400',
        away: 'bg-warning-500',
        busy: 'bg-error-500',
    };

    const statusSizes = {
        xs: 'w-1.5 h-1.5',
        sm: 'w-2 h-2',
        md: 'w-2.5 h-2.5',
        lg: 'w-3 h-3',
        xl: 'w-4 h-4',
    };

    const baseStyles = `
        relative
        inline-flex
        items-center
        justify-center
        bg-neutral-200
        text-neutral-600
        font-medium
        ${sizes[size]}
        ${roundings[rounded]}
        ${interactive ? 'cursor-pointer hover:opacity-80' : ''}
        ${className}
    `;

    const statusStyles = status
        ? `
            absolute
            bottom-0
            right-0
            ${statusSizes[size]}
            ${statusColors[status]}
            border-2
            border-white
            ${roundings[rounded]}
        `
        : '';

    const Component = onClick || interactive ? motion.div : 'div';

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    };

    const renderContent = () => {
        if (src) {
            return (
                <img
                    src={src}
                    alt={alt}
                    className={`w-full h-full object-cover ${roundings[rounded]}`}
                />
            );
        }

        if (fallback) {
            return fallback;
        }

        return alt ? getInitials(alt) : '?';
    };

    return (
        <Component
            className={baseStyles}
            onClick={onClick}
            whileHover={interactive ? { scale: 1.05 } : undefined}
            whileTap={interactive ? { scale: 0.95 } : undefined}
        >
            {renderContent()}
            {status && <span className={statusStyles} />}
        </Component>
    );
};

export const AvatarGroup: React.FC<{
    children: React.ReactNode;
    max?: number;
    spacing?: number;
    className?: string;
}> = ({ children, max, spacing = -4, className = '' }) => {
    const childrenArray = React.Children.toArray(children);
    const displayCount = max ? Math.min(childrenArray.length, max) : childrenArray.length;
    const remainingCount = max ? childrenArray.length - max : 0;

    return (
        <div className={`flex items-center ${className}`}>
            {childrenArray.slice(0, displayCount).map((child, index) => (
                <div
                    key={index}
                    className="relative"
                    style={{ marginLeft: index === 0 ? 0 : spacing }}
                >
                    {child}
                </div>
            ))}
            {remainingCount > 0 && (
                <div
                    className={`
                        relative
                        flex
                        items-center
                        justify-center
                        w-10
                        h-10
                        bg-neutral-200
                        text-neutral-600
                        font-medium
                        rounded-full
                        text-sm
                    `}
                    style={{ marginLeft: spacing }}
                >
                    +{remainingCount}
                </div>
            )}
        </div>
    );
};

export default Avatar; 