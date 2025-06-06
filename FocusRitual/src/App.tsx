import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
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
import ChatAssistant from './components/ChatAssistant';

const App: React.FC = () => {
    const [showYouTube, setShowYouTube] = useState(false);
    const [showSpotify, setShowSpotify] = useState(false);
    const [volume, setVolume] = useState(50);
    const [selectedSound, setSelectedSound] = useState<string | null>(null);
    const navigate = useNavigate();

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
        <div className="min-h-screen bg-gray-900 text-white">
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
                <Route path="/" element={(
                    <main className="container mx-auto px-4 py-8">
                        <div className="space-y-8">
                            <TimerSection />
                            <FocusModeSection onGoToFocusMode={handleGoToFocusMode} />
                            <MediaPlayerSection
                                showYouTube={showYouTube}
                                showSpotify={showSpotify}
                                onToggleYouTube={() => setShowYouTube(!showYouTube)}
                                onToggleSpotify={() => setShowSpotify(!showSpotify)}
                            />
                            <SoundscapeControls
                                volume={volume}
                                onVolumeChange={(e) => setVolume(Number(e.target.value))}
                                selectedSound={selectedSound}
                                onSoundSelect={handleSoundSelect}
                            />
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