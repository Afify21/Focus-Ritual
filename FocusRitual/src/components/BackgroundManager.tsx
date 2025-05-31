import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Theme } from '../config/themes'; // Import Theme interface

interface BackgroundManagerProps {
    isFocusMode: boolean;
    isPlaying: boolean;
    isBreak: boolean;
    isReset: boolean;
}

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
    const imgRef = useRef<HTMLImageElement>(null); // Add ref for image element
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
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

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
    }, [isBreak, isPlaying, currentTheme.backgrounds.focus]);

    // Handle audio source and play/pause based on timer state and theme changes (not background index changes)
    useEffect(() => {
        if (audioRef.current) {
            const newAudioSrc = isBreak ? currentTheme.music.break : currentTheme.music.focus;

            // Only update source if it's different or if it's a reset (to ensure load and play from beginning)
            if (audioRef.current.src !== (newAudioSrc || '') || isReset) {
                audioRef.current.src = newAudioSrc || '';
                audioRef.current.load(); // Load the new source
                if (isReset) {
                    audioRef.current.currentTime = 0; // Reset to beginning on timer reset
                }
            }

            // Handle play/pause based on isPlaying and user interaction
            if (hasUserInteracted && newAudioSrc && isPlaying) {
                audioRef.current.play().catch(error => {
                    console.log('Audio playback failed:', error);
                });
            } else {
                audioRef.current.pause();
            }
        }
    }, [isBreak, isPlaying, hasUserInteracted, currentTheme.music, isReset]); // Depend on relevant states and music URLs, and isReset

    // Update background when break state, playing state, or theme changes
    useEffect(() => {
        let backgroundSource = isPlaying
            ? (Array.isArray(currentTheme.backgrounds.focus) ? currentTheme.backgrounds.focus[currentFocusBackgroundIndex] : currentTheme.backgrounds.focus)
            : currentTheme.backgrounds.break;

        const isVideo = typeof backgroundSource === 'string' && (backgroundSource.endsWith('.mp4') || backgroundSource.endsWith('.mov'));
        const isImage = typeof backgroundSource === 'string' && !isVideo && backgroundSource !== '';

        // Handle video background
        if (isVideo && videoRef.current) {
            // Hide image if it was previously shown
            if (imgRef.current) {
                imgRef.current.style.display = 'none';
            }

            videoRef.current.style.display = 'block';
            // Only update source if it's different
            if (videoRef.current.src !== backgroundSource) {
                videoRef.current.src = backgroundSource;
                videoRef.current.load();
            }

            // Attempt to play video if user has interacted
            if (hasUserInteracted) {
                videoRef.current.play().catch(error => {
                    console.log('Video playback failed:', error);
                    // Autoplay might be blocked, user interaction needed.
                    // The play promise rejection should be handled.
                });
            }
        } else if (isImage && imgRef.current) { // Handle image background
            // Hide video if it was previously shown
            if (videoRef.current) {
                videoRef.current.style.display = 'none';
                videoRef.current.pause(); // Pause video when hidden
            }

            imgRef.current.style.display = 'block';
            imgRef.current.src = backgroundSource as string;

        } else { // No background source or default theme, hide both
            if (videoRef.current) {
                videoRef.current.style.display = 'none';
                videoRef.current.pause();
                videoRef.current.src = '';
            }
            if (imgRef.current) {
                imgRef.current.style.display = 'none';
                imgRef.current.src = '';
            }
        }

    }, [isBreak, isPlaying, hasUserInteracted, currentTheme.backgrounds, currentFocusBackgroundIndex]);


    return (
        <div className="fixed inset-0 -z-10 overflow-hidden">
            {currentTheme.id === 'default' ? (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
            ) : (
                <>
                    <video
                        ref={videoRef}
                        className="absolute inset-0 w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                        style={{ display: 'none' }} // Initially hide video
                    />
                    <img
                        ref={imgRef}
                        className="absolute inset-0 w-full h-full object-cover"
                        alt="Background"
                        style={{ display: 'none' }} // Initially hide image
                    />
                </>
            )}
            <audio ref={audioRef} loop />
        </div>
    );
};