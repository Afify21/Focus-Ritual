import React, { useState, useCallback, useEffect } from 'react';
// TODO: Import actual icon components if using react-icons or similar

// Define props interface if needed
// interface TimerSectionProps {
//   duration: number; // Example: default duration in minutes
//   onStateChange: (state: any) => void; // Example: to report timer state changes up
// }

// const TimerSection: React.FC<TimerSectionProps> = ({ duration, onStateChange }) => {
const TimerSection: React.FC = () => { // Simplified for now
    const [minutes, setMinutes] = useState(25);
    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [breakMinutes, setBreakMinutes] = useState(5);
    const [completedSessions, setCompletedSessions] = useState(0);

    useEffect(() => {
        let timerId: NodeJS.Timeout | null = null;

        if (isRunning) {
            timerId = setInterval(() => {
                setSeconds(prevSeconds => {
                    if (prevSeconds === 0) {
                        setMinutes(prevMinutes => {
                            if (prevMinutes === 0) {
                                clearInterval(timerId!); // Use non-null assertion as timerId is set above
                                setIsRunning(false);
                                setCompletedSessions(prev => prev + 1); // Increment completed sessions
                                // Handle timer completion (e.g., switch to break time)
                                return 0;
                            }
                            return prevMinutes - 1;
                        });
                        return 59;
                    }
                    return prevSeconds - 1;
                });
            }, 1000);
        }

        // Cleanup function
        return () => {
            if (timerId) {
                clearInterval(timerId);
            }
        };
    }, [isRunning]); // Dependency array includes only isRunning

    // Format time to always show 2 digits
    const formatTime = (time: number) => {
        return time < 10 ? `0${time}` : time;
    };

    const handleStart = useCallback(() => {
        setIsRunning(prevIsRunning => !prevIsRunning);
    }, []); // Removed isRunning dependency

    const handleReset = useCallback(() => {
        setMinutes(25);
        setSeconds(0);
        setIsRunning(false);
    }, []);

    const handleSkip = useCallback(() => {
        setMinutes(breakMinutes);
        setSeconds(0);
    }, [breakMinutes]);

    const handleFocusTimeChange = useCallback((delta: number) => {
        setMinutes(prev => Math.max(1, Math.min(60, prev + delta)));
    }, []);

    const handleBreakTimeChange = useCallback((delta: number) => {
        setBreakMinutes(prev => Math.max(1, Math.min(30, prev + delta)));
    }, []);

    return (
        <>
            <div className="gradient-bg rounded-xl p-8 mb-8 shadow-lg border border-gray-800 relative">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-6 glow-teal tracking-wider">FOCUS SESSION</h2>
                    <div className="text-6xl md:text-8xl font-bold mb-10 glow-teal letter-spacing-2 tracking-wider animate-pulse-slow">
                        {formatTime(minutes)}:{formatTime(seconds)}
                    </div>
                    <div className="flex justify-center space-x-4 mb-6">
                        <button
                            onClick={handleStart}
                            className="pulse-animation bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-teal-500/30 transform hover:-translate-y-0.5"
                        >
                            <i className={`fas fa-${isRunning ? 'pause' : 'play'} mr-2`}></i>
                            {isRunning ? 'Pause' : 'Start'}
                        </button>
                        <button
                            onClick={handleReset}
                            className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-full transition"
                        >
                            <i className="fas fa-redo mr-2"></i>Reset
                        </button>
                        <button
                            onClick={handleSkip}
                            className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-full transition"
                        >
                            <i className="fas fa-step-forward mr-2"></i>Skip
                        </button>
                    </div>
                    <div className="flex justify-center space-x-4">
                        <div className="text-center">
                            <p className="text-gray-400 mb-1">Focus</p>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handleFocusTimeChange(-1)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <i className="fas fa-minus"></i>
                                </button>
                                <span className="font-medium">{minutes} min</span>
                                <button
                                    onClick={() => handleFocusTimeChange(1)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <i className="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-400 mb-1">Break</p>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handleBreakTimeChange(-1)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <i className="fas fa-minus"></i>
                                </button>
                                <span className="font-medium">{breakMinutes} min</span>
                                <button
                                    onClick={() => handleBreakTimeChange(1)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <i className="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Completed Sessions Counter - bottom right of timer window */}
                <div className="absolute bottom-4 right-4 bg-gray-900/90 text-white px-4 py-2 rounded-lg shadow text-base z-10 border border-teal-700/40">
                    Completed Sessions: {completedSessions}
                </div>
            </div>
        </>
    );
};

export default TimerSection;
