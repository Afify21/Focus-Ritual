import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlayCircleIcon } from '@heroicons/react/24/solid';

interface SpotifyPlayerProps {
    onClose: () => void;
    isFocusMode: boolean;
}

// Spotify Web Playback SDK Types
interface SpotifyPlayer {
    connect(): Promise<boolean>;
    disconnect(): void;
    addListener(event: string, callback: (state: any) => void): void;
    removeListener(event: string): void;
    getCurrentState(): Promise<PlaybackState | null>;
    setName(name: string): Promise<void>;
    getVolume(): Promise<number>;
    setVolume(volume: number): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    togglePlay(): Promise<void>;
    seek(position_ms: number): Promise<void>;
    previousTrack(): Promise<void>;
    nextTrack(): Promise<void>;
    play(options?: { uris?: string[] }): Promise<void>;
}

interface PlaybackState {
    context: {
        uri: string;
        metadata: Record<string, unknown>;
    };
    disallows: {
        pausing: boolean;
        peeking_next: boolean;
        peeking_prev: boolean;
        resuming: boolean;
        seeking: boolean;
        skipping_next: boolean;
        skipping_prev: boolean;
    };
    duration: number;
    paused: boolean;
    position: number;
    repeat_mode: number;
    shuffle: boolean;
    track_window: {
        current_track: Track;
        previous_tracks: Track[];
        next_tracks: Track[];
    };
}

interface Track {
    uri: string;
    id: string;
    type: string;
    media_type: string;
    name: string;
    is_playable: boolean;
    album: {
        uri: string;
        name: string;
        images: { url: string }[];
    };
    artists: {
        uri: string;
        name: string;
    }[];
}

// Replace this with your Spotify Client ID from https://developer.spotify.com/dashboard
const CLIENT_ID = '48cf29a596a04ac28e2a7755277510a7'; // Add your Client ID here
const REDIRECT_URI = 'http://localhost:3000'; // Make sure this matches your Spotify app settings
const SCOPES = [
    'streaming',
    'user-read-email',
    'user-read-private',
    'user-read-playback-state',
    'user-modify-playback-state',
    'playlist-read-private',
    'playlist-read-collaborative'
];

const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({ onClose, isFocusMode }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [playlistUrl, setPlaylistUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [player, setPlayer] = useState<SpotifyPlayer | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check if we have a token in the URL (after redirect)
        const hash = window.location.hash
            .substring(1)
            .split('&')
            .reduce((initial: { [key: string]: string }, item) => {
                if (item) {
                    const parts = item.split('=');
                    initial[parts[0]] = decodeURIComponent(parts[1]);
                }
                return initial;
            }, {});

        if (hash.access_token) {
            setAccessToken(hash.access_token);
            setIsAuthenticated(true);
            window.history.pushState('', document.title, window.location.pathname);
        }

        // Check if we have a token in localStorage
        const storedToken = localStorage.getItem('spotify_access_token');
        if (storedToken) {
            setAccessToken(storedToken);
            setIsAuthenticated(true);
        }
    }, []);

    const handleConnect = () => {
        const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPES.join('%20')}&response_type=token&show_dialog=true`;
        window.location.href = authUrl;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accessToken) {
            setError('Please connect your Spotify account first');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Extract playlist ID from URL
            const playlistId = playlistUrl.split('/').pop()?.split('?')[0];
            if (!playlistId) {
                throw new Error('Invalid playlist URL');
            }

            // Initialize Spotify Web Playback SDK
            const script = document.createElement('script');
            script.src = 'https://sdk.scdn.co/spotify-player.js';
            script.async = true;
            document.body.appendChild(script);

            window.onSpotifyWebPlaybackSDKReady = () => {
                const player = new window.Spotify.Player({
                    name: 'FocusRitual Player',
                    getOAuthToken: cb => cb(accessToken),
                    volume: 0.5
                });

                player.connect().then((success: boolean) => {
                    if (success) {
                        console.log('Successfully connected to Spotify!');
                        setPlayer(player);
                        // Start playing the playlist
                        fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
                            headers: {
                                'Authorization': `Bearer ${accessToken}`
                            }
                        })
                            .then(response => response.json())
                            .then(data => {
                                const uris = data.tracks.items.map((item: any) => item.track.uri);
                                player.play({
                                    uris: uris
                                });
                            });
                    }
                });
            };

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load playlist');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`bg-slate-800 rounded-xl overflow-hidden shadow-lg transition-all duration-300 ${isExpanded ? 'w-full' : 'w-full'
            }`}>
            <div className="p-4 bg-slate-700 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Spotify Player</h3>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                    >
                        <PlayCircleIcon className="h-5 w-5" />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
            <div className="p-4">
                {error && (
                    <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded-lg">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="playlist" className="block text-sm font-medium text-slate-300 mb-2">
                            Enter Spotify Playlist URL
                        </label>
                        <input
                            type="text"
                            id="playlist"
                            value={playlistUrl}
                            onChange={(e) => setPlaylistUrl(e.target.value)}
                            placeholder="https://open.spotify.com/playlist/..."
                            className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:border-slate-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || !isAuthenticated}
                        className="w-full px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Loading...' : 'Load Playlist'}
                    </button>
                </form>
                <div className="mt-4 text-center text-slate-400">
                    <p>{isAuthenticated ? 'Connected to Spotify' : 'Connect your Spotify account to play music'}</p>
                    {!isAuthenticated && (
                        <button
                            onClick={handleConnect}
                            className="mt-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 transition-colors"
                        >
                            Connect Spotify
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Add Spotify SDK types
declare global {
    interface Window {
        Spotify: {
            Player: new (config: {
                name: string;
                getOAuthToken: (cb: (token: string) => void) => void;
                volume?: number;
            }) => SpotifyPlayer;
        };
        onSpotifyWebPlaybackSDKReady: () => void;
    }
}

export default SpotifyPlayer; 