import React, { useState, useEffect, useRef } from 'react';
import { SpeakerWaveIcon } from '@heroicons/react/24/solid';

interface Sound {
    id: string;
    name: string;
    icon: string;
    audioUrl: string;
}

const sounds: Sound[] = [
    { id: 'rain', name: 'Rain', icon: '🌧️', audioUrl: '' },
    { id: 'fireplace', name: 'Fireplace', icon: '🔥', audioUrl: '' },
    { id: 'lofi', name: 'Lo-fi Beats', icon: '🎵', audioUrl: '' },
    { id: 'library', name: 'Library', icon: '📚', audioUrl: '' },
];

const Soundscape: React.FC = () => {
    const [selectedSound, setSelectedSound] = useState<string | null>(null);
    const [volume, setVolume] = useState(0.5);
    const [error, setError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    const initAudio = async () => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new AudioContext();
            }
        } catch (err) {
            setError('Failed to initialize audio. Please check your browser settings.');
        }
    };

    useEffect(() => {
        initAudio();
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

            await audio.load();
            await audio.play();
            audioRef.current = audio;
            setSelectedSound(soundId);
            setError(null);
        } catch (err) {
            setError('Failed to play audio. Please check your browser settings.');
        }
    };

    return (
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4">
            <h2 className="text-xl font-semibold mb-4">Soundscape</h2>
            {error && (
                <div className="text-red-400 text-sm mb-4">{error}</div>
            )}
            <div className="grid grid-cols-4 gap-2">
                {sounds.map((sound) => (
                    <button
                        key={sound.id}
                        onClick={() => handleSoundSelect(sound.id)}
                        className={`p-1.5 rounded-lg flex flex-col items-center justify-center transition-colors ${selectedSound === sound.id
                            ? 'bg-slate-600'
                            : 'bg-slate-700 hover:bg-slate-600'
                            }`}
                    >
                        <span className="text-lg mb-0.5">{sound.icon}</span>
                        <span className="text-[10px]">{sound.name}</span>
                    </button>
                ))}
            </div>
            {selectedSound && (
                <div className="mt-4">
                    <div className="flex items-center space-x-2">
                        <SpeakerWaveIcon className="h-5 w-5 text-slate-300" />
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Soundscape; 