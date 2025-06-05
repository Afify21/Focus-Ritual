import React, { createContext, useContext, useState, useEffect } from 'react';
import { Theme, themes } from '../config/themes';

interface ThemeContextType {
    currentTheme: Theme;
    setTheme: (themeId: string) => void;
    availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);
    const [availableThemes] = useState<Theme[]>(themes);

    const setTheme = (themeId: string) => {
        const theme = themes.find(t => t.id === themeId);
        if (theme) {
            setCurrentTheme(theme);
        }
    };

    // Apply theme class to body
    useEffect(() => {
        document.body.classList.remove(...availableThemes.map(t => `theme-${t.id}`));
        document.body.classList.add(`theme-${currentTheme.id}`);

        // Set CSS variables for theme colors
        Object.entries(currentTheme.colors).forEach(([key, value]) => {
            document.body.style.setProperty(`--${key}`, value);
        });
    }, [currentTheme, availableThemes]);

    return (
        <ThemeContext.Provider value={{ currentTheme, setTheme, availableThemes }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}; 