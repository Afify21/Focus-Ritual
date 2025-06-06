import React, { useState } from 'react';
import { XMarkIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

interface YouTubePlayerProps {
    onClose: () => void;
    isFocusMode: boolean;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ onClose, isFocusMode }) => {
    const [url, setUrl] = useState('');
    const [videoId, setVideoId] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const extractVideoId = (url: string) => {
        // Support for various YouTube URL formats
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/watch\?.*&v=)([^#&?]*).*/,
            /youtube\.com\/shorts\/([^#&?]*).*/,
            /youtube\.com\/watch\?.*v=([^#&?]*).*/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1] && match[1].length === 11) {
                return match[1];
            }
        }
        return null;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const id = extractVideoId(url);
            if (id) {
                setVideoId(id);
            } else {
                setError('Invalid YouTube URL. Please enter a valid YouTube video link.');
            }
        } catch (err) {
            setError('An error occurred while processing the URL.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setUrl('');
        setVideoId('');
        setError(null);
    };

    return (
        <div className={`${isFocusMode ? 'h-full w-full' : 'fixed bottom-4 left-4 w-80'} z-50 transition-all duration-300`}>
            <div className={`relative ${isFocusMode ? 'h-full' : ''} bg-slate-800 rounded-xl overflow-hidden shadow-lg`}>
                <div className="absolute top-4 right-4 z-10 flex space-x-2">
                    {!isFocusMode && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
                            title={isExpanded ? "Collapse" : "Expand"}
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
                        title="Close"
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
                            className="rounded-xl w-full h-full"
                        />
                        <button
                            onClick={handleClear}
                            className="absolute bottom-4 right-4 p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
                            title="Clear video"
                        >
                            <ArrowPathIcon className="h-5 w-5" />
                        </button>
                    </div>
                ) : (
                    <div className="p-4 h-full flex items-center justify-center">
                        <form onSubmit={handleSubmit} className="space-y-4 w-full">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={url}
                                    onChange={(e) => {
                                        setUrl(e.target.value);
                                        setError(null);
                                    }}
                                    placeholder="Paste YouTube URL here"
                                    className="w-full px-4 py-2 rounded-lg bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-600 pr-10"
                                    disabled={isLoading}
                                />
                                {url && (
                                    <button
                                        type="button"
                                        onClick={handleClear}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-slate-600 transition-colors"
                                        title="Clear input"
                                    >
                                        <XMarkIcon className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                            {error && (
                                <div className="text-red-400 text-sm">
                                    {error}
                                </div>
                            )}
                            <button
                                type="submit"
                                className="w-full px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isLoading || !url.trim()}
                            >
                                {isLoading ? 'Loading...' : 'Load Video'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default YouTubePlayer; 