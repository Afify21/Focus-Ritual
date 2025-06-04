import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface ThemeSelectorProps {
    compact?: boolean;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ compact = false }) => {
    const { currentTheme, setTheme, availableThemes } = useTheme();

    if (compact) {
        return (
            <>
                {availableThemes.map((theme) => (
                    <button
                        key={theme.id}
                        onClick={() => setTheme(theme.id)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${currentTheme.id === theme.id
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : 'bg-slate-600 hover:bg-slate-700'
                            }`}
                    >
                        {theme.name}
                    </button>
                ))}
            </>
        );
    }

    return (
        <div className="p-4 bg-white/5 backdrop-blur-lg rounded-xl shadow-xl border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">Select Theme</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableThemes.map((theme) => (
                    <button
                        key={theme.id}
                        onClick={() => setTheme(theme.id)}
                        className={`text-left p-3 rounded-lg border transition-all duration-200 ${currentTheme.id === theme.id
                                ? 'border-blue-500 bg-blue-600/20 text-white'
                                : 'border-slate-600 bg-slate-700/20 text-white hover:border-slate-500 hover:bg-slate-600/20'
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
