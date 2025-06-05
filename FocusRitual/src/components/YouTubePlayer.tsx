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
        <div className={`${isFocusMode ? 'h-full w-full' : 'h-full w-full'} z-50 transition-all duration-300 flex flex-col flex-1 min-h-0`} style={{ background: 'var(--window-bg, #23232B)', color: 'var(--window-text, #F6E3B0)', borderRadius: 12 }}>
            <div className="absolute top-10 right-4 z-10 flex space-x-2">
                <button
                    onClick={onClose}
                    className="p-2 rounded-lg"
                    style={{ background: 'var(--window-header-bg, #334155)', color: 'var(--window-header-text, #fff)' }}
                >
                    <XMarkIcon className="h-5 w-5" />
                </button>
            </div>
            {videoId ? (
                <div className="flex-1 w-full h-full flex flex-col min-h-0 relative overflow-hidden">
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full min-h-0 min-w-0 block pointer-events-auto aspect-video bg-[var(--window-bg,#23232B)]"
                        style={{ height: '100%', width: '100%' }}
                    />
                </div>
            ) : (
                <div className="p-4 h-full flex flex-col items-center justify-center flex-1 min-h-0" style={{ background: 'var(--window-bg, #23232B)' }}>
                    <form onSubmit={handleSubmit} className="space-y-4 w-full">
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Enter YouTube URL"
                            className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
                            style={{ background: 'var(--window-bg, #23232B)', color: 'var(--window-text, #F6E3B0)', border: '1px solid var(--window-border, #BFA77A)' }}
                        />
                        <button
                            type="submit"
                            className="w-full px-4 py-2 rounded-lg transition-colors"
                            style={{ background: 'var(--window-header-bg, #334155)', color: 'var(--window-header-text, #fff)' }}
                        >
                            Load Video
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default YouTubePlayer; 