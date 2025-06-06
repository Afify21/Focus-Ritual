import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid';

const ThemeSelector: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="flex items-center justify-between">
            <button
                onClick={toggleTheme}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-opacity-20 hover:bg-opacity-30 transition-all duration-200"
            >
                {theme === 'dark' ? (
                    <>
                        <SunIcon className="h-5 w-5 text-yellow-400" />
                        <span className="text-sm">Light Mode</span>
                    </>
                ) : (
                    <>
                        <MoonIcon className="h-5 w-5 text-blue-400" />
                        <span className="text-sm">Dark Mode</span>
                    </>
                )}
            </button>
        </div>
    );
};

export default ThemeSelector; 