import React, { useState } from 'react';
import { XMarkIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/24/solid';

interface YouTubePlayerProps {
    onClose: () => void;
    isFocusMode: boolean;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ onClose, isFocusMode }) => {
    const [url, setUrl] = useState('');
    const [videoId, setVideoId] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    const extractVideoId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const id = extractVideoId(url);
        if (id) {
            setVideoId(id);
        }
    };

    return (
        <div className={`fixed ${isFocusMode ? 'right-0 top-0 h-full w-1/2' : 'bottom-4 left-4 w-80'} z-50 transition-all duration-300`}>
            <div className={`relative ${isFocusMode ? 'h-full' : ''} bg-slate-800 rounded-xl overflow-hidden shadow-lg`}>
                <div className="absolute top-4 right-4 z-10 flex space-x-2">
                    {!isFocusMode && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
                        >
                            {isExpanded ? (
                                <ArrowsPointingInIcon className="h-5 w-5" />
                            ) : (
                                <ArrowsPointingOutIcon className="h-5 w-5" />
                            )}
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                {videoId ? (
                    <div className={`w-full ${isFocusMode ? 'h-full' : isExpanded ? 'h-[400px]' : 'aspect-video'}`}>
                        <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="rounded-xl"
                        />
                    </div>
                ) : (
                    <div className="p-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="Enter YouTube URL"
                                className="w-full px-4 py-2 rounded-lg bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-600"
                            />
                            <button
                                type="submit"
                                className="w-full px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-700 transition-colors"
                            >
                                Load Video
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default YouTubePlayer; 