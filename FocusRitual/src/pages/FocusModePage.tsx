import React, { useState } from 'react';
import YouTubePlayer from '../components/YouTubePlayer';
import Timer from '../components/Timer';
import PDFViewer from '../components/PDFViewer';
import { XMarkIcon, PencilIcon } from '@heroicons/react/24/solid';
import ChatAssistant from '../components/ChatAssistant';
import Soundscape from '../components/Soundscape';
import { ThemeSelector } from '../components/ThemeSelector';
import Paint from '../components/Paint/Paint';

interface FocusModePageProps {
    onExitFocusMode: () => void;
    duration: number;
    onStateChange: (newState: any) => void;
}

const FocusModePage: React.FC<FocusModePageProps> = ({
    onExitFocusMode,
    duration,
    onStateChange,
}) => {
    const [showPaint, setShowPaint] = useState(false);

    return (
        <div className="min-h-screen text-slate-800 dark:text-white p-4 relative">
            {showPaint && <Paint width={500} height={400} />}
            <div className="container mx-auto h-full">
                <div className="flex justify-between items-center mb-4 relative z-50">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Focus Mode</h1>
                    <button
                        onClick={onExitFocusMode}
                        className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-700 transition-colors cursor-pointer text-white"
                    >
                        <XMarkIcon className="h-5 w-5" />
                        <span>Exit Focus Mode</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-6 h-[calc(100vh-60px)] relative z-10">
                    {/* Left column for PDF viewer and YouTube player */}
                    <div className="space-y-6 h-full">
                        {/* Wrapper for Paint Button and PDF Viewer */}
                        <div className="relative">
                            {/* PDF Viewer Container with fixed height and overflow hidden */}
                            <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md rounded-xl overflow-hidden h-[calc(60%-12px)]">
                                <PDFViewer />
                            </div>
                            {/* Paint Button - outside PDF Viewer container */}
                            <button
                                onClick={() => setShowPaint(!showPaint)}
                                className="absolute -top-8 right-0 flex items-center space-x-1 px-2 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors text-white text-sm z-10"
                            >
                                <PencilIcon className="h-4 w-4" />
                                <span>{showPaint ? 'Hide Paint' : 'Show Paint'}</span>
                            </button>
                        </div>
                        {/* YouTube Player Container with fixed height */}
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 h-[calc(40%-12px)] relative">
                            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-200">YouTube Player</h2>
                            <div className="h-[calc(100%-3rem)]">
                                <YouTubePlayer onClose={() => { }} isFocusMode={true} />
                            </div>
                        </div>
                    </div>

                    {/* Right column for Timer, Soundscapes, and Theme Selector */}
                    <div className="space-y-4">
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 relative">
                            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-200">Timer</h2>
                            <Timer duration={duration} onStateChange={onStateChange} isMinimized={true} />
                        </div>

                        {/* Soundscapes */}
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 relative">
                            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-200">Ambient Sounds</h2>
                            <div className="scale-90 origin-top">
                                <Soundscape compact={true} />
                            </div>
                        </div>

                        {/* Theme Selector */}
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 relative">
                            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-200">Theme</h2>
                            <div className="flex flex-wrap gap-2">
                                <ThemeSelector compact={true} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Chat Assistant rendered at the highest level */}
            <div className="fixed inset-0 z-[999999] pointer-events-none">
                <div className="absolute inset-0 pointer-events-none">
                    <ChatAssistant />
                </div>
            </div>
        </div>
    );
};

export default FocusModePage; 
