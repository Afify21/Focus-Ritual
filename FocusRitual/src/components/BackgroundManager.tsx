import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Theme } from '../config/themes'; // Import Theme interface

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
        'https://res.cloudinary.com/dmouna8ru/video/upload/v1748661256/background1_luqfku.mp4',
        'https://res.cloudinary.com/dmouna8ru/video/upload/v1748661258/background2_ecc2xj.mp4'
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

    // Preload theme media
    useEffect(() => {
        // Preload break background (image or video)
        if (currentTheme.backgrounds.break) {
            const breakMedia = document.createElement(
                currentTheme.backgrounds.break.endsWith('.mp4') || currentTheme.backgrounds.break.endsWith('.mov')
                    ? 'video'
                    : 'img'
            );
            if (breakMedia instanceof HTMLVideoElement) {
                breakMedia.preload = 'auto';
                breakMedia.muted = true; // Mute videos for preloading
                breakMedia.playsInline = true; // Ensure plays inline
            }
            breakMedia.src = currentTheme.backgrounds.break;
        }

        // Preload focus background(s)
        if (Array.isArray(currentTheme.backgrounds.focus)) {
            // Preload multiple focus videos
            currentTheme.backgrounds.focus.forEach(videoUrl => {
                const video = document.createElement('video');
                video.preload = 'auto';
                video.muted = true; // Mute videos for preloading
                video.playsInline = true; // Ensure plays inline
                video.src = videoUrl;
            });
        } else if (currentTheme.backgrounds.focus) {
            // Preload single focus background (image or video)
            const focusMedia = document.createElement(
                currentTheme.backgrounds.focus.endsWith('.mp4') || currentTheme.backgrounds.focus.endsWith('.mov')
                    ? 'video'
                    : 'img'
            );
            if (focusMedia instanceof HTMLVideoElement) {
                focusMedia.preload = 'auto';
                focusMedia.muted = true; // Mute videos for preloading
                focusMedia.playsInline = true; // Ensure plays inline
            }
            focusMedia.src = currentTheme.backgrounds.focus;
        }

        // Preload audio if available for the current theme
        if (currentTheme.music.focus) {
            const focusAudio = document.createElement('audio');
            focusAudio.preload = 'auto';
            focusAudio.src = currentTheme.music.focus;
        }
        if (currentTheme.music.break) {
            const breakAudio = document.createElement('audio');
            breakAudio.preload = 'auto';
            breakAudio.src = currentTheme.music.break;
        }

    }, [currentTheme]); // Rerun when theme changes

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

    // Handle background rotation every 10 minutes for themes with multiple focus videos
    useEffect(() => {
        if (!isBreak && isPlaying && Array.isArray(currentTheme.backgrounds.focus)) {
            const interval = setInterval(() => {
                setCurrentFocusBackgroundIndex((prevIndex) =>
                    (prevIndex + 1) % currentTheme.backgrounds.focus.length
                );
            }, VIDEO_ROTATION_INTERVAL);

            return () => clearInterval(interval);
        } else {
            // Reset index when not in a rotating video theme or not playing/on break
            setCurrentFocusBackgroundIndex(0);
        }
    }, [isBreak, isPlaying, currentTheme.backgrounds.focus]); // Depend on isPlaying, isBreak, and the focus backgrounds array

    // Handle audio source and play/pause based on timer state and theme
    useEffect(() => {
        if (audioRef.current) {
            // Set audio source based on break state and theme, but only if different from current source
            const newAudioSrc = isBreak ? currentTheme.music.break : currentTheme.music.focus;
            if (audioRef.current.src !== (newAudioSrc || '')) { // Use || '' to handle empty strings correctly
                audioRef.current.src = newAudioSrc || ''; // Set source to empty string if no music
                audioRef.current.load(); // Load the new source
            }

            // Handle play/pause
            if (hasUserInteracted && newAudioSrc) { // Only attempt to play if user interacted and there's a music source
                if (isPlaying) {
                    audioRef.current.play().catch(error => {
                        console.log('Audio playback failed:', error);
                    });
                } else {
                    audioRef.current.pause();
                }
            } else if (audioRef.current.src) {
                // If no music for theme or no user interaction, pause if source is set
                audioRef.current.pause();
            }
        }
    }, [isBreak, isPlaying, hasUserInteracted, currentTheme.music]); // Depend on relevant states and music URLs

    // Handle audio reset when timer is reset (and there's music for the theme)
    useEffect(() => {
        if (isReset && audioRef.current && hasUserInteracted && (currentTheme.music.focus || currentTheme.music.break)) {
            const musicPath = isBreak ? currentTheme.music.break : currentTheme.music.focus;
            audioRef.current.src = musicPath;
            audioRef.current.load();
            audioRef.current.currentTime = 0; // Reset to beginning
            if (isPlaying) {
                audioRef.current.play().catch(error => {
                    console.log('Audio playback failed:', error);
                });
            } else {
                audioRef.current.pause();
            }
        } else if (isReset && audioRef.current) {
            // If timer is reset in a theme with no music, ensure audio is paused and reset
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }, [isReset, isBreak, isPlaying, hasUserInteracted, currentTheme.music]); // Depend on relevant states and music URLs

    // Update background when break state, playing state, or theme changes
    useEffect(() => {
        let backgroundSource: string | undefined;

        // Determine the correct background source based on state and theme
        if (isPlaying) {
            if (Array.isArray(currentTheme.backgrounds.focus)) {
                backgroundSource = currentTheme.backgrounds.focus[currentFocusBackgroundIndex];
            } else {
                backgroundSource = currentTheme.backgrounds.focus;
            }
        } else {
            // When paused or not playing, or on break, show the break background
            backgroundSource = currentTheme.backgrounds.break;
        }

        // Clear previous background/video before setting the new one
        if (videoRef.current) {
            videoRef.current.pause(); // Pause current video if any
            videoRef.current.src = ''; // Clear video source
        }
        document.body.style.backgroundImage = ''; // Clear body background image

        if (backgroundSource) { // Ensure there is a background source defined for the current state
            const isVideo = backgroundSource.endsWith('.mp4') || backgroundSource.endsWith('.mov');

            if (isVideo) {
                if (videoRef.current) {
                    videoRef.current.style.display = 'block';
                    videoRef.current.src = backgroundSource;
                    if (isPlaying && hasUserInteracted) {
                        videoRef.current.load(); // Load the new video source
                        videoRef.current.play().catch(error => {
                            console.log('Video playback failed:', error);
                        });
                    } else if (!isPlaying) {
                        videoRef.current.pause();
                    }
                }
            } else { // It's an image
                if (videoRef.current) {
                    videoRef.current.style.display = 'none'; // Hide video element for images
                }
                document.body.style.backgroundImage = `url(${backgroundSource})`;
                document.body.style.backgroundSize = 'cover';
                document.body.style.backgroundPosition = 'center';
                document.body.style.backgroundRepeat = 'no-repeat';
            }
        } else { // No background source defined for this state/theme, clear everything
            if (videoRef.current) {
                videoRef.current.style.display = 'none';
                videoRef.current.src = '';
            }
            document.body.style.backgroundImage = '';
        }

    }, [isBreak, currentTheme, isPlaying, hasUserInteracted, currentFocusBackgroundIndex]);

    // Handle play/pause for audio (only if music is available for the theme)
    useEffect(() => {
        if (hasUserInteracted && audioRef.current && (currentTheme.music.focus || currentTheme.music.break)) {
            if (isPlaying) {
                audioRef.current.play().catch(error => {
                    console.log('Audio playback failed:', error);
                });
            } else {
                audioRef.current.pause();
            }
        } else if (audioRef.current && audioRef.current.src) { // Pause if no music for theme but audio source is set
            audioRef.current.pause();
        }
    }, [isPlaying, hasUserInteracted, currentTheme.music]); // Depend on relevant states and music URLs

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        console.log('Slider value changed to:', newVolume);
        setVolume(newVolume);
        // The useEffect hook will handle setting the volume on the audio element
    };

    return (
        <div className={`fixed inset-0 -z-10 overflow-hidden ${currentTheme.id === 'default' ? 'bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900' : ''}`}>
            {/* Background Video/Image */}
            <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                loop={true}
                muted // Mute by default to comply with autoplay policies, volume is controlled by slider
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