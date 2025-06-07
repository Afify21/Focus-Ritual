import React, { useState, useEffect, ChangeEvent } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Header from 'components/Header';
import Footer from 'components/Footer';
import LoginPage from 'pages/LoginPage';
import RegisterPage from 'pages/RegisterPage';
import TimerSection from 'components/TimerSection';
import FocusModeSection from 'components/FocusModeSection';
import MediaPlayerSection from 'components/MediaPlayerSection';
import SoundscapeControls from 'components/SoundscapeControls';
import FocusModePage from 'pages/FocusModePage';
import NewAnalyticsPage from 'pages/NewAnalyticsPage';
import CalendarPage from 'pages/CalendarPage';
import ChatAssistant from 'components/ChatAssistant';
import ThreeDBackground from 'components/ThreeDBackground';
import { useTheme } from '../context/ThemeContext';
import HabitSummary from 'components/HabitSummary';
import EnhancedTodoList from 'components/EnhancedTodoList';
import ThemeSelector from 'components/ThemeSelector';

const App: React.FC = () => {
    const [volume, setVolume] = useState<number>(50);
    const [selectedSound, setSelectedSound] = useState<string | null>(null)    const { theme, currentTheme } = useTheme();
    const appBackgroundClass = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100';

    const handleSoundSelect = (soundId: string | null) => {
        setSelectedSound(soundId);
    };

    const handleExitFocusMode = () => {
        // Implementation
    };

    const handleStateChange = (newState: any) => {
        // Implementation
    };

    return (
        <div className={`min-h-screen text-white ${appBackgroundClass}`}>
            <ThreeDBackground />
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
                        onVolumeChange={setVolume}
                    />
                } />
                <Route path="/analytics" element={<NewAnalyticsPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/" element={(
                    <main className="container mx-auto px-4 py-8">
                        <div className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-6">
                            <div className="space-y-6">
                                <div className="w-full">
                                    <TimerSection />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <SoundscapeControls
                                            volume={volume}
                                            onVolumeChange={(e: ChangeEvent<HTMLInputElement>) => setVolume(Number(e.target.value))}
                                            selectedSound={selectedSound}
                                            onSoundSelect={handleSoundSelect}
                                        />
                                    </div>
                                    <div>
                                        <div className={`${currentTheme.colors.chatMessageListBg} rounded-lg p-4 shadow-lg border border-gray-800`}>
                                            <h3 className="text-lg font-semibold mb-4">Theme</h3>
                                            <ThemeSelector />
                                        </div>
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
            <div className="fixed bottom-4 right-4 z-[999999]">
                <ChatAssistant />
            </div>
        </div>
    );
};

export default App; 