import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { theme } from '../../styles/theme';

interface InputProps extends Omit<HTMLMotionProps<"input">, "ref" | "size"> {
    label?: string;
    error?: string;
    helperText?: string;
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    variant?: 'default' | 'glass';
    rounded?: boolean;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    helperText,
    size = 'md',
    fullWidth = false,
    leftIcon,
    rightIcon,
    variant = 'default',
    rounded = false,
    className = '',
    ...props
}) => {
    const baseStyles = 'w-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variants = {
        default: 'bg-white border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-primary-500 focus:ring-primary-500',
        glass: `${theme.glass.background} backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:border-white/30 focus:ring-white/30`,
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };

    const width = fullWidth ? 'w-full' : '';
    const border = rounded ? 'rounded-full' : 'rounded-lg';
    const errorStyles = error ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : '';
    const shadow = variant === 'glass' ? theme.shadows.md : '';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={theme.animations.smooth}
            className={`${width} ${className}`}
        >
            {label && (
                <motion.label
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={theme.animations.smooth}
                    className="block text-sm font-medium text-neutral-700 mb-1"
                >
                    {label}
                </motion.label>
            )}
            <div className="relative">
                {leftIcon && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={theme.animations.smooth}
                        className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                    >
                        {leftIcon}
                    </motion.div>
                )}
                <motion.input
                    whileFocus={{ scale: 1.01 }}
                    transition={theme.animations.spring}
                    className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${border} ${errorStyles} ${shadow} ${leftIcon ? 'pl-10' : ''
                        } ${rightIcon ? 'pr-10' : ''}`}
                    {...props}
                />
                {rightIcon && (
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={theme.animations.smooth}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
                    >
                        {rightIcon}
                    </motion.div>
                )}
            </div>
            {(error || helperText) && (
                <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={theme.animations.smooth}
                    className={`mt-1 text-sm ${error ? 'text-error-500' : 'text-neutral-500'}`}
                >
                    {error || helperText}
                </motion.p>
            )}
        </motion.div>
    );
};

export default Input; 