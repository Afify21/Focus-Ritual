import React from 'react';
import Desktop from './components/Desktop';

const App: React.FC = () => {
    const [selectedTime, setSelectedTime] = useState(25);
    const [showYouTube, setShowYouTube] = useState(false);
    const [showSpotify, setShowSpotify] = useState(false);
    const [showPaint, setShowPaint] = useState(false);
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [selectedSound, setSelectedSound] = useState<string | null>(null);
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
            timeLeft: !prev.hasStarted ? minutes * 60 : prev.timeLeft,
        }));
    };

    const toggleFocusMode = () => {
        const newFocusMode = !isFocusMode;
        setIsFocusMode(newFocusMode);
        if (newFocusMode) {
            navigate('/focus');
        } else {
            navigate('/');
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
        <div className="min-h-screen text-white">
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
                        }}
                        duration={selectedTime * 60}
                        onStateChange={handleTimerStateChange}
                        volume={volume}
                        selectedSound={selectedSound}
                        onSoundSelect={setSelectedSound}
                        onVolumeChange={setVolume}
                    />
                } />
                <Route path="/habits" element={<HabitPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
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
                                <div className="flex items-center space-x-2">
                                    <img src="/images/logo.png" alt="FocusRitual Logo" className="h-20 w-auto brightness-90" />
                                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-700 bg-clip-text text-transparent">FocusRitual</h1>
                                </div>
                                <div className="flex flex-wrap gap-2">
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
                                        Habits & Analysis
                                    </button>
                                    <button
                                        onClick={() => navigate('/calendar')}
                                        className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-700 transition-colors"
                                    >
                                        <CalendarIcon className="h-5 w-5" />
                                        <span>Calendar</span>
                                    </button>
                                </div>
                            </div>

                            {/* Focus Mode Button */}
                            <button
                                onClick={toggleFocusMode}
                                className="fixed right-8 top-1/2 -translate-y-1/2 flex flex-col items-center space-y-2 px-6 py-8 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 shadow-lg"
                            >
                                <ArrowsPointingOutIcon className="h-8 w-8 text-white" />
                                <span className="text-white font-medium text-lg">{isFocusMode ? 'Exit Focus' : 'Enter Focus Mode'}</span>
                            </button>

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
                                    <UpcomingEvents compact={true} />
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
                                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-xl font-semibold">Ambient Sounds</h2>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-white text-sm">Volume</span>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="1"
                                                    step="0.01"
                                                    value={volume}
                                                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                                                    className="w-24 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                                />
                                                <span className="text-white text-sm">🔊</span>
                                            </div>
                                        </div>
                                        <div className="scale-90 origin-top">
                                            <Soundscape
                                                compact={true}
                                                volume={volume}
                                                onVolumeChange={setVolume}
                                                selectedSound={selectedSound}
                                                onSoundSelect={setSelectedSound}
                                            />
                                        </div>
                                    </div>
                                    <EnhancedTodoList />
                                    <HabitSummary />
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