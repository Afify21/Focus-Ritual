import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';backg
import Header from './components/Header';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TimerSection from './components/TimerSection';
import FocusModeSection from './components/FocusModeSection';
import MediaPlayerSection from './components/MediaPlayerSection';
import SoundscapeControls from './components/SoundscapeControls';
import FocusModePage from './pages/FocusModePage';
import NewAnalyticsPage from './pages/NewAnalyticsPage';
import CalendarPage from './pages/CalendarPage';
import ChatAssistant from './components/ChatAssistant';
import ThreeDBackground from './components/ThreeDBackground';
import { useTheme } from './context/ThemeContext';
import HabitSummary from './components/HabitSummary';
import EnhancedTodoList from './components/EnhancedTodoList';
import { ThemeSelector } from './components/ThemeSelector';
import { PaintBrushIcon } from '@heroicons/react/24/outline';

const App: React.FC = () => {
    const [showYouTube, setShowYouTube] = useState(false);
    const [showSpotify, setShowSpotify] = useState(false);
    const [volume, setVolume] = useState(50);
    const [selectedSound, setSelectedSound] = useState<string | null>(null);
    const navigate = useNavigate();
    const { currentTheme } = useTheme();

    const handleVolumeChange = (newVolume: number) => {
        setVolume(newVolume * 100);
    };

    const handleSoundSelect = (sound: string | null) => {
        setSelectedSound(sound);
    };

    const handleGoToFocusMode = () => {
        navigate('/focus-mode');
    };

    const handleExitFocusMode = () => {
        navigate('/');
    };

    const handleStateChange = (state: string) => {
        console.log('Focus mode state changed:', state);
    };

    return (
        <div className="min-h-screen flex flex-col text-white">
            <Header />
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/focus-mode" element={
                    <FocusModePage
                        onExitFocusMode={handleExitFocusMode}
                        duration={25}
                        onStateChange={handleStateChange}
                        volume={volume / 100}
                        selectedSound={selectedSound}
                        onSoundSelect={handleSoundSelect}
                        onVolumeChange={handleVolumeChange}
                    />
                } />
                <Route path="/analytics" element={<NewAnalyticsPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/" element={(
                    <main className="container mx-auto px-4 py-8 flex-grow">
                        <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-6">
                            <div className="space-y-6">
                                <div className="w-full">
                                    <TimerSection />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <SoundscapeControls
                                            volume={volume}
                                            onVolumeChange={(e) => setVolume(Number(e.target.value))}
                                            selectedSound={selectedSound}
                                            onSoundSelect={handleSoundSelect}
                                        />
                                    </div>
                                    <div className={`${currentTheme.colors.chatMessageListBg} backdrop-blur-md rounded-xl p-4 relative h-full`}>
                                        <h2 className={`text-base font-bold mb-3 glow-teal flex items-center`}>
                                            <PaintBrushIcon className="w-5 h-5 text-teal-400 mr-2" />
                                            Theme
                                        </h2>
                                        <ThemeSelector compact={true} />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <HabitSummary />
                                <EnhancedTodoList />
                            </div>
                        </div>
                    </main>
                )} />
            </Routes>

            <Footer />

            {/* Static Chat Assistant at bottom right */}
            <div className="fixed bottom-4 right-4 z-[999999] pointer-events-none">
                <ChatAssistant />
            </div>
        </div>
    );
};

export default App; 