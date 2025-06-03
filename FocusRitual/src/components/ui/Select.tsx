import React from 'react';
import { motion, HTMLMotionProps, AnimatePresence } from 'framer-motion';
import { theme } from '../../styles/theme';

interface SelectProps extends Omit<HTMLMotionProps<"select">, "ref" | "size" | "onChange"> {
    label?: string;
    error?: string;
    helperText?: string;
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    variant?: 'default' | 'glass';
    rounded?: boolean;
    options: { value: string; label: string }[];
    onChange?: (value: string) => void;
}

export const Select: React.FC<SelectProps> = ({
    label,
    error,
    helperText,
    size = 'md',
    fullWidth = false,
    leftIcon,
    rightIcon,
    variant = 'default',
    rounded = false,
    options,
    onChange,
    className = '',
    ...props
}) => {
    const baseStyles = 'w-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 appearance-none';

    const variants = {
        default: 'bg-white border border-neutral-200 text-neutral-900 focus:border-primary-500 focus:ring-primary-500',
        glass: `${theme.glass.background} backdrop-blur-md border border-white/20 text-white focus:border-white/30 focus:ring-white/30`,
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

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange?.(e.target.value);
    };

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
                <motion.select
                    whileFocus={{ scale: 1.01 }}
                    transition={theme.animations.spring}
                    className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${border} ${errorStyles} ${shadow} ${leftIcon ? 'pl-10' : ''
                        } ${rightIcon ? 'pr-10' : ''}`}
                    onChange={handleChange}
                    {...props}
                >
                    <AnimatePresence>
                        {options.map((option) => (
                            <motion.option
                                key={option.value}
                                value={option.value}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={theme.animations.smooth}
                            >
                                {option.label}
                            </motion.option>
                        ))}
                    </AnimatePresence>
                </motion.select>
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
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={theme.animations.smooth}
                    className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"
                >
                    <svg
                        className={`h-5 w-5 ${variant === 'glass' ? 'text-white' : 'text-neutral-400'}`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                        />
                    </svg>
                </motion.div>
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

export default Select; 