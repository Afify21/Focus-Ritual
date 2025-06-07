import React, { useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
// TODO: Import actual icon components if using react-icons or similar

// Define props interface
interface SoundscapeControlsProps {
    volume: number;
    onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    selectedSound: string | null;
    onSoundSelect: (sound: string | null) => void;
}

const SoundscapeControls: React.FC<SoundscapeControlsProps> = ({
    volume,
    onVolumeChange,
    selectedSound,
    onSoundSelect
}) => {
    const { currentTheme } = useTheme();
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const soundscapes = [
        { id: 'library', name: 'Library', description: 'Scholarly', icon: 'book' },
        { id: 'night', name: 'Night', description: 'Peaceful', icon: 'moon' },
        { id: 'fireplace', name: 'Fireplace', description: 'Cozy', icon: 'fire' },
        { id: 'rain', name: 'Rain', description: 'Relaxing', icon: 'cloud-rain' }
    ];

    // Effect to handle audio playback
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.removeAttribute('src');
            audioRef.current.load();
        }

        if (selectedSound && currentTheme.soundscapes[selectedSound as keyof typeof currentTheme.soundscapes]) {
            const soundUrl = currentTheme.soundscapes[selectedSound as keyof typeof currentTheme.soundscapes];
            audioRef.current = new Audio(soundUrl);
            audioRef.current.loop = true;
            audioRef.current.volume = volume / 100; // Set initial volume
            audioRef.current.play().catch(error => console.error('Error playing soundscape:', error));
        } else {
            audioRef.current = null; // Clear audio element if no sound is selected
        }

        // Cleanup function
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.removeAttribute('src');
                audioRef.current.load();
                audioRef.current = null; // Ensure cleanup clears the ref
            }
        };
    }, [selectedSound, currentTheme.soundscapes]); // Re-run effect when selectedSound or theme soundscapes change

    // Effect to handle volume changes
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume / 100;
        }
    }, [volume]); // Re-run effect when volume changes

    return (
        <div className="gradient-bg rounded-lg p-4 shadow-lg border border-gray-800">
            <h3 className="text-base font-bold mb-3 glow-teal flex items-center">
                <i className="fas fa-volume-up text-teal-400 mr-2"></i>
                Ambient Sounds
            </h3>
            <div className="grid grid-cols-2 gap-2">
                {soundscapes.map(sound => (
                    <button
                        key={sound.id}
                        onClick={() => onSoundSelect(sound.id === selectedSound ? null : sound.id)}
                        className={`bg-gradient-to-b from-gray-800/50 hover:from-teal-900/20 to-gray-900/80 hover:to-teal-900/10 border border-gray-700/50 hover:border-teal-400/50 rounded-lg p-2 transition-all duration-300 group shadow hover:shadow-teal-500/10 backdrop-blur-sm ${selectedSound === sound.id ? 'from-teal-900/20 to-teal-900/10 border-teal-400/50' : ''}`}
                    >
                        <div className="flex flex-col items-center">
                            <i className={`fas fa-${sound.icon} text-teal-400 text-lg mb-1`}></i>
                            <div className="text-center">
                                <p className="font-medium text-xs">{sound.name}</p>
                                <p className="text-[10px] text-gray-400 group-hover:text-gray-300">{sound.description}</p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
            <div className="mt-3">
                <div className="flex items-center space-x-2">
                    <i className="fas fa-volume-off text-gray-400 text-sm"></i>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={onVolumeChange}
                        className="w-full h-1.5 bg-gray-700 rounded appearance-none cursor-pointer"
                    />
                    <i className="fas fa-volume-up text-teal-400 text-sm"></i>
                </div>
            </div>
        </div>
    );
};

export default SoundscapeControls;
