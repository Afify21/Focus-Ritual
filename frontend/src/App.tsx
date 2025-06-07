import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import TimerSection from './components/TimerSection';
import SoundscapeControls from './components/SoundscapeControls';
import { useTheme } from './context/ThemeContext';
import HabitSummary from './components/HabitSummary';
import EnhancedTodoList from './components/EnhancedTodoList';
import { ThemeSelector } from './components/ThemeSelector';
import { PaintBrushIcon } from '@heroicons/react/24/outline';

const StylizedLoginPage = lazy(() => import('./pages/StylizedLoginPage'));
const StylizedRegisterPage = lazy(() => import('./pages/StylizedRegisterPage'));
const StylizedForgotPasswordPage = lazy(() => import('./pages/StylizedForgotPasswordPage'));
const FocusModePage = lazy(() => import('./pages/FocusModePage'));
const NewAnalyticsPage = lazy(() => import('./pages/NewAnalyticsPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const HabitPage = lazy(() => import('./pages/HabitPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const Callback = lazy(() => import('./pages/Callback'));
const ChatAssistant = lazy(() => import('./components/ChatAssistant'));

const App: React.FC = () => {
    const [showYouTube, setShowYouTube] = useState(false);
    const [showSpotify, setShowSpotify] = useState(false);
    const [volume, setVolume] = useState(50);
    const [selectedSound, setSelectedSound] = useState<string | null>(null);
    const navigate = useNavigate();
    const { currentTheme } = useTheme();

    // Initialize particles
    useEffect(() => {
        const particlesContainer = document.getElementById('particles');
        if (particlesContainer) {
            const particleCount = 30;

            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.classList.add('particle');

                const size = Math.random() * 4 + 2;
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                particle.style.left = `${Math.random() * 100}%`;
                particle.style.top = `${Math.random() * 100}%`;
                particle.style.opacity = (Math.random() * 0.5 + 0.3).toString();
                const duration = Math.random() * 10 + 10;
                particle.style.animationDuration = `${duration.toString()}s`;
                particle.style.animationDelay = `${(Math.random() * 10).toString()}s`;

                particlesContainer.appendChild(particle);
            }
        }
    }, []);

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
            <div id="particles" className="particles"></div>
            <Header />
            <Suspense fallback={<div className="flex-grow text-center p-8">Loading...</div>}>
                <Routes>
                    <Route path="/login" element={<StylizedLoginPage />} />
                    <Route path="/stylized-login" element={<StylizedLoginPage />} />
                    <Route path="/register" element={<StylizedRegisterPage />} />
                    <Route path="/forgot-password" element={<StylizedForgotPasswordPage />} />
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
                    <Route path="/habits" element={<HabitPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/callback" element={<Callback />} />
                    <Route path="/challenges" element={<NewAnalyticsPage />} />
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
            </Suspense>

            <Footer />

            {/* Static Chat Assistant at bottom right */}
            <Suspense fallback={null}>
                <div className="fixed bottom-4 right-4 z-[999999] pointer-events-none">
                    <ChatAssistant />
                </div>
            </Suspense>
        </div>
    );
};

export default App; 