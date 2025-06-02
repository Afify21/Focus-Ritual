import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PlayIcon, PauseIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { useTheme } from '../context/ThemeContext';

interface TimerProps {
    duration: number;
    onStateChange?: (state: {
        timeLeft: number;
        isRunning: boolean;
        isBreak: boolean;
        isPaused: boolean;
        completedSessions: number;
        hasStarted: boolean;
        isReset: boolean;
    }) => void;
    isMinimized?: boolean;
}

const Timer: React.FC<TimerProps> = ({ duration, onStateChange, isMinimized = false }) => {
    const [timeLeft, setTimeLeft] = useState(duration);
    const [isRunning, setIsRunning] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [completedSessions, setCompletedSessions] = useState(0);
    const [isReset, setIsReset] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const { currentTheme } = useTheme();

    const handleTimerComplete = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        if (!isBreak) {
            setIsBreak(true);
            setTimeLeft(300); // 5-minute break
            setCompletedSessions(prev => prev + 1);
        } else {
            setIsBreak(false);
            setTimeLeft(duration);
        }

        setIsRunning(false);
        setHasStarted(false);
        setIsPaused(false);
    }, [isBreak, duration]);

    useEffect(() => {
        if (timeLeft === 0) {
            if (onStateChange) {
                onStateChange({
                    timeLeft: 0,
                    isRunning: false,
                    isBreak: true,
                    isPaused: false,
                    completedSessions: completedSessions + 1,
                    hasStarted: true,
                    isReset: false
                });
            }
            return;
        }

        let timer: NodeJS.Timeout | null = null;
        if (isRunning) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        }

        return () => {
            if (timer) {
                clearInterval(timer);
            }
        };
    }, [timeLeft, onStateChange, completedSessions, isRunning]);

    useEffect(() => {
        if (onStateChange) {
            onStateChange({
                timeLeft,
                isRunning,
                isBreak,
                isPaused,
                completedSessions,
                hasStarted,
                isReset
            });
        }
    }, [timeLeft, isRunning, isBreak, isPaused, completedSessions, hasStarted, isReset, onStateChange]);

    // Reset timer when duration changes
    useEffect(() => {
        resetTimer();
    }, [duration]);

    const toggleTimer = () => {
        if (!hasStarted) {
            setHasStarted(true);
            setIsReset(true);
            setTimeout(() => setIsReset(false), 100);
        }
        const newIsRunning = !isRunning;
        setIsRunning(newIsRunning);
        setIsPaused(!newIsRunning);
    };

    const resetTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setIsRunning(false);
        setHasStarted(false);
        setIsBreak(false);
        setIsPaused(false);
        setTimeLeft(duration);
        setIsReset(true);
        // Reset the isReset flag after a short delay
        setTimeout(() => setIsReset(false), 100);
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = duration > 0 ? ((duration - timeLeft) / duration) * 100 : 0;

    if (isMinimized) {
        return (
            <div className="bg-slate-800/70 backdrop-blur-md rounded-xl p-2 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-white">{formatTime(timeLeft)}</span>
                    <div className="text-slate-300">
                        {isBreak ? 'Break' : 'Focus'}
                    </div>
                </div>
                <div className="flex space-x-0.5">
                    <button
                        onClick={toggleTimer}
                        className="p-1 rounded-full bg-slate-600 hover:bg-slate-700 transition-colors"
                    >
                        {!isRunning && !isPaused ? (
                            <PlayIcon className="h-3 w-3 text-white" />
                        ) : isPaused ? (
                            <PlayIcon className="h-3 w-3 text-white" />
                        ) : (
                            <PauseIcon className="h-3 w-3 text-white" />
                        )}
                    </button>
                    <button
                        onClick={resetTimer}
                        className="p-1 rounded-full bg-slate-600 hover:bg-slate-700 transition-colors"
                    >
                        <ArrowPathIcon className="h-3 w-3 text-white" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-xl border border-white/10">
            <div className="flex flex-col items-center">
                <div className="relative w-48 h-48 mb-6">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle
                            className="text-slate-700"
                            strokeWidth="8"
                            stroke="currentColor"
                            fill="transparent"
                            r="46"
                            cx="50"
                            cy="50"
                        />
                        <circle
                            className="text-slate-400"
                            strokeWidth="8"
                            strokeDasharray={2 * Math.PI * 46}
                            strokeDashoffset={2 * Math.PI * 46 * (1 - progress / 100)}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="46"
                            cx="50"
                            cy="50"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl font-bold text-white">{formatTime(timeLeft)}</span>
                    </div>
                </div>
                <div className="flex space-x-4">
                    <button
                        onClick={toggleTimer}
                        className="flex items-center space-x-2 px-6 py-3 rounded-lg bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        {!hasStarted ? (
                            <>
                                <PlayIcon className="h-6 w-6 text-white" />
                                <span className="text-white font-medium">Start</span>
                            </>
                        ) : isPaused ? (
                            <>
                                <PlayIcon className="h-6 w-6 text-white" />
                                <span className="text-white font-medium">Resume</span>
                            </>
                        ) : (
                            <>
                                <PauseIcon className="h-6 w-6 text-white" />
                                <span className="text-white font-medium">Pause</span>
                            </>
                        )}
                    </button>
                    <button
                        onClick={resetTimer}
                        className="flex items-center space-x-2 px-6 py-3 rounded-lg bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        <ArrowPathIcon className="h-6 w-6 text-white" />
                        <span className="text-white font-medium">Reset</span>
                    </button>
                </div>
                <div className="mt-4 text-slate-300 font-medium">
                    {isBreak ? 'Break Time' : 'Focus Time'}
                </div>
                <div className="mt-2 text-slate-400">
                    Completed Sessions: {completedSessions}
                </div>
            </div>
        </div>
    );
};

export default Timer; 