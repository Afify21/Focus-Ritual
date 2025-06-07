import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// TODO: Import actual icon components if using react-icons or similar
// TODO: Import actual PDF Viewer and Media Player components

// Define props interface
interface FocusModePageProps {
    // Add any necessary props here, e.g., initial timer duration, selected sound, volume
    // duration?: number;
    // initialVolume?: number;
    // initialSound?: string | null;
    // onExitFocusMode: () => void; // Handler to call when exiting focus mode
}

const FocusModePage: React.FC<FocusModePageProps> = (
    // { duration = 25 * 60, initialVolume = 70, initialSound = null, onExitFocusMode } // Example props
    { } // Simplified for now
) => {
    const navigate = useNavigate();

    // State for the compact timer (example, could be passed as prop)
    const [compactMinutes, setCompactMinutes] = useState(25);
    const [compactSeconds, setCompactSeconds] = useState(0);
    const [compactTimerIntervalId, setCompactTimerIntervalId] = useState<NodeJS.Timeout | null>(null);

    // Basic compact timer logic
    useEffect(() => {
        const id = setInterval(() => {
            setCompactSeconds((prevSeconds) => {
                if (prevSeconds === 0) {
                    setCompactMinutes((prevMinutes) => {
                        if (prevMinutes === 0) {
                            clearInterval(id);
                            // Handle timer end in focus mode
                            return 0;
                        }
                        return prevMinutes - 1;
                    });
                    return 59;
                }
                return prevSeconds - 1;
            });
        }, 1000);
        setCompactTimerIntervalId(id);

        return () => { // Cleanup on unmount
            if (id) {
                clearInterval(id);
                setCompactTimerIntervalId(null);
            }
        };
    }, []); // Empty dependency array to run only once on mount

    // Format time to always show 2 digits
    const formatTime = (time: number) => {
        return time < 10 ? `0${time}` : time;
    };

    const handleExitFocusMode = () => {
        // Call parent handler if provided
        // if (onExitFocusMode) {
        //     onExitFocusMode();
        // }
        // Navigate back to the main page
        navigate('/');
    };

    // TODO: Implement Theme Selector logic (state and handlers)
    // TODO: Implement PDF Viewer logic (loading, navigation, search, download)
    // TODO: Implement YouTube Player logic (loading, search, playback controls)

    return (
        <div className="bg-black text-white min-h-screen flex flex-col">
            {/* Focus Mode Header */}
            <header className="bg-gray-900 border-b border-gray-800 p-4 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    {/* Compact Timer */}
                    <div className="bg-gray-800 rounded-lg p-2 px-3 text-center">
                        <div className="text-xs text-gray-400">TIMER</div>
                        <div className="text-xl font-mono" id="compact-timer">{formatTime(compactMinutes)}:{formatTime(compactSeconds)}</div>
                    </div>

                    {/* Theme Selector */}
                    {/* TODO: Convert to a reusable ThemeSelector Component */}
                    <div className="relative group">
                        <button className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded-lg flex items-center space-x-1 text-sm">
                            {/* Replace with actual icon component */}
                            <i className="fas fa-palette text-teal-400"></i>
                            <span>Themes</span>
                        </button>
                        <div className="absolute left-0 mt-2 w-40 bg-gray-800 rounded-lg shadow-xl py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-gray-700/50">
                            {/* TODO: Implement theme selection logic */}
                            <button className="block w-full text-left px-3 py-2 text-white hover:bg-teal-900/20 transition text-sm">
                                <span className="text-teal-400">◉</span> Dark
                            </button>
                            <button className="block w-full text-left px-3 py-2 text-white hover:bg-teal-900/20 transition text-sm">
                                <span className="text-gray-400">○</span> Light
                            </button>
                            <button className="block w-full text-left px-3 py-2 text-white hover:bg-teal-900/20 transition text-sm">
                                <span className="text-gray-400">○</span> Sepia
                            </button>
                        </div>
                    </div>
                </div>

                {/* Exit Focus Mode Button */}
                {/* Use button with onClick for React navigation */}
                <button
                    onClick={handleExitFocusMode}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-1.5 rounded-lg text-sm flex items-center space-x-1 transition"
                >
                    {/* Replace with actual icon component */}
                    <i className="fas fa-times"></i>
                    <span>Exit</span>
                </button>
            </header>

            {/* Main Content - Split View */}
            <div className="flex flex-1"> {/* Use flex-1 to make it take available height */}
                {/* PDF Viewer (Left Panel) */}
                <div className="w-3/5 border-r border-gray-800 flex flex-col"> {/* Added flex-col */}
                    <div className="pdf-container bg-gray-900 flex flex-col flex-1"> {/* Added flex-1 */}
                        <div className="p-3 bg-gray-800 border-b border-gray-700 flex justify-between items-center"> {/* Added items-center */}
                            <div className="text-sm text-gray-400">Document.pdf</div> {/* TODO: Make dynamic */}
                            <div className="flex space-x-2">
                                {/* TODO: Implement search and download functionality */}
                                <button className="p-1 text-gray-400 hover:text-white">
                                    {/* Replace with actual icon component */}
                                    <i className="fas fa-search"></i>
                                </button>
                                <button className="p-1 text-gray-400 hover:text-white">
                                    {/* Replace with actual icon component */}
                                    <i className="fas fa-download"></i>
                                </button>
                            </div>
                        </div>
                        {/* TODO: Replace with actual PDF Viewer component */}
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                {/* Replace with actual icon component */}
                                <i className="fas fa-file-pdf text-5xl mb-2"></i>
                                <p>PDF Viewer Placeholder</p>
                            </div>
                        </div>
                        <div className="p-2 bg-gray-800 border-t border-gray-700 flex justify-center items-center space-x-4"> {/* Added items-center */}
                            {/* TODO: Implement PDF navigation */}
                            <button className="p-1 px-2 text-gray-400 hover:text-white">
                                {/* Replace with actual icon component */}
                                <i className="fas fa-arrow-left"></i>
                            </button>
                            <span className="text-sm text-gray-400 flex items-center">Page 1 of 10</span> {/* TODO: Make dynamic */}
                            <button className="p-1 px-2 text-gray-400 hover:text-white">
                                {/* Replace with actual icon component */}
                                <i className="fas fa-arrow-right"></i>
                            </button>
                        </div>
                    </div>
                </div>

                {/* YouTube Player (Right Panel) */}
                <div className="w-2/5 flex flex-col"> {/* Added flex-col */}
                    <div className="p-3 bg-gray-800 border-b border-gray-700 flex items-center space-x-2">
                        {/* Replace with actual icon component */}
                        <i className="fab fa-youtube text-red-500"></i>
                        <span className="text-sm">YouTube</span>
                        <div className="flex-1 flex justify-end">
                            {/* TODO: Implement YouTube search input logic */}
                            <input type="text" placeholder="Search YouTube..." className="bg-gray-700 text-sm rounded px-2 py-1 w-64" autoComplete="off" />
                        </div>
                    </div>

                    {/* TODO: Replace with actual YouTube Player component */}
                    <div className="flex-1 bg-gray-900 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                            {/* Replace with actual icon component */}
                            <i className="fab fa-youtube text-5xl text-red-500 mb-2"></i>
                            <p>YouTube Player Placeholder</p>
                        </div>
                    </div>

                    {/* TODO: Implement YouTube playback controls logic */}
                    <div className="p-3 bg-gray-800 border-t border-gray-700">
                        <div className="flex items-center space-x-2">
                            {/* Replace with actual icon components */}
                            <button className="p-1 text-gray-400 hover:text-white">
                                <i className="fas fa-step-backward"></i>
                            </button>
                            <button className="p-1 text-gray-400 hover:text-white">
                                <i className="fas fa-play"></i>
                            </button>
                            <button className="p-1 text-gray-400 hover:text-white">
                                <i className="fas fa-step-forward"></i>
                            </button>
                            <div className="flex-1 px-2">
                                {/* TODO: Implement progress bar logic */}
                                <div className="h-1 bg-gray-700 rounded-full">
                                    <div className="h-1 bg-red-500 rounded-full w-1/3"></div> {/* TODO: Make width dynamic */}
                                </div>
                            </div>
                            <div className="text-xs text-gray-400">1:45 / 5:30</div> {/* TODO: Make dynamic */}
                        </div>
                    </div>
                </div>
            </div>
            {/* No footer in focus mode HTML, so none here */}
        </div>
    );
};

export default FocusModePage;
