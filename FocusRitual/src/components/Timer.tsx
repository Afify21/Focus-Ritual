import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PlayIcon, PauseIcon, ArrowPathIcon, ForwardIcon } from '@heroicons/react/24/solid';
import { useTheme } from '../context/ThemeContext';
import DataService from '../services/DataService';

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
    const [currentDuration, setCurrentDuration] = useState(duration);
    const [isRunning, setIsRunning] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [completedSessions, setCompletedSessions] = useState(0);
    const [isReset, setIsReset] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const { currentTheme } = useTheme();

    const getBreakDuration = (focusDuration: number): number => {
        // Calculate break duration based on focus duration
        if (focusDuration === 1500) return 300; // 25 min -> 5 min break
        if (focusDuration === 3000) return 600; // 50 min -> 10 min break
        if (focusDuration === 5400) return 1800; // 90 min -> 30 min break
        return 300; // Default 5 min break
    };

    const handleTimerComplete = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        if (!isBreak) {
            // Work timer completed, start break timer
            const breakDuration = getBreakDuration(duration);
            setIsBreak(true);
            setCurrentDuration(breakDuration);
            setTimeLeft(breakDuration);
            setCompletedSessions(prev => prev + 1);
            setIsRunning(false);
            setHasStarted(false);
            setIsPaused(false);

            // Save the completed session with productivity feedback
            DataService.Sessions.addSession({
                startTime: new Date(Date.now() - duration * 1000).toISOString(),
                endTime: new Date().toISOString(),
                duration: duration,
                completed: true,
                feedback: {
                    productivity: 8, // Default productivity score
                    mood: 4, // 1-5 scale, 4 = satisfied
                    distractions: 0, // No distractions for completed sessions
                    notes: 'Session completed successfully'
                }
            });

            // Start the break timer automatically
            setTimeout(() => {
                setIsRunning(true);
                setHasStarted(true);
            }, 1000);
        } else {
            // Break timer completed, reset to work timer
            setIsBreak(false);
            setCurrentDuration(duration);
            setTimeLeft(duration);
            setIsRunning(false);
            setHasStarted(false);
            setIsPaused(false);
        }
    }, [isBreak, duration]);

    const skipSession = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        if (!isBreak) {
            // Skip work timer, start break timer
            const breakDuration = getBreakDuration(duration);
            setIsBreak(true);
            setCurrentDuration(breakDuration);
            setTimeLeft(breakDuration);
            setCompletedSessions(prev => prev + 1);
            setIsRunning(false);
            setHasStarted(false);
            setIsPaused(false);

            // Save the completed session with productivity feedback
            DataService.Sessions.addSession({
                startTime: new Date(Date.now() - duration * 1000).toISOString(),
                endTime: new Date().toISOString(),
                duration: duration,
                completed: true,
                feedback: {
                    productivity: 5, // Lower productivity score for skipped sessions
                    mood: 3, // 1-5 scale, 3 = neutral
                    distractions: 1, // One distraction for skipped sessions
                    notes: 'Session skipped'
                }
            });

            // Start the break timer automatically
            setTimeout(() => {
                setIsRunning(true);
                setHasStarted(true);
            }, 1000);
        } else {
            // Skip break timer, reset to work timer
            setIsBreak(false);
            setCurrentDuration(duration);
            setTimeLeft(duration);
            setIsRunning(false);
            setHasStarted(false);
            setIsPaused(false);
        }
    };

    useEffect(() => {
        if (isRunning) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    const newTimeLeft = prev - 1;
                    if (newTimeLeft <= 0) {
                        handleTimerComplete();
                        return 0;
                    }
                    return newTimeLeft;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [isRunning, handleTimerComplete]);

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
        setCurrentDuration(duration);
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

    const progress = currentDuration > 0 ? ((currentDuration - timeLeft) / currentDuration) * 100 : 0;

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
                    <button
                        onClick={skipSession}
                        className="p-1 rounded-full bg-slate-600 hover:bg-slate-700 transition-colors"
                    >
                        <ForwardIcon className="h-3 w-3 text-white" />
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
                    <button
                        onClick={skipSession}
                        className="flex items-center space-x-2 px-6 py-3 rounded-lg bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        <ForwardIcon className="h-6 w-6 text-white" />
                        <span className="text-white font-medium">Skip</span>
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