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
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                            currentTheme.id === theme.id
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
        <div className="p-6 bg-white/5 backdrop-blur-lg rounded-xl shadow-xl border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">Select Theme</h2>
            <div className="grid grid-cols-1 gap-4">
                {availableThemes.map((theme) => (
                    <button
                        key={theme.id}
                        onClick={() => setTheme(theme.id)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 font-medium 
                        ${currentTheme.id === theme.id
                                ? 'border-blue-500 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl'
                                : 'border-slate-600 bg-gradient-to-r from-slate-700 to-slate-800 text-white hover:border-slate-500 hover:from-slate-600 hover:to-slate-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                            }`}
                    >
                        <h3 className="font-medium">{theme.name}</h3>
                        <p className="text-sm text-slate-300 mt-1">{theme.description}</p>
                    </button>
                ))}
            </div>
        </div>
    );
}; 
