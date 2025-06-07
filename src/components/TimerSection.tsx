import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../src/context/ThemeContext';

const TimerSection: React.FC = () => {
    const [minutes, setMinutes] = useState(25);
    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [breakMinutes, setBreakMinutes] = useState(5);
    const [completedSessions, setCompletedSessions] = useState(0);
    const [isFocusModeReady, setIsFocusModeReady] = useState(false);
    const navigate = useNavigate();
    const { currentTheme } = useTheme();

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
        <div className={`${currentTheme.colors.chatMessageListBg} rounded-xl p-8 mb-6 shadow-lg border border-gray-800 relative`}>
            <div className="flex justify-end items-start mb-8">
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

            <div className="text-center">
                <div className="text-3xl font-bold mb-2 text-white glow-teal tracking-wider">
                    FOCUS SESSION
                </div>
                <div className="text-8xl font-bold mb-8 text-white glow-teal">
                    {formatTime(minutes)}:{formatTime(seconds)}
                </div>

                <div className="flex justify-center space-x-4 mb-8">
                    <button
                        onClick={handleStart}
                        className="flex items-center space-x-2 px-6 py-3 rounded-lg bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        <i className="fas fa-play text-white"></i>
                        <span className="text-white font-medium">{isRunning ? 'Pause' : 'Start'}</span>
                    </button>
                    <button
                        onClick={handleReset}
                        className="flex items-center space-x-2 px-6 py-3 rounded-lg bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        <i className="fas fa-redo text-white"></i>
                        <span className="text-white font-medium">Reset</span>
                    </button>
                    <button
                        onClick={handleSkip}
                        className="flex items-center space-x-2 px-6 py-3 rounded-lg bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        <i className="fas fa-forward text-white"></i>
                        <span className="text-white font-medium">Skip</span>
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

                <div className={`mt-4 ${currentTheme.colors.chatMessageListBg} text-white px-4 py-2 rounded-lg shadow text-base border border-teal-700/40`}>
                    Completed Sessions: {completedSessions}
                </div>
            </div>
        </div>
    );
};

export default TimerSection; 