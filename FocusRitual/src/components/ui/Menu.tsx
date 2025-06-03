import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../../styles/theme';

interface MenuItem {
    id: string;
    label: React.ReactNode;
    icon?: React.ReactNode;
    disabled?: boolean;
    onClick?: () => void;
    divider?: boolean;
    submenu?: MenuItem[];
}

interface MenuProps {
    trigger: React.ReactNode;
    items: MenuItem[];
    placement?: 'top' | 'right' | 'bottom' | 'left';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    onOpenChange?: (isOpen: boolean) => void;
    animated?: boolean;
}

const Menu: React.FC<MenuProps> = ({
    trigger,
    items,
    placement = 'bottom',
    size = 'md',
    className = '',
    onOpenChange,
    animated = true,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    const placements = {
        top: 'bottom-full left-0 mb-2',
        right: 'left-full top-0 ml-2',
        bottom: 'top-full left-0 mt-2',
        left: 'right-full top-0 mr-2',
    };

    const sizes = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (
            menuRef.current &&
            !menuRef.current.contains(event.target as Node) &&
            triggerRef.current &&
            !triggerRef.current.contains(event.target as Node)
        ) {
            setIsOpen(false);
            setActiveSubmenu(null);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleTriggerClick = () => {
        setIsOpen(!isOpen);
        onOpenChange?.(!isOpen);
    };

    const handleItemClick = (item: MenuItem) => {
        if (item.disabled) return;
        if (item.submenu) {
            setActiveSubmenu(activeSubmenu === item.id ? null : item.id);
        } else {
            item.onClick?.();
            setIsOpen(false);
            setActiveSubmenu(null);
        }
    };

    const renderMenuItem = (item: MenuItem) => {
        if (item.divider) {
            return <div key={item.id} className="h-px bg-neutral-200 my-1" />;
        }

        const hasSubmenu = !!item.submenu;
        const isSubmenuOpen = activeSubmenu === item.id;

        return (
            <div key={item.id} className="relative">
                <button
                    className={`
                        w-full
                        flex
                        items-center
                        justify-between
                        px-4
                        py-2
                        ${sizes[size]}
                        text-left
                        hover:bg-neutral-100
                        ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    onClick={() => handleItemClick(item)}
                    disabled={item.disabled}
                >
                    <div className="flex items-center space-x-2">
                        {item.icon && (
                            <span className="flex-shrink-0">{item.icon}</span>
                        )}
                        <span>{item.label}</span>
                    </div>
                    {hasSubmenu && (
                        <motion.svg
                            className="w-4 h-4 text-neutral-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            animate={{ rotate: isSubmenuOpen ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <path
                                fillRule="evenodd"
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                            />
                        </motion.svg>
                    )}
                </button>
                {hasSubmenu && isSubmenuOpen && (
                    <div
                        className={`
                            absolute
                            ${placements[placement]}
                            min-w-[200px]
                            bg-white
                            rounded-lg
                            shadow-lg
                            border
                            border-neutral-200
                            py-1
                        `}
                    >
                        {item.submenu?.map(renderMenuItem)}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`relative inline-block ${className}`}>
            <div ref={triggerRef} onClick={handleTriggerClick}>
                {trigger}
            </div>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={menuRef}
                        className={`
                            absolute
                            ${placements[placement]}
                            min-w-[200px]
                            bg-white
                            rounded-lg
                            shadow-lg
                            border
                            border-neutral-200
                            py-1
                            z-50
                        `}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        {items.map(renderMenuItem)}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const MenuItem: React.FC<{
    children: React.ReactNode;
    icon?: React.ReactNode;
    disabled?: boolean;
    onClick?: () => void;
    className?: string;
}> = ({ children, icon, disabled, onClick, className = '' }) => (
    <button
        className={`
            w-full
            flex
            items-center
            space-x-2
            px-4
            py-2
            text-left
            hover:bg-neutral-100
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${className}
        `}
        onClick={onClick}
        disabled={disabled}
    >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span>{children}</span>
    </button>
);

export const MenuDivider: React.FC<{ className?: string }> = ({
    className = '',
}) => <div className={`h-px bg-neutral-200 my-1 ${className}`} />;

export default Menu; 