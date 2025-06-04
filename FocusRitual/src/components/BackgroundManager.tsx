import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Theme } from '../config/themes'; // Import Theme interface

// Create a single global audio element
const globalAudio = new Audio();
globalAudio.loop = true;

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
    const imgRef = useRef<HTMLImageElement>(null);
    const [hasUserInteracted, setHasUserInteracted] = useState(false);
    const [currentFocusBackgroundIndex, setCurrentFocusBackgroundIndex] = useState(0);
    const [volume, setVolume] = useState(0.3);

    // Handle audio source and play/pause based on timer state and theme changes
    useEffect(() => {
        const newAudioSrc = isBreak ? currentTheme.music.break : currentTheme.music.focus;

        if (!newAudioSrc) {
            globalAudio.pause();
            return;
        }

        // Only update source if it's different
        if (globalAudio.src !== newAudioSrc) {
            globalAudio.pause();
            globalAudio.src = newAudioSrc;
            globalAudio.load();
        }

        // Handle play/pause
        if (hasUserInteracted && isPlaying) {
            globalAudio.play().catch(error => {
                console.log('Audio playback failed:', error);
            });
        } else {
            globalAudio.pause();
        }
    }, [isBreak, isPlaying, hasUserInteracted, currentTheme.music]);

    // Update volume when it changes
    useEffect(() => {
        globalAudio.volume = volume;
    }, [volume]);

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
            setCurrentFocusBackgroundIndex(0);
        }
    }, [isBreak, isPlaying, currentTheme.backgrounds.focus]);

    // Update background when break state, playing state, or theme changes
    useEffect(() => {
        let backgroundSource = isPlaying
            ? (Array.isArray(currentTheme.backgrounds.focus) ? currentTheme.backgrounds.focus[currentFocusBackgroundIndex] : currentTheme.backgrounds.focus)
            : currentTheme.backgrounds.break;

        const isVideo = typeof backgroundSource === 'string' && (backgroundSource.endsWith('.mp4') || backgroundSource.endsWith('.mov'));
        const isImage = typeof backgroundSource === 'string' && !isVideo && backgroundSource !== '';

        if (isVideo && videoRef.current) {
            if (imgRef.current) {
                imgRef.current.style.display = 'none';
            }

            videoRef.current.style.display = 'block';
            if (videoRef.current.src !== backgroundSource) {
                videoRef.current.src = backgroundSource;
                videoRef.current.load();
            }

            if (hasUserInteracted) {
                videoRef.current.play().catch(error => {
                    console.log('Video playback failed:', error);
                });
            }
        } else if (isImage && imgRef.current) {
            if (videoRef.current) {
                videoRef.current.style.display = 'none';
                videoRef.current.pause();
            }

            imgRef.current.style.display = 'block';
            imgRef.current.src = backgroundSource as string;
        } else {
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
                    <div className="absolute inset-0 bg-slate-900" />
                    <video
                        ref={videoRef}
                        className="absolute inset-0 w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                        style={{ display: 'none' }}
                    />
                    <img
                        ref={imgRef}
                        className="absolute inset-0 w-full h-full object-cover"
                        alt="Background"
                        style={{ display: 'none' }}
                    />
                </>
            )}
        </div>
    );
};