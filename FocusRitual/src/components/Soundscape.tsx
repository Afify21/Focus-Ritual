import React, { useState, useEffect, useRef } from 'react';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { useTheme } from '../context/ThemeContext';

interface Sound {
    id: string;
    name: string;
    icon: string;
    audioUrl: string;
}

const sounds: Sound[] = [
    {
        id: 'rain',
        name: 'Rain',
        icon: '🌧️',
        audioUrl: 'https://res.cloudinary.com/dmouna8ru/video/upload/v1748658330/rain.mp3_yyqqdk.mov'
    },
    {
        id: 'fireplace',
        name: 'Fireplace',
        icon: '🔥',
        audioUrl: 'https://res.cloudinary.com/dmouna8ru/video/upload/v1748658326/Fireplace_hztxh2.mov'
    },
    {
        id: 'night',
        name: 'Night',
        icon: '🌙',
        audioUrl: 'https://res.cloudinary.com/dmouna8ru/video/upload/v1748658654/night_qnkzkz.mov'
    },
    {
        id: 'library',
        name: 'Library',
        icon: '📚',
        audioUrl: 'https://res.cloudinary.com/dmouna8ru/video/upload/v1748658336/librarysounds_caxbfr.mov'
    }
];

const Soundscape: React.FC = () => {
    const [selectedSound, setSelectedSound] = useState<string | null>(null);
    const [volume, setVolume] = useState(0.5);
    const [error, setError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const { currentTheme } = useTheme();

    // Preload ambient sounds
    useEffect(() => {
        sounds.forEach(sound => {
            const audio = document.createElement('audio');
            audio.preload = 'auto';
            audio.src = sound.audioUrl;
        });
    }, []); // Empty dependency array means this runs once on mount

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    const handleSoundSelect = async (soundId: string) => {
        if (selectedSound === soundId) {
            // Stop the sound if it's already playing
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            setSelectedSound(null);
            return;
        }

        const sound = sounds.find(s => s.id === soundId);
        if (!sound) return;

        try {
            if (audioRef.current) {
                audioRef.current.pause();
            }

            const audio = new Audio(sound.audioUrl);
            audio.loop = true;
            audio.volume = volume;

            audio.addEventListener('error', () => {
                setError('Failed to play audio. Please try again.');
            });

            await audio.play();
            audioRef.current = audio;
            setSelectedSound(soundId);
            setError(null);
        } catch (err) {
            setError('Failed to play audio. Please check your browser settings.');
        }
    };

    return (
        <div className={`backdrop-blur-lg rounded-xl p-6 ${currentTheme.id !== 'default' ? 'bg-white/30' : 'bg-white/5'}`}>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Ambient Sounds</h2>
                <div className="flex items-center space-x-2">
                    <span className="text-white text-sm">🔊</span>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        style={{
                            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${volume * 100}%, #4b5563 ${volume * 100}%, #4b5563 100%)`
                        }}
                    />
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                {sounds.map((sound) => (
                    <button
                        key={sound.id}
                        onClick={() => handleSoundSelect(sound.id)}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${selectedSound === sound.id
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-slate-700/50 hover:bg-slate-600/50'
                            }`}
                    >
                        <span className="text-xl mb-1">{sound.icon}</span>
                        <span className="text-xs">{sound.name}</span>
                    </button>
                ))}
            </div>
            {error && (
                <div className="mt-4 text-red-400 text-sm text-center">
                    {error}
                </div>
            )}
        </div>
    );
};

export default Soundscape; 