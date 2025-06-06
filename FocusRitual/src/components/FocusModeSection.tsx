import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Assuming react-router-dom for navigation
// TODO: Import actual icon components if using react-icons or similar

// Define props interface
interface FocusModeSectionProps {
    onGoToFocusMode: () => void; // Handler to navigate to focus mode page
}

const FocusModeSection: React.FC<FocusModeSectionProps> = ({ onGoToFocusMode }) => {
    // State to manage the toggle status, initialized to off
    const [isFocusModeReady, setIsFocusModeReady] = useState(false);

    const handleToggle = () => {
        // Toggle the state
        setIsFocusModeReady(!isFocusModeReady);
        // If turning on (becoming ready), call the navigation handler
        if (!isFocusModeReady) {
            onGoToFocusMode();
        }
    };

    return (
        <div className="gradient-bg rounded-xl p-6 mb-8 shadow-lg border border-gray-800">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center">
                    {/* Replace with actual icon component */}
                    <i className="fas fa-bolt text-teal-400 mr-2"></i>
                    <span className="glow-teal">Focus Mode</span>
                </h3>
                {/* Using a button with onClick for the custom toggle */}
                <button
                    onClick={handleToggle}
                    className="relative inline-flex items-center cursor-pointer"
                >
                    {/* Toggle Track */}
                    <div className={`w-14 h-8 rounded-full shadow-inner relative flex items-center justify-center transition-all duration-300 ${isFocusModeReady ? 'bg-gradient-to-r from-teal-500 to-teal-600 shadow-teal-500/30' : 'bg-gray-700 shadow-gray-600/30'}`}>
                        {/* Toggle Text */}
                        {isFocusModeReady && <span className="text-xs font-medium text-white z-10">GO</span>}
                    </div>
                    {/* Toggle Thumb */}
                    <div className={`absolute top-1/2 transform -translate-y-1/2 bg-gradient-to-b from-gray-100 to-white rounded-full h-6 w-6 border border-gray-300 transition-all duration-300 ${isFocusModeReady ? 'right-1' : 'left-1'}`}></div>
                </button>
            </div>
        </div>
    );
};

export default FocusModeSection;
