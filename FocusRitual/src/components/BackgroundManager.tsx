import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

interface BackgroundManagerProps {
    isFocusMode: boolean;
    isPlaying: boolean;
    isBreak: boolean;
    isReset: boolean;
}

const FOCUS_AUDIO = 'https://res.cloudinary.com/dmouna8ru/video/upload/v1748653360/Harry_study_music_trwccg.m4a';
const BREAK_AUDIO = 'https://res.cloudinary.com/dmouna8ru/video/upload/v1748653127/sound1_d8ibyu.mov';

const HARRY_POTTER_BACKGROUNDS = {
    focus: [
        'https://res.cloudinary.com/dmouna8ru/video/upload/v1748656425/background1_z0nqdf.mov',
        'https://res.cloudinary.com/dmouna8ru/video/upload/v1748656419/background2_ftbjyx.mov'
    ],
    break: 'https://res.cloudinary.com/dmouna8ru/image/upload/v1748655258/ariel-j-night-hog-lib_cnunj1.jpg'
};

const VIDEO_ROTATION_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds

export const BackgroundManager: React.FC<BackgroundManagerProps> = ({
    isFocusMode,
    isPlaying,
    isBreak,
    isReset,
}) => {
    const { currentTheme } = useTheme();
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [hasUserInteracted, setHasUserInteracted] = useState(false);
    const [currentFocusBackgroundIndex, setCurrentFocusBackgroundIndex] = useState(0);
    const [volume, setVolume] = useState(0.3); // Default volume at 30%

    // Handle user interaction
    useEffect(() => {
        const handleUserInteraction = () => {
            setHasUserInteracted(true);
            document.removeEventListener('click', handleUserInteraction);
            document.removeEventListener('keydown', handleUserInteraction);
        };

        document.addEventListener('click', handleUserInteraction);
        document.addEventListener('keydown', handleUserInteraction);

        return () => {
            document.removeEventListener('click', handleUserInteraction);
            document.removeEventListener('keydown', handleUserInteraction);
        };
    }, []);

    // Update volume when it changes
    useEffect(() => {
        console.log('Volume state changed:', volume);
        if (audioRef.current) {
            console.log('Setting audio volume to:', volume);
            audioRef.current.volume = volume;
        } else {
            console.log('audioRef.current is not available when volume state changes.');
        }
    }, [volume, audioRef.current]);

    // Handle background rotation every 10 minutes
    useEffect(() => {
        if (!isBreak && currentTheme.id === 'harry-potter' && isPlaying) {
            const interval = setInterval(() => {
                setCurrentFocusBackgroundIndex((prevIndex) =>
                    (prevIndex + 1) % HARRY_POTTER_BACKGROUNDS.focus.length
                );
            }, VIDEO_ROTATION_INTERVAL);

            return () => clearInterval(interval);
        }
    }, [isBreak, currentTheme.id, isPlaying]);

    // Handle audio reset when timer is reset
    useEffect(() => {
        if (isReset && audioRef.current && hasUserInteracted && currentTheme.id === 'harry-potter') {
            const musicPath = isBreak ? BREAK_AUDIO : FOCUS_AUDIO;
            audioRef.current.src = musicPath;
            audioRef.current.load();
            if (isPlaying) {
                audioRef.current.play().catch(error => {
                    console.log('Audio playback failed:', error);
                });
            }
        }
    }, [isReset, isBreak, isPlaying, hasUserInteracted, currentTheme.id]);

    // Update background when break state changes
    useEffect(() => {
        let backgroundPath;

        if (currentTheme.id === 'harry-potter') {
            if (!isPlaying) {
                // Show Hogwarts image when paused
                backgroundPath = HARRY_POTTER_BACKGROUNDS.break;
            } else {
                backgroundPath = isBreak
                    ? HARRY_POTTER_BACKGROUNDS.break
                    : HARRY_POTTER_BACKGROUNDS.focus[currentFocusBackgroundIndex];
            }
        } else {
            backgroundPath = isBreak ? currentTheme.backgrounds.break : currentTheme.backgrounds.focus;
        }

        // Clear previous background/video before setting the new one
        if (videoRef.current) {
            videoRef.current.pause(); // Pause current video if any
            videoRef.current.src = ''; // Clear video source
            document.body.style.backgroundImage = ''; // Clear body background image
        }

        if (videoRef.current) {
            // Check if the background is a video or image
            const isVideo = backgroundPath.endsWith('.mov') || backgroundPath.endsWith('.mp4');

            if (isVideo) {
                videoRef.current.style.display = 'block';
                videoRef.current.src = backgroundPath;
                if (isPlaying && hasUserInteracted) {
                    videoRef.current.load(); // Load the new video source
                    videoRef.current.play().catch(error => {
                        console.log('Video playback failed:', error);
                    });
                }
            } else {
                // If it's an image, hide the video element and set the background image
                videoRef.current.style.display = 'none';
                document.body.style.backgroundImage = `url(${backgroundPath})`;
                document.body.style.backgroundSize = 'cover';
                document.body.style.backgroundPosition = 'center';
                document.body.style.backgroundRepeat = 'no-repeat';
            }
        }
    }, [isBreak, currentTheme, isPlaying, hasUserInteracted, currentFocusBackgroundIndex]);

    // Handle play/pause
    useEffect(() => {
        if (hasUserInteracted) {
            if (videoRef.current) {
                if (isPlaying) {
                    videoRef.current.play().catch(error => {
                        console.log('Video playback failed:', error);
                    });
                } else {
                    videoRef.current.pause();
                }
            }

            if (audioRef.current && currentTheme.id === 'harry-potter') {
                if (isPlaying) {
                    audioRef.current.play().catch(error => {
                        console.log('Audio playback failed:', error);
                    });
                } else {
                    audioRef.current.pause();
                }
            } else if (audioRef.current) {
                // If not Harry Potter theme, ensure audio is paused
                audioRef.current.pause();
            }
        }
    }, [isPlaying, hasUserInteracted, currentTheme.id]);

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        console.log('Slider value changed to:', newVolume);
        setVolume(newVolume);
        // The useEffect hook will handle setting the volume on the audio element
    };

    return (
        <div className={`fixed inset-0 -z-10 overflow-hidden ${currentTheme.id !== 'harry-potter' ? 'bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900' : ''}`}>
            {/* Background Video/Image */}
            <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                loop={true}
                muted
                playsInline
                preload="auto"
            />

            {/* Background Music */}
            <audio
                ref={audioRef}
                loop
                preload="auto"
            />

        </div>
    );
};