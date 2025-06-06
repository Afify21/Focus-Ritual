import React from 'react';
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
    const soundscapes = [
        { id: 'library', name: 'Library', description: 'Scholarly', icon: 'book' },
        { id: 'night', name: 'Night', description: 'Peaceful', icon: 'moon' },
        { id: 'fireplace', name: 'Fireplace', description: 'Cozy', icon: 'fire' },
        { id: 'rain', name: 'Rain', description: 'Relaxing', icon: 'cloud-rain' }
    ];

    return (
        <div className="gradient-bg rounded-xl p-6 mb-8 shadow-lg border border-gray-800">
            <h3 className="text-xl font-bold mb-4 glow-teal flex items-center">
                {/* Replace with actual icon component */}
                <i className="fas fa-volume-up text-teal-400 mr-2"></i>
                Soundscapes
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {soundscapes.map(sound => (
                    <button
                        key={sound.id}
                        onClick={() => onSoundSelect(sound.id === selectedSound ? null : sound.id)}
                        className={`bg-gradient-to-b from-gray-800/50 hover:from-teal-900/20 to-gray-900/80 hover:to-teal-900/10 border border-gray-700/50 hover:border-teal-400/50 rounded-xl p-5 transition-all duration-300 group shadow hover:shadow-teal-500/10 backdrop-blur-sm ${selectedSound === sound.id ? 'from-teal-900/20 to-teal-900/10 border-teal-400/50' : ''
                            }`}
                    >
                        <i className={`fas fa-${sound.icon} text-teal-400 text-2xl mb-2`}></i>
                        <p className="font-medium">{sound.name}</p>
                        <p className="text-sm text-gray-400 group-hover:text-gray-300">{sound.description}</p>
                    </button>
                ))}
            </div>
            <div className="mt-6">
                <div className="flex items-center space-x-4">
                    {/* Replace with actual icon component */}
                    <i className="fas fa-volume-off text-gray-400"></i>
                    {/* TODO: Connect input range to volume state and handler */}
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={onVolumeChange}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    {/* Replace with actual icon component */}
                    <i className="fas fa-volume-up text-teal-400"></i>
                </div>
            </div>
        </div>
    );
};

export default SoundscapeControls;
