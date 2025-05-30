import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

interface BackgroundManagerProps {
    isFocusMode: boolean;
    isPlaying: boolean;
    isBreak: boolean;
}

export const BackgroundManager: React.FC<BackgroundManagerProps> = ({
    isFocusMode,
    isPlaying,
    isBreak,
}) => {
    const { currentTheme } = useTheme();
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [hasUserInteracted, setHasUserInteracted] = useState(false);
    const [isThemeSelected, setIsThemeSelected] = useState(false);

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

    // Update background and music when break state changes
    useEffect(() => {
        const backgroundPath = isBreak ? currentTheme.backgrounds.break : currentTheme.backgrounds.focus;
        const musicPath = isBreak ? currentTheme.music.break : currentTheme.music.focus;

        // Clear previous background/video before setting the new one
        if (videoRef.current) {
            videoRef.current.pause(); // Pause current video if any
            videoRef.current.src = ''; // Clear video source
            document.body.style.backgroundImage = ''; // Clear body background image
        }

        if (videoRef.current) {
            // Check if the background is a video or image
            const isVideo = backgroundPath.endsWith('.mp4');

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

        if (audioRef.current && isThemeSelected) {
            audioRef.current.src = musicPath;
            if (isPlaying && hasUserInteracted) {
                audioRef.current.load(); // Load the new audio source
                audioRef.current.play().catch(error => {
                    console.log('Audio playback failed:', error);
                });
            }
        }
    }, [isBreak, currentTheme, isPlaying, hasUserInteracted, isThemeSelected]);

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

            if (audioRef.current && isThemeSelected) {
                if (isPlaying) {
                    audioRef.current.play().catch(error => {
                        console.log('Audio playback failed:', error);
                    });
                } else {
                    audioRef.current.pause();
                }
            }
        }
    }, [isPlaying, hasUserInteracted, isThemeSelected]);

    // Listen for theme selection
    useEffect(() => {
        if (currentTheme.id !== 'default') {
            setIsThemeSelected(true);
        } else {
            setIsThemeSelected(false);
        }
    }, [currentTheme]);

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden">
            {/* Background Video/Image */}
            <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                loop
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