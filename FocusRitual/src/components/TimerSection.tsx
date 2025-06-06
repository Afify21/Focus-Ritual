import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TasksList from './TasksList';
// TODO: Import actual icon components if using react-icons or similar

// Define props interface if needed
// interface TimerSectionProps {
//   duration: number; // Example: default duration in minutes
//   onStateChange: (state: any) => void; // Example: to report timer state changes up
// }

// const TimerSection: React.FC<TimerSectionProps> = ({ duration, onStateChange }) => {
const TimerSection: React.FC = () => {
    const [minutes, setMinutes] = useState(25);
    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [breakMinutes, setBreakMinutes] = useState(5);
    const [completedSessions, setCompletedSessions] = useState(0);
    const [isFocusModeReady, setIsFocusModeReady] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        let timerId: NodeJS.Timeout | null = null;

        if (isRunning) {
            timerId = setInterval(() => {
                setSeconds(prevSeconds => {
                    if (prevSeconds === 0) {
                        setMinutes(prevMinutes => {
                            if (prevMinutes === 0) {
                                clearInterval(timerId!);
                                setIsRunning(false);
                                setCompletedSessions(prev => prev + 1);
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

        return () => {
            if (timerId) {
                clearInterval(timerId);
            }
        };
    }, [isRunning]);

    // Format time to always show 2 digits
    const formatTime = (time: number) => {
        return time < 10 ? `0${time}` : time;
    };

    const handleStart = useCallback(() => {
        setIsRunning(prevIsRunning => !prevIsRunning);
    }, []);

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

    const handleFocusModeToggle = () => {
        setIsFocusModeReady(!isFocusModeReady);
        if (!isFocusModeReady) {
            navigate('/focus-mode');
        }
    };

    return (
        <div className="gradient-bg rounded-xl p-8 mb-6 shadow-lg border border-gray-800 relative">
            <div className="flex justify-between items-start mb-8">
                <h2 className="text-3xl font-bold glow-teal tracking-wider">FOCUS SESSION</h2>
                <button
                    onClick={handleFocusModeToggle}
                    className="relative inline-flex items-center cursor-pointer"
                >
                    <div className={`w-14 h-8 rounded-full shadow-inner relative flex items-center justify-center transition-all duration-300 ${isFocusModeReady ? 'bg-gradient-to-r from-teal-500 to-teal-600 shadow-teal-500/30' : 'bg-gray-700 shadow-gray-600/30'}`}>
                        {isFocusModeReady && <span className="text-xs font-medium text-white z-10">GO</span>}
                    </div>
                    <div className={`absolute top-1/2 transform -translate-y-1/2 bg-gradient-to-b from-gray-100 to-white rounded-full h-6 w-6 border border-gray-300 transition-all duration-300 ${isFocusModeReady ? 'right-1' : 'left-1'}`}></div>
                </button>
            </div>

            <div className="grid grid-cols-[2fr_1fr] gap-6">
                <div className="text-center">
                    <div className="text-7xl md:text-9xl font-bold mb-12 glow-teal letter-spacing-2 tracking-wider animate-pulse-slow">
                        {formatTime(minutes)}:{formatTime(seconds)}
                    </div>
                    <div className="flex justify-center space-x-6 mb-8">
                        <button
                            onClick={handleStart}
                            className="pulse-animation bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold py-4 px-10 rounded-full transition-all duration-300 shadow-lg hover:shadow-teal-500/30 transform hover:-translate-y-0.5 text-lg"
                        >
                            <i className={`fas fa-${isRunning ? 'pause' : 'play'} mr-2`}></i>
                            {isRunning ? 'Pause' : 'Start'}
                        </button>
                        <button
                            onClick={handleReset}
                            className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 px-8 rounded-full transition text-lg"
                        >
                            <i className="fas fa-redo mr-2"></i>Reset
                        </button>
                        <button
                            onClick={handleSkip}
                            className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 px-8 rounded-full transition text-lg"
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
                <div className="space-y-4">
                    <TasksList />
                    <div className="bg-gray-900/90 text-white px-4 py-2 rounded-lg shadow text-base border border-teal-700/40">
                        Completed Sessions: {completedSessions}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimerSection;
