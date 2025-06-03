import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { theme } from '../../styles/theme';

interface Tab {
    id: string;
    label: React.ReactNode;
    content: React.ReactNode;
    disabled?: boolean;
    icon?: React.ReactNode;
}

interface TabsProps {
    tabs: Tab[];
    defaultTab?: string;
    variant?: 'line' | 'enclosed' | 'soft-rounded' | 'solid-rounded';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    className?: string;
    onChange?: (tabId: string) => void;
    animated?: boolean;
}

const Tabs: React.FC<TabsProps> = ({
    tabs,
    defaultTab,
    variant = 'line',
    size = 'md',
    fullWidth = false,
    className = '',
    onChange,
    animated = true,
}) => {
    const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

    const variants = {
        line: {
            tab: 'border-b-2 border-transparent hover:border-neutral-300',
            active: 'border-primary-500 text-primary-600',
            disabled: 'text-neutral-400 cursor-not-allowed',
        },
        enclosed: {
            tab: 'border border-transparent rounded-t-lg hover:bg-neutral-50',
            active: 'border-neutral-200 border-b-transparent bg-white text-primary-600',
            disabled: 'text-neutral-400 cursor-not-allowed',
        },
        'soft-rounded': {
            tab: 'rounded-lg hover:bg-neutral-100',
            active: 'bg-primary-50 text-primary-600',
            disabled: 'text-neutral-400 cursor-not-allowed',
        },
        'solid-rounded': {
            tab: 'rounded-lg hover:bg-neutral-100',
            active: 'bg-primary-500 text-white',
            disabled: 'text-neutral-400 cursor-not-allowed',
        },
    };

    const sizes = {
        sm: {
            tab: 'px-3 py-1.5 text-sm',
            content: 'p-3 text-sm',
        },
        md: {
            tab: 'px-4 py-2 text-base',
            content: 'p-4 text-base',
        },
        lg: {
            tab: 'px-5 py-2.5 text-lg',
            content: 'p-5 text-lg',
        },
    };

    const handleTabClick = (tabId: string) => {
        if (tabs.find((tab) => tab.id === tabId)?.disabled) return;
        setActiveTab(tabId);
        onChange?.(tabId);
    };

    const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

    return (
        <div className={className}>
            <div
                className={`
                    flex
                    ${fullWidth ? 'w-full' : ''}
                    ${variant === 'line' ? 'border-b border-neutral-200' : ''}
                `}
            >
                {tabs.map((tab) => {
                    const isActive = tab.id === activeTab;
                    const isDisabled = tab.disabled;

                    return (
                        <button
                            key={tab.id}
                            className={`
                                flex
                                items-center
                                space-x-2
                                font-medium
                                transition-colors
                                duration-200
                                ${sizes[size].tab}
                                ${variants[variant].tab}
                                ${isActive ? variants[variant].active : ''}
                                ${isDisabled ? variants[variant].disabled : ''}
                                ${fullWidth ? 'flex-1 justify-center' : ''}
                            `}
                            onClick={() => handleTabClick(tab.id)}
                            disabled={isDisabled}
                        >
                            {tab.icon && (
                                <span className="flex-shrink-0">{tab.icon}</span>
                            )}
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>
            {animated ? (
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className={sizes[size].content}
                >
                    {activeTabContent}
                </motion.div>
            ) : (
                <div className={sizes[size].content}>{activeTabContent}</div>
            )}
        </div>
    );
};

export const TabList: React.FC<{
    children: React.ReactNode;
    className?: string;
}> = ({ children, className = '' }) => (
    <div className={`flex space-x-1 ${className}`}>{children}</div>
);

export const Tab: React.FC<{
    children: React.ReactNode;
    isActive?: boolean;
    isDisabled?: boolean;
    onClick?: () => void;
    className?: string;
}> = ({ children, isActive, isDisabled, onClick, className = '' }) => (
    <button
        className={`
            px-4
            py-2
            font-medium
            transition-colors
            duration-200
            ${isActive ? 'text-primary-600' : 'text-neutral-600'}
            ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:text-primary-600'}
            ${className}
        `}
        onClick={onClick}
        disabled={isDisabled}
    >
        {children}
    </button>
);

export const TabPanels: React.FC<{
    children: React.ReactNode;
    className?: string;
}> = ({ children, className = '' }) => (
    <div className={`mt-4 ${className}`}>{children}</div>
);

export const TabPanel: React.FC<{
    children: React.ReactNode;
    isActive?: boolean;
    className?: string;
}> = ({ children, isActive, className = '' }) => (
    <div
        className={`
            ${isActive ? 'block' : 'hidden'}
            ${className}
        `}
    >
        {children}
    </div>
);

export default Tabs; 