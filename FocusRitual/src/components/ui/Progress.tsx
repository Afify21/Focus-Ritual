import React from 'react';
import { motion } from 'framer-motion';
import { theme } from '../../styles/theme';

interface ProgressProps {
    value: number;
    max?: number;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
    rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
    className?: string;
    showValue?: boolean;
    animated?: boolean;
    striped?: boolean;
    label?: string;
    labelPosition?: 'top' | 'bottom';
}

const Progress: React.FC<ProgressProps> = ({
    value,
    max = 100,
    size = 'md',
    variant = 'primary',
    rounded = 'full',
    className = '',
    showValue = false,
    animated = false,
    striped = false,
    label,
    labelPosition = 'top',
}) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const sizes = {
        xs: 'h-1',
        sm: 'h-2',
        md: 'h-3',
        lg: 'h-4',
    };

    const roundings = {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full',
    };

    const variants = {
        primary: 'bg-primary-500',
        secondary: 'bg-secondary-500',
        success: 'bg-success-500',
        warning: 'bg-warning-500',
        error: 'bg-error-500',
        info: 'bg-info-500',
    };

    const baseStyles = `
        w-full
        bg-neutral-200
        overflow-hidden
        ${sizes[size]}
        ${roundings[rounded]}
        ${className}
    `;

    const progressStyles = `
        h-full
        ${variants[variant]}
        ${striped ? 'bg-stripes' : ''}
        ${animated ? 'animate-progress' : ''}
        ${roundings[rounded]}
    `;

    const labelStyles = `
        text-sm
        font-medium
        text-neutral-700
        mb-1
    `;

    const valueStyles = `
        text-xs
        font-medium
        text-neutral-600
        ml-2
    `;

    const containerStyles = `
        flex
        flex-col
        w-full
    `;

    const progressContainerStyles = `
        flex
        items-center
        w-full
    `;

    return (
        <div className={containerStyles}>
            {label && labelPosition === 'top' && (
                <div className="flex items-center justify-between">
                    <span className={labelStyles}>{label}</span>
                    {showValue && (
                        <span className={valueStyles}>{Math.round(percentage)}%</span>
                    )}
                </div>
            )}
            <div className={progressContainerStyles}>
                <div className={baseStyles}>
                    <motion.div
                        className={progressStyles}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                </div>
            </div>
            {label && labelPosition === 'bottom' && (
                <div className="flex items-center justify-between mt-1">
                    <span className={labelStyles}>{label}</span>
                    {showValue && (
                        <span className={valueStyles}>{Math.round(percentage)}%</span>
                    )}
                </div>
            )}
        </div>
    );
};

export const CircularProgress: React.FC<{
    value: number;
    max?: number;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
    className?: string;
    showValue?: boolean;
    animated?: boolean;
    label?: string;
}> = ({
    value,
    max = 100,
    size = 'md',
    variant = 'primary',
    className = '',
    showValue = false,
    animated = false,
    label,
}) => {
        const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
        const radius = 45;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference - (percentage / 100) * circumference;

        const sizes = {
            xs: 'w-12 h-12',
            sm: 'w-16 h-16',
            md: 'w-20 h-20',
            lg: 'w-24 h-24',
            xl: 'w-32 h-32',
        };

        const variants = {
            primary: 'text-primary-500',
            secondary: 'text-secondary-500',
            success: 'text-success-500',
            warning: 'text-warning-500',
            error: 'text-error-500',
            info: 'text-info-500',
        };

        const baseStyles = `
        relative
        inline-flex
        items-center
        justify-center
        ${sizes[size]}
        ${className}
    `;

        const labelStyles = `
        text-sm
        font-medium
        text-neutral-700
        mt-2
    `;

        const valueStyles = `
        text-lg
        font-semibold
        ${variants[variant]}
    `;

        return (
            <div className="flex flex-col items-center">
                <div className={baseStyles}>
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle
                            className="text-neutral-200"
                            strokeWidth="8"
                            stroke="currentColor"
                            fill="transparent"
                            r={radius}
                            cx="50"
                            cy="50"
                        />
                        <motion.circle
                            className={variants[variant]}
                            strokeWidth="8"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r={radius}
                            cx="50"
                            cy="50"
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            style={{
                                strokeDasharray: circumference,
                                transform: 'rotate(-90deg)',
                                transformOrigin: '50% 50%',
                            }}
                        />
                    </svg>
                    {showValue && (
                        <span className={valueStyles}>{Math.round(percentage)}%</span>
                    )}
                </div>
                {label && <span className={labelStyles}>{label}</span>}
            </div>
        );
    };

export default Progress; 