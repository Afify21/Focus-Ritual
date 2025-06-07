import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { useTheme } from '../context/ThemeContext';

const RitualBuilder: React.FC = () => {
    const [rituals, setRituals] = useState<string[]>([]);
    const [newRitual, setNewRitual] = useState('');
    const { currentTheme } = useTheme();

    const handleAddRitual = () => {
        if (newRitual.trim()) {
            setRituals([...rituals, newRitual.trim()]);
            setNewRitual('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddRitual();
        }
    };

    const handleDeleteRitual = (index: number) => {
        setRituals(rituals.filter((_, i) => i !== index));
    };

    return (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-xl border border-white/10">
            <h2 className="text-xl font-semibold mb-4">Ritual Builder</h2>
            <div className="space-y-4">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={newRitual}
                        onChange={(e) => setNewRitual(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Add a ritual step..."
                        className="flex-1 px-3 py-2 rounded bg-white/10 border border-white/20 focus:outline-none focus:border-purple-500 text-white"
                    />
                    <button
                        onClick={handleAddRitual}
                        className="px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-700 transition-colors"
                    >
                        Add Item
                    </button>
                </div>
                <ul className="space-y-2">
                    {rituals.map((ritual, index) => (
                        <li
                            key={index}
                            className="flex items-center justify-between p-2 rounded bg-white/5"
                        >
                            <span>{ritual}</span>
                            <button
                                onClick={() => handleDeleteRitual(index)}
                                className="text-red-400 hover:text-red-300"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default RitualBuilder; 