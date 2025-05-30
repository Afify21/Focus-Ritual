import React, { useState, useEffect, useCallback } from 'react';
import { PlayIcon, PauseIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

interface TimerProps {
    duration: number;
    onStateChange?: (state: {
        timeLeft: number;
        isRunning: boolean;
        isBreak: boolean;
        isPaused: boolean;
        completedSessions: number;
        hasStarted: boolean;
    }) => void;
}

const Timer: React.FC<TimerProps> = ({ duration, onStateChange }) => {
    const [timeLeft, setTimeLeft] = useState(duration);
    const [isRunning, setIsRunning] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [completedSessions, setCompletedSessions] = useState(0);
    const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);

    const handleTimerComplete = useCallback(() => {
        setIsRunning(false);
        setHasStarted(false);
        setIsPaused(false);
        if (timerId) {
            clearInterval(timerId);
            setTimerId(null);
        }
        if (!isBreak) {
            setIsBreak(true);
            setTimeLeft(300); // 5-minute break
            setCompletedSessions(prev => prev + 1);
        } else {
            setIsBreak(false);
            setTimeLeft(duration);
        }
    }, [timerId, isBreak, duration]);

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            const id = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        handleTimerComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            setTimerId(id);
            return () => {
                if (id) clearInterval(id);
            };
        }
    }, [isRunning, timeLeft, handleTimerComplete]);

    useEffect(() => {
        if (onStateChange) {
            onStateChange({
                timeLeft,
                isRunning,
                isBreak,
                isPaused,
                completedSessions,
                hasStarted
            });
        }
    }, [timeLeft, isRunning, isBreak, isPaused, completedSessions, hasStarted, onStateChange]);

    const toggleTimer = () => {
        if (!hasStarted) {
            setHasStarted(true);
        }
        setIsRunning(!isRunning);
        setIsPaused(!isRunning);
    };

    const resetTimer = () => {
        if (timerId) {
            clearInterval(timerId);
            setTimerId(null);
        }
        setIsRunning(false);
        setHasStarted(false);
        setIsBreak(false);
        setIsPaused(false);
        setTimeLeft(duration);
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = ((duration - timeLeft) / duration) * 100;

    return (
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
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
                        <span className="text-4xl font-bold">{formatTime(timeLeft)}</span>
                    </div>
                </div>
                <div className="flex space-x-4">
                    <button
                        onClick={toggleTimer}
                        className="flex items-center space-x-2 px-6 py-3 rounded-lg bg-slate-600 hover:bg-slate-700 transition-colors"
                    >
                        {!hasStarted ? (
                            <>
                                <PlayIcon className="h-6 w-6" />
                                <span>Start</span>
                            </>
                        ) : isPaused ? (
                            <>
                                <PlayIcon className="h-6 w-6" />
                                <span>Resume</span>
                            </>
                        ) : (
                            <>
                                <PauseIcon className="h-6 w-6" />
                                <span>Pause</span>
                            </>
                        )}
                    </button>
                    <button
                        onClick={resetTimer}
                        className="flex items-center space-x-2 px-6 py-3 rounded-lg bg-slate-600 hover:bg-slate-700 transition-colors"
                    >
                        <ArrowPathIcon className="h-6 w-6" />
                        <span>Reset</span>
                    </button>
                </div>
                <div className="mt-4 text-slate-400">
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