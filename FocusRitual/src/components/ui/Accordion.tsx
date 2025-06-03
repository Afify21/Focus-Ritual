import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../../styles/theme';

interface AccordionItem {
    id: string;
    title: React.ReactNode;
    content: React.ReactNode;
    disabled?: boolean;
    icon?: React.ReactNode;
}

interface AccordionProps {
    items: AccordionItem[];
    defaultOpen?: string[];
    variant?: 'default' | 'bordered' | 'separated';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    onChange?: (openItems: string[]) => void;
    animated?: boolean;
    allowMultiple?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({
    items,
    defaultOpen = [],
    variant = 'default',
    size = 'md',
    className = '',
    onChange,
    animated = true,
    allowMultiple = false,
}) => {
    const [openItems, setOpenItems] = useState<string[]>(defaultOpen);

    const variants = {
        default: {
            item: 'border-b border-neutral-200 last:border-b-0',
            header: 'hover:bg-neutral-50',
            content: 'bg-white',
        },
        bordered: {
            item: 'border border-neutral-200 rounded-lg mb-2 last:mb-0',
            header: 'hover:bg-neutral-50 rounded-t-lg',
            content: 'bg-white rounded-b-lg',
        },
        separated: {
            item: 'mb-2 last:mb-0',
            header: 'bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50',
            content: 'bg-white border border-neutral-200 border-t-0 rounded-b-lg',
        },
    };

    const sizes = {
        sm: {
            header: 'px-3 py-2 text-sm',
            content: 'px-3 py-2 text-sm',
        },
        md: {
            header: 'px-4 py-3 text-base',
            content: 'px-4 py-3 text-base',
        },
        lg: {
            header: 'px-5 py-4 text-lg',
            content: 'px-5 py-4 text-lg',
        },
    };

    const handleToggle = (itemId: string) => {
        const newOpenItems = allowMultiple
            ? openItems.includes(itemId)
                ? openItems.filter((id) => id !== itemId)
                : [...openItems, itemId]
            : openItems.includes(itemId)
                ? []
                : [itemId];

        setOpenItems(newOpenItems);
        onChange?.(newOpenItems);
    };

    return (
        <div className={className}>
            {items.map((item) => {
                const isOpen = openItems.includes(item.id);
                const isDisabled = item.disabled;

                return (
                    <div
                        key={item.id}
                        className={variants[variant].item}
                    >
                        <button
                            className={`
                                w-full
                                flex
                                items-center
                                justify-between
                                ${sizes[size].header}
                                ${variants[variant].header}
                                ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                            onClick={() => !isDisabled && handleToggle(item.id)}
                            disabled={isDisabled}
                        >
                            <div className="flex items-center space-x-2">
                                {item.icon && (
                                    <span className="flex-shrink-0">{item.icon}</span>
                                )}
                                <span className="font-medium">{item.title}</span>
                            </div>
                            <motion.svg
                                className="w-5 h-5 text-neutral-500"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                animate={{ rotate: isOpen ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </motion.svg>
                        </button>
                        <AnimatePresence>
                            {isOpen && (
                                <motion.div
                                    className={`
                                        overflow-hidden
                                        ${variants[variant].content}
                                        ${sizes[size].content}
                                    `}
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {item.content}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}
        </div>
    );
};

export const AccordionItem: React.FC<{
    children: React.ReactNode;
    className?: string;
}> = ({ children, className = '' }) => (
    <div className={`border-b border-neutral-200 last:border-b-0 ${className}`}>
        {children}
    </div>
);

export const AccordionHeader: React.FC<{
    children: React.ReactNode;
    isOpen?: boolean;
    isDisabled?: boolean;
    onClick?: () => void;
    className?: string;
}> = ({ children, isOpen, isDisabled, onClick, className = '' }) => (
    <button
        className={`
            w-full
            flex
            items-center
            justify-between
            px-4
            py-3
            font-medium
            hover:bg-neutral-50
            ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${className}
        `}
        onClick={onClick}
        disabled={isDisabled}
    >
        {children}
        <motion.svg
            className="w-5 h-5 text-neutral-500"
            viewBox="0 0 20 20"
            fill="currentColor"
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
        >
            <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
            />
        </motion.svg>
    </button>
);

export const AccordionContent: React.FC<{
    children: React.ReactNode;
    isOpen?: boolean;
    className?: string;
}> = ({ children, isOpen, className = '' }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div
                className={`overflow-hidden ${className}`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
            >
                {children}
            </motion.div>
        )}
    </AnimatePresence>
);

export default Accordion; 