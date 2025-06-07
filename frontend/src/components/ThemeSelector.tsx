import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid';

interface ThemeSelectorProps {
    compact?: boolean;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ compact = false }) => {
    const { currentTheme, setTheme, availableThemes } = useTheme();

    if (compact) {
        return (
            <div className="grid grid-cols-2 gap-2">
                {availableThemes.map((theme) => (
                    <button
                        key={theme.id}
                        onClick={() => setTheme(theme.id)}
                        className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all duration-200 ${currentTheme.id === theme.id
                            ? 'bg-teal-600/20 hover:bg-teal-600/30 text-teal-100'
                            : 'gradient-bg hover:bg-opacity-80 text-slate-300'
                            }`}
                    >
                        <span className="text-sm font-medium">{theme.name}</span>
                        <span className="text-xs text-slate-400 mt-1">{theme.description?.split(' ')[0]}</span>
                    </button>
                ))}
            </div>
        );
    }

    return (
        <div className="gradient-bg backdrop-blur-lg rounded-xl shadow-xl border border-gray-800 relative">
            <h2 className="text-xl font-semibold text-white mb-4">Select Theme</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableThemes.map((theme) => (
                    <button
                        key={theme.id}
                        onClick={() => setTheme(theme.id)}
                        className={`text-left p-3 rounded-lg border transition-all duration-200 ${currentTheme.id === theme.id
                            ? 'border-teal-500 bg-teal-600/20 text-white'
                            : 'border-slate-600 gradient-bg text-white hover:border-slate-500 hover:bg-opacity-80'
                            }`}
                    >
                        <h3 className="font-medium text-sm">{theme.name}</h3>
                        <p className="text-xs text-slate-300 mt-1">{theme.description}</p>
                    </button>
                ))}
            </div>
        </div>
    );
}; 
