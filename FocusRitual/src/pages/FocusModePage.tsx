import React from 'react';
import YouTubePlayer from '../components/YouTubePlayer';
import Timer from '../components/Timer';
import PDFViewer from '../components/PDFViewer';
import { XMarkIcon } from '@heroicons/react/24/solid';
import ChatAssistant from '../components/ChatAssistant';

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
    return (
        <div className="min-h-screen text-white p-4 relative">
            <div className="container mx-auto h-full">
                <div className="flex justify-between items-center mb-4 relative z-50">
                    <h1 className="text-2xl font-bold">Focus Mode</h1>
                    <button
                        onClick={onExitFocusMode}
                        className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                        <XMarkIcon className="h-5 w-5" />
                        <span>Exit Focus Mode</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-6 h-[calc(100vh-90px)] relative z-10">
                    {/* Left column for PDF viewer and YouTube player */}
                    <div className="space-y-6 h-full">
                        {/* PDF Viewer Container with fixed height and overflow hidden */}
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 h-[calc(70%-12px)] overflow-hidden relative">
                            <PDFViewer />
                        </div>
                        {/* YouTube Player Container with fixed height */}
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 h-[calc(30%-12px)] relative">
                            <h2 className="text-xl font-semibold mb-4">YouTube Player</h2>
                            <div className="h-[calc(100%-3rem)]">
                                <YouTubePlayer onClose={() => { }} isFocusMode={true} />
                            </div>
                        </div>
                    </div>

                    {/* Right column for minimized Timer */}
                    <div className="space-y-6">
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 relative">
                            <h2 className="text-xl font-semibold mb-4">Timer</h2>
                            <Timer duration={duration} onStateChange={onStateChange} isMinimized={true} />
                        </div>
                    </div>
                </div>
            </div>
            {/* Chat Assistant container with proper bounds for dragging */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 pointer-events-auto">
                    <ChatAssistant />
                </div>
            </div>
        </div>
    );
};

export default FocusModePage; 