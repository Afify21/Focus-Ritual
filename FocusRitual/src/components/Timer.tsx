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

    return (
        <div className="flex flex-col items-center space-y-4">
            <div className="text-6xl font-mono font-bold">
                {formatTime(timeLeft)}
            </div>
            <div className="flex space-x-4">
                <button
                    onClick={toggleTimer}
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                    {isRunning ? (
                        <PauseIcon className="h-8 w-8" />
                    ) : (
                        <PlayIcon className="h-8 w-8" />
                    )}
                </button>
                <button
                    onClick={resetTimer}
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                >
                    <ArrowPathIcon className="h-8 w-8" />
                </button>
            </div>
        </div>
    );
};

export default Timer; 