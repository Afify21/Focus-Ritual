import React, { useState } from 'react';
import YouTubePlayer from '../components/YouTubePlayer';
import Timer from '../components/Timer';
import PDFViewer from '../components/PDFViewer';
import { XMarkIcon, PencilIcon } from '@heroicons/react/24/solid';
import ChatAssistant from '../components/ChatAssistant';
import Soundscape from '../components/Soundscape';
import { ThemeSelector } from '../components/ThemeSelector';
import Paint from '../components/Paint/Paint';
import { BackgroundManager } from '../components/BackgroundManager';

interface FocusModePageProps {
    onExitFocusMode: () => void;
    duration: number;
    onStateChange: (newState: any) => void;
    timerState?: any;
    setTimerState?: (state: any) => void;
    children?: React.ReactNode; // for optional quote generator
}

const FocusModePage: React.FC<FocusModePageProps> = ({
    onExitFocusMode,
    duration,
    onStateChange,
    timerState,
    setTimerState,
    children
}) => {
    const [showPaint, setShowPaint] = useState(false);
    const [selectedDuration, setSelectedDuration] = useState(1500); // default 25m
    const [pdfUrl, setPdfUrl] = useState<string>(''); // Add state for PDF URL

    return (
        <div className="min-h-screen text-white p-4 relative overflow-hidden">
            {/* Animated Theme Background */}
            <BackgroundManager isFocusMode={true} isPlaying={true} isBreak={false} isReset={false} morePrevalent={true} />
            {showPaint && <Paint />}
            <div className="h-full w-full relative z-10">
                <div className="flex justify-between items-center mb-4 relative z-50 px-2 md:px-8">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Focus Mode</h1>
                    <button
                        onClick={onExitFocusMode}
                        className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-700 transition-colors cursor-pointer text-white"
                    >
                        <XMarkIcon className="h-5 w-5" />
                        <span>Exit Focus Mode</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-6 h-[calc(100vh-60px)] w-full relative z-10 px-2 md:px-8">
                    {/* Left column for PDF viewer and YouTube player */}
                    <div className="space-y-6 h-full">
                        {/* Wrapper for Paint Button and PDF Viewer */}
                        <div className="relative">
                            {/* PDF Viewer Container with fixed height and overflow hidden */}
                            <div className="bg-transparent rounded-xl overflow-hidden h-[calc(60%-12px)]">
                                {pdfUrl ? (
                                    <PDFViewer url={pdfUrl} />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-slate-500">No PDF loaded</p>
                                    </div>
                                )}
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
                        <div className="bg-transparent rounded-xl p-4 h-[calc(40%-12px)] relative">
                            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-200">YouTube Player</h2>
                            <div className="h-[calc(100%-3rem)]">
                                <YouTubePlayer onClose={() => { }} isFocusMode={true} />
                            </div>
                        </div>
                    </div>

                    {/* Right column for Timer, Soundscapes, and Theme Selector */}
                    <div className="space-y-4">
                        <div className="bg-transparent rounded-xl p-4 relative">
                            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-200">Timer</h2>
                            <div className="flex gap-2 mb-4">
                                {[{label: '25m', value: 1500}, {label: '50m', value: 3000}, {label: '90m', value: 5400}].map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setSelectedDuration(opt.value)}
                                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${selectedDuration === opt.value ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                            <Timer duration={selectedDuration} onStateChange={onStateChange} isMinimized={true} />
                        </div>

                        {/* Soundscapes */}
                        <div className="bg-transparent rounded-xl p-4 relative">
                            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-200">Ambient Sounds</h2>
                            <div className="scale-90 origin-top">
                                <Soundscape compact={true} />
                            </div>
                        </div>

                        {/* Theme Selector */}
                        <div className="bg-transparent rounded-xl p-4 relative">
                            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-slate-200">Theme</h2>
                            <div className="flex flex-wrap gap-2">
                                <ThemeSelector compact={true} />
                            </div>
                        </div>
                        {/* Optional children, e.g. quote generator */}
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FocusModePage; 
