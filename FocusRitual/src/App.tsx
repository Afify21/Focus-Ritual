import React, { useState, useCallback } from 'react';
import Timer from './components/Timer';
import Soundscape from './components/Soundscape';
import RitualBuilder from './components/RitualBuilder';
import YouTubePlayer from './components/YouTubePlayer';
import SpotifyPlayer from './components/SpotifyPlayer';
import ChatAssistant from './components/ChatAssistant';
import QuoteGenerator from './components/QuoteGenerator';
import Paint from './components/Paint/Paint';
import { PlayCircleIcon, ArrowsPointingOutIcon, XMarkIcon, MusicalNoteIcon, PencilIcon } from '@heroicons/react/24/solid';
import Callback from './pages/Callback';
import FocusModePage from './pages/FocusModePage';
import HabitPage from './pages/HabitPage';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useTheme } from './context/ThemeContext';
import { ThemeSelector } from './components/ThemeSelector';
import { BackgroundManager } from './components/BackgroundManager';
import HabitSummary from './components/HabitSummary';

const App: React.FC = () => {
    const [selectedTime, setSelectedTime] = useState(25);
    const [showYouTube, setShowYouTube] = useState(false);
    const [showSpotify, setShowSpotify] = useState(false);
    const [showPaint, setShowPaint] = useState(false);
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [timerState, setTimerState] = useState({
        timeLeft: selectedTime * 60,
        isRunning: false,
        isBreak: false,
        isPaused: false,
        completedSessions: 0,
        hasStarted: false,
        isReset: false
    });
    const [showThemeSelector, setShowThemeSelector] = useState(false);

    const { currentTheme } = useTheme();
    const navigate = useNavigate();

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
            navigate('/focus');
        } else {
            navigate('/');
            setTimerState(prev => ({
                ...prev,
                isRunning: false,
                isPaused: false,
                hasStarted: false
            }));
        }
    };

    const handleCloseYouTube = () => {
        setShowYouTube(false);
    };

    const handleCloseSpotify = () => {
        setShowSpotify(false);
    };

    const handleTimerStateChange = useCallback((newState: typeof timerState) => {
        setTimerState(newState);
    }, []);

    return (
        <div className="min-h-screen text-white p-4">
            <BackgroundManager
                isFocusMode={isFocusMode}
                isPlaying={timerState.isRunning}
                isBreak={timerState.isBreak}
                isReset={timerState.isReset}
            />
            {showPaint && <Paint width={800} height={600} />}
            <Routes>
                <Route path="/callback" element={<Callback />} />
                <Route path="/focus" element={
                    <FocusModePage
                        onExitFocusMode={() => {
                            setIsFocusMode(false);
                            navigate('/');
                            setTimerState(prev => ({
                                ...prev,
                                isRunning: false,
                                isPaused: false,
                                hasStarted: false
                            }));
                        }}
                        duration={selectedTime * 60}
                        onStateChange={handleTimerStateChange}
                    />
                } />
                <Route path="/habits" element={<HabitPage />} />
                <Route path="/" element={
                    <div className="min-h-screen text-white p-4">
                        <BackgroundManager
                            isFocusMode={isFocusMode}
                            isPlaying={timerState.isRunning}
                            isBreak={timerState.isBreak}
                            isReset={timerState.isReset}
                        />
                        <div className={`max-w-4xl mx-auto space-y-6 transition-all duration-300 ${isFocusMode ? 'mr-[50%]' : ''}`}>
                            <div className="flex justify-between items-center mb-8">
                                <h1 className="text-4xl font-bold">FocusRitual</h1>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={toggleFocusMode}
                                        className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-700 transition-colors"
                                    >
                                        <ArrowsPointingOutIcon className="h-5 w-5" />
                                        <span>{isFocusMode ? 'Exit Focus Mode' : 'Focus Mode'}</span>
                                    </button>
                                    <button
                                        onClick={() => setShowThemeSelector(!showThemeSelector)}
                                        className="px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-700 transition-colors"
                                    >
                                        {showThemeSelector ? 'Hide Themes' : 'Show Themes'}
                                    </button>
                                    <button
                                        onClick={() => navigate('/habits')}
                                        className="px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-700 transition-colors"
                                    >
                                        Habits
                                    </button>
                                </div>
                            </div>

                            {showThemeSelector && (
                                <div className="mb-6">
                                    <ThemeSelector />
                                </div>
                            )}

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
                                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-xl font-semibold">Media Players</h2>
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
                                    <HabitSummary />
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
                                <button
                                    onClick={() => setShowPaint(!showPaint)}
                                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-700 transition-colors w-full justify-center"
                                >
                                    <PencilIcon className="h-5 w-5" />
                                    <span>{showPaint ? 'Hide Paint' : 'Show Paint'}</span>
                                </button>
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
                        <ChatAssistant />
                    </div>
                } />
            </Routes>
        </div>
    );
};

export default App; 