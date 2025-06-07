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

interface SoundscapeProps {
    compact?: boolean;
    volume?: number;
    onVolumeChange?: (volume: number) => void;
    selectedSound?: string | null;
    onSoundSelect?: (soundId: string | null) => void;
}

const Soundscape: React.FC<SoundscapeProps> = ({
    compact = false,
    volume = 0.5,
    onVolumeChange,
    selectedSound: externalSelectedSound,
    onSoundSelect: externalOnSoundSelect
}) => {
    const [selectedSound, setSelectedSound] = useState<string | null>(externalSelectedSound || null);
    const [error, setError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const { currentTheme } = useTheme();

    // Sync with external state
    useEffect(() => {
        if (externalSelectedSound !== undefined) {
            setSelectedSound(externalSelectedSound);
        }
    }, [externalSelectedSound]);

    // Preload ambient sounds
    useEffect(() => {
        const preloadedAudios: HTMLAudioElement[] = [];
        sounds.forEach(sound => {
            const audio = document.createElement('audio');
            audio.preload = 'auto';
            audio.src = sound.audioUrl;
            preloadedAudios.push(audio);
        });

        return () => {
            preloadedAudios.forEach(audio => {
                audio.src = '';
                audio.removeAttribute('src');
            });
        };
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
            externalOnSoundSelect?.(null);
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
            externalOnSoundSelect?.(soundId);
            setError(null);
        } catch (err) {
            setError('Failed to play audio. Please check your browser settings.');
        }
    };

    return (
        <div className={`${compact ? '' : 'bg-white/10 backdrop-blur-md rounded-xl p-6'}`}>
            <div className="flex items-center justify-between mb-4">
                {!compact && <h2 className="text-xl font-semibold">Ambient Sounds</h2>}
            </div>
            <div className={`grid ${compact ? 'grid-cols-4' : 'grid-cols-3'} gap-2`}>
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
                        <span className={`text-xs ${compact ? 'hidden' : ''}`}>{sound.name}</span>
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

export default React.memo(Soundscape); 
