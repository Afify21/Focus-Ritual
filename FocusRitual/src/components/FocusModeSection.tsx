import React from 'react';
import { Link } from 'react-router-dom'; // Assuming react-router-dom for navigation
// TODO: Import actual icon components if using react-icons or similar

// Define props interface
interface FocusModeSectionProps {
    onGoToFocusMode: () => void; // Handler to navigate to focus mode page
}

const FocusModeSection: React.FC<FocusModeSectionProps> = ({ onGoToFocusMode }) => {
    return (
        <div className="gradient-bg rounded-xl p-6 mb-8 shadow-lg border border-gray-800">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center">
                    {/* Replace with actual icon component */}
                    <i className="fas fa-bolt text-teal-400 mr-2"></i>
                    <span className="glow-teal">Focus Mode</span>
                </h3>
                {/* Using a button with onClick instead of <a> for React navigation */}
                <button
                    onClick={onGoToFocusMode}
                    className="relative inline-flex items-center" // Removed focus:outline-none
                >
                    <div className="w-14 h-8 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full shadow-inner relative flex items-center justify-center shadow-teal-500/30">
                        <span className="text-xs font-medium text-white">GO</span>
                        {/* This is a visual element, keep it as div */}
                        <div className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-gradient-to-b from-gray-100 to-white rounded-full h-6 w-6 border border-gray-300"></div>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default FocusModeSection;
