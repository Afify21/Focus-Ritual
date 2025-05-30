import React, { useState } from 'react';
import Timer from './components/Timer';
import Soundscape from './components/Soundscape';
import RitualBuilder from './components/RitualBuilder';
import YouTubePlayer from './components/YouTubePlayer';
import SpotifyPlayer from './components/SpotifyPlayer';
import QuoteGenerator from './components/QuoteGenerator';
import { PlayCircleIcon, ArrowsPointingOutIcon, XMarkIcon, MusicalNoteIcon } from '@heroicons/react/24/solid';

const App: React.FC = () => {
    const [selectedTime, setSelectedTime] = useState(25);
    const [showYouTube, setShowYouTube] = useState(false);
    const [showSpotify, setShowSpotify] = useState(false);
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [timerState, setTimerState] = useState({
        timeLeft: selectedTime * 60,
        isRunning: false,
        isBreak: false,
        isPaused: false,
        completedSessions: 0,
        hasStarted: false
    });

    const handleTimeSelect = (minutes: number) => {
        setSelectedTime(minutes);
        setTimerState(prev => ({
            ...prev,
            timeLeft: minutes * 60,
            isRunning: false,
            isBreak: false,
            isPaused: false,
            hasStarted: false
        }));
    };

    const toggleFocusMode = () => {
        const newFocusMode = !isFocusMode;
        setIsFocusMode(newFocusMode);
        if (newFocusMode) {
            setShowYouTube(true);
        }
    };

    const handleCloseYouTube = () => {
        setShowYouTube(false);
        setIsFocusMode(false);
    };

    const handleCloseSpotify = () => {
        setShowSpotify(false);
    };

    const handleTimerStateChange = (newState: typeof timerState) => {
        setTimerState(newState);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white p-4">
            <div className={`max-w-4xl mx-auto space-y-6 transition-all duration-300 ${isFocusMode ? 'mr-[50%]' : ''}`}>
                <h1 className="text-4xl font-bold text-center mb-8">FocusRitual</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4">
                            <h2 className="text-xl font-semibold mb-4">Select Duration</h2>
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={() => handleTimeSelect(25)}
                                    className={`px-4 py-2 rounded-lg ${selectedTime === 25 ? 'bg-slate-600' : 'bg-slate-700'}`}
                                >
                                    25m
                                </button>
                                <button
                                    onClick={() => handleTimeSelect(50)}
                                    className={`px-4 py-2 rounded-lg ${selectedTime === 50 ? 'bg-slate-600' : 'bg-slate-700'}`}
                                >
                                    50m
                                </button>
                                <button
                                    onClick={() => handleTimeSelect(90)}
                                    className={`px-4 py-2 rounded-lg ${selectedTime === 90 ? 'bg-slate-600' : 'bg-slate-700'}`}
                                >
                                    90m
                                </button>
                            </div>
                        </div>
                        {!isFocusMode && (
                            <Timer
                                duration={selectedTime * 60}
                                onStateChange={handleTimerStateChange}
                            />
                        )}
                        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">Media Players</h2>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={toggleFocusMode}
                                        className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-700 transition-colors"
                                    >
                                        <ArrowsPointingOutIcon className="h-5 w-5" />
                                        <span>{isFocusMode ? 'Exit Focus Mode' : 'Focus Mode'}</span>
                                    </button>
                                </div>
                            </div>
                            <div className="mt-4 flex space-x-4">
                                <button
                                    onClick={() => setShowYouTube(!showYouTube)}
                                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-700 transition-colors"
                                >
                                    <PlayCircleIcon className="h-5 w-5" />
                                    <span>{showYouTube ? 'Hide YouTube' : 'Show YouTube'}</span>
                                </button>
                                <button
                                    onClick={() => setShowSpotify(!showSpotify)}
                                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-700 transition-colors"
                                >
                                    <MusicalNoteIcon className="h-5 w-5" />
                                    <span>{showSpotify ? 'Hide Spotify' : 'Show Spotify'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <Soundscape />
                        <RitualBuilder />
                        <QuoteGenerator />
                    </div>
                </div>
            </div>

            {isFocusMode && (
                <div className="fixed left-0 top-0 w-1/2 h-full p-4 space-y-6">
                    <div className="flex justify-end">
                        <button
                            onClick={toggleFocusMode}
                            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-700 transition-colors"
                        >
                            <XMarkIcon className="h-5 w-5" />
                            <span>Exit Focus Mode</span>
                        </button>
                    </div>
                    <Timer
                        duration={selectedTime * 60}
                        onStateChange={handleTimerStateChange}
                    />
                    {showYouTube && (
                        <div className="bg-slate-800 rounded-xl overflow-hidden shadow-lg">
                            <YouTubePlayer
                                onClose={handleCloseYouTube}
                                isFocusMode={isFocusMode}
                            />
                        </div>
                    )}
                    {showSpotify && (
                        <div className="bg-slate-800 rounded-xl overflow-hidden shadow-lg">
                            <SpotifyPlayer
                                onClose={handleCloseSpotify}
                                isFocusMode={isFocusMode}
                            />
                        </div>
                    )}
                </div>
            )}

            {!isFocusMode && showYouTube && (
                <YouTubePlayer
                    onClose={handleCloseYouTube}
                    isFocusMode={isFocusMode}
                />
            )}
            {!isFocusMode && showSpotify && (
                <SpotifyPlayer
                    onClose={handleCloseSpotify}
                    isFocusMode={isFocusMode}
                />
            )}
        </div>
    );
};

export default App; 