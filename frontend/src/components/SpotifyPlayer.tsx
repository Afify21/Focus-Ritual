import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlayCircleIcon, MusicalNoteIcon, PauseIcon, PlayIcon } from '@heroicons/react/24/solid';

interface SpotifyPlayerProps {
    onClose: () => void;
    isFocusMode: boolean;
}

// Spotify Web Playback SDK Types
interface SpotifyPlayerInstance {
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
const CLIENT_ID = '48cf29a596a04ac28e2a7755277510a7';
const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI || 'http://localhost:3000/callback';
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
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [spotifyPlayer, setSpotifyPlayer] = useState<SpotifyPlayerInstance | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [userPlaylists, setUserPlaylists] = useState<any[]>([]);
    const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

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
            localStorage.setItem('spotify_access_token', hash.access_token);
            window.history.pushState('', document.title, window.location.pathname);
            fetchUserPlaylists(hash.access_token);
        }

        // Check if we have a token in localStorage
        const storedToken = localStorage.getItem('spotify_access_token');
        if (storedToken) {
            setAccessToken(storedToken);
            setIsAuthenticated(true);
            fetchUserPlaylists(storedToken);
        }
    }, []);

    const fetchUserPlaylists = async (token: string) => {
        try {
            const response = await fetch('https://api.spotify.com/v1/me/playlists', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setUserPlaylists(data.items);
        } catch (err) {
            setError('Failed to fetch playlists');
        }
    };

    const handleConnect = () => {
        const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPES.join('%20')}&response_type=token&show_dialog=true`;
        window.location.href = authUrl;
    };

    const handlePlaylistSelect = async (playlistId: string) => {
        if (!accessToken) {
            setError('Please connect your Spotify account first');
            return;
        }

        setIsAuthenticated(true);
        setError(null);
        setSelectedPlaylist(playlistId);

        try {
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
                        setSpotifyPlayer(player);
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
                                setIsPlaying(true);
                            });
                    }
                });

                // Add event listeners
                player.addListener('player_state_changed', state => {
                    setIsPlaying(!state.paused);
                });
            };

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load playlist');
        }
    };

    const togglePlayback = async () => {
        if (spotifyPlayer) {
            try {
                await spotifyPlayer.togglePlay();
                setIsPlaying(!isPlaying);
            } catch (err) {
                setError('Failed to toggle playback');
            }
        }
    };

    const handleLogout = () => {
        if (spotifyPlayer) {
            spotifyPlayer.disconnect();
        }
        localStorage.removeItem('spotify_access_token');
        setAccessToken(null);
        setIsAuthenticated(false);
        setSpotifyPlayer(null);
        setUserPlaylists([]);
        setSelectedPlaylist(null);
        setIsPlaying(false);
    };

    return (
        <div className={`bg-slate-800 rounded-xl overflow-hidden shadow-lg transition-all duration-300 ${isExpanded ? 'w-full' : 'w-full'}`}>
            <div className="p-4 bg-slate-700 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Spotify Player</h3>
                <div className="flex space-x-2">
                    {spotifyPlayer && (
                        <button
                            onClick={togglePlayback}
                            className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                        >
                            {isPlaying ? (
                                <PauseIcon className="h-5 w-5" />
                            ) : (
                                <PlayIcon className="h-5 w-5" />
                            )}
                        </button>
                    )}
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
                {!isAuthenticated ? (
                    <div className="text-center">
                        <p className="mb-4">Connect your Spotify account to play your playlists</p>
                        <button
                            onClick={handleConnect}
                            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg flex items-center justify-center space-x-2 mx-auto"
                        >
                            <MusicalNoteIcon className="h-5 w-5" />
                            <span>Connect Spotify</span>
                        </button>
                    </div>
                ) : (
                    <div>
                        {userPlaylists.length > 0 ? (
                            <div className="space-y-4">
                                <h4 className="font-semibold mb-2">Your Playlists</h4>
                                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                                    {userPlaylists.map((playlist) => (
                                        <button
                                            key={playlist.id}
                                            onClick={() => handlePlaylistSelect(playlist.id)}
                                            className={`p-2 rounded-lg text-left hover:bg-slate-700 transition-colors ${selectedPlaylist === playlist.id ? 'bg-slate-700' : ''
                                                }`}
                                        >
                                            <div className="flex items-center space-x-2">
                                                {playlist.images[0] && (
                                                    <img
                                                        src={playlist.images[0].url}
                                                        alt={playlist.name}
                                                        className="w-10 h-10 rounded"
                                                    />
                                                )}
                                                <div>
                                                    <div className="font-medium">{playlist.name}</div>
                                                    <div className="text-sm text-slate-400">
                                                        {playlist.tracks.total} tracks
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="text-slate-400 hover:text-white text-sm"
                                >
                                    Disconnect Spotify
                                </button>
                            </div>
                        ) : (
                            <div className="text-center">
                                <p>Loading your playlists...</p>
                            </div>
                        )}
                    </div>
                )}

                {error && (
                    <div className="mt-4 p-2 bg-red-500/20 text-red-500 rounded-lg text-sm">
                        {error}
                    </div>
                )}
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
            }) => SpotifyPlayerInstance;
        };
        onSpotifyWebPlaybackSDKReady: () => void;
    }
}

export default SpotifyPlayer; 