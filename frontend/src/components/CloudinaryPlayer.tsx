import React, { useState, useEffect } from 'react';

interface CloudinaryPlayerProps {
  videoUrl: string;
  title?: string;
}

const CloudinaryPlayer: React.FC<CloudinaryPlayerProps> = ({ videoUrl, title = 'Video Player' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Log the video URL when component mounts
    console.log('Video URL:', videoUrl);
  }, [videoUrl]);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handleIframeError = () => {
    setError('Failed to load video. Please try again.');
    console.error('Iframe failed to load video');
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
        {error && (
          <div className="p-4 text-red-500 bg-red-100">
            {error}
          </div>
        )}
        {!isPlaying ? (
          <div className="relative aspect-video bg-black">
            <button
              onClick={handlePlay}
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 hover:bg-opacity-40 transition-all"
            >
              <div className="text-white text-center">
                <svg
                  className="w-16 h-16 mx-auto mb-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-lg font-semibold">Click to Play</p>
              </div>
            </button>
          </div>
        ) : (
          <div className="aspect-video">
            <iframe
              src={videoUrl}
              className="w-full h-full"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
              title={title}
              onError={handleIframeError}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CloudinaryPlayer; 