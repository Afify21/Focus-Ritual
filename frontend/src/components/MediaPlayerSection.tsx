import React from 'react';
// TODO: Import actual YouTube and Spotify player components when available
// TODO: Import actual icon components if using react-icons or similar

// Define props interface
interface MediaPlayerSectionProps {
    showYouTube: boolean;
    showSpotify: boolean;
    onToggleYouTube: () => void;
    onToggleSpotify: () => void;
}

const MediaPlayerSection: React.FC<MediaPlayerSectionProps> = ({
    showYouTube,
    showSpotify,
    onToggleYouTube,
    onToggleSpotify,
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* YouTube Player */}
            <div className="gradient-bg rounded-xl p-6 shadow-lg border border-gray-800">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold flex items-center">
                        {/* Replace with actual icon component */}
                        <i className="fab fa-youtube text-red-500 mr-2"></i>
                        <span className="glow-teal">YouTube</span>
                    </h3>
                    <button
                        className="text-white bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-full text-sm transition"
                        onClick={onToggleYouTube}
                    >
                        {showYouTube ? 'Hide Player' : 'Show Player'}
                    </button>
                </div>
                {showYouTube ? (
                    <div className="bg-gray-900 rounded-lg aspect-video">
                        {/* YouTube Player Component */}
                        <div className="w-full h-full flex items-center justify-center">
                            <i className="fab fa-youtube text-4xl text-red-500"></i>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center">
                        <i className="fab fa-youtube text-4xl text-red-500"></i>
                    </div>
                )}
            </div>

            {/* Spotify Player */}
            <div className="gradient-bg rounded-xl p-6 shadow-lg border border-gray-800">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold flex items-center">
                        {/* Replace with actual icon component */}
                        <i className="fab fa-spotify text-green-500 mr-2"></i>
                        <span className="glow-teal">Spotify</span>
                    </h3>
                    <button
                        className="text-white bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-full text-sm transition"
                        onClick={onToggleSpotify}
                    >
                        {showSpotify ? 'Hide Player' : 'Show Player'}
                    </button>
                </div>
                {showSpotify ? (
                    <div className="bg-gray-900 rounded-lg aspect-video">
                        {/* Spotify Player Component */}
                        <div className="w-full h-full flex items-center justify-center">
                            <i className="fab fa-spotify text-4xl text-green-500"></i>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center">
                        <i className="fab fa-spotify text-4xl text-green-500"></i>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MediaPlayerSection;
