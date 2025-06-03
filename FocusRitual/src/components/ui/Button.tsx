import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { theme } from '../../styles/theme';

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost' | 'glass';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
    rounded?: boolean;
    gradient?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    rounded = false,
    gradient = false,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variants = {
        primary: gradient ? theme.gradients.primary : 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
        secondary: gradient ? theme.gradients.secondary : 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500',
        success: gradient ? theme.gradients.success : 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500',
        warning: gradient ? theme.gradients.warning : 'bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-500',
        error: gradient ? theme.gradients.error : 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500',
        ghost: 'bg-transparent text-neutral-600 hover:bg-neutral-100 focus:ring-neutral-500',
        glass: `${theme.glass.background} backdrop-blur-md border border-white/20 text-white hover:bg-white/20 focus:ring-white/30`,
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };

    const width = fullWidth ? 'w-full' : '';
    const border = rounded ? 'rounded-full' : 'rounded-lg';
    const opacity = (disabled || isLoading) ? 'opacity-50 cursor-not-allowed' : '';
    const shadow = variant !== 'ghost' && variant !== 'glass' ? theme.shadows.md : '';

    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            whileHover={{
                scale: 1.02,
                boxShadow: variant !== 'ghost' ? theme.shadows.lg : 'none',
            }}
            transition={theme.animations.spring}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${width} ${border} ${opacity} ${shadow} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            <>
                {isLoading && (
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="mr-2"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                    </motion.div>
                )}
                {!isLoading && leftIcon && (
                    <motion.span
                        className="mr-2"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={theme.animations.smooth}
                    >
                        {leftIcon}
                    </motion.span>
                )}
                <motion.span
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={theme.animations.smooth}
                >
                    {children}
                </motion.span>
                {!isLoading && rightIcon && (
                    <motion.span
                        className="ml-2"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={theme.animations.smooth}
                    >
                        {rightIcon}
                    </motion.span>
                )}
            </>
        </motion.button>
    );
};

export default Button; 