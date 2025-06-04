import React, { useState, useEffect } from 'react';
import { FocusAnalyticsService } from '../services/FocusAnalyticsService';
import { Habit } from '../services/HabitReminderService';
import { PlayIcon, PauseIcon, StopIcon } from '@heroicons/react/24/solid';

interface FocusSessionTrackerProps {
    habit: Habit;
    onSessionComplete: () => void;
}

const FocusSessionTracker: React.FC<FocusSessionTrackerProps> = ({ habit, onSessionComplete }) => {
    const [isTracking, setIsTracking] = useState(false);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [distractions, setDistractions] = useState<string[]>([]);
    const [focusDropPoints, setFocusDropPoints] = useState<number[]>([]);
    const [currentDistraction, setCurrentDistraction] = useState('');

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isTracking) {
            interval = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTracking]);

    const startTracking = () => {
        setIsTracking(true);
        setStartTime(new Date());
        setElapsedTime(0);
        setDistractions([]);
        setFocusDropPoints([]);
    };

    const pauseTracking = () => {
        setIsTracking(false);
        if (elapsedTime > 0) {
            setFocusDropPoints(prev => [...prev, elapsedTime]);
        }
    };

    const stopTracking = () => {
        if (startTime) {
            const analyticsService = FocusAnalyticsService.getInstance();
            analyticsService.recordFocusSession(habit.id, {
                duration: elapsedTime,
                startTime: startTime.toISOString(),
                distractions,
                focusDropPoints
            });
        }
        setIsTracking(false);
        setStartTime(null);
        setElapsedTime(0);
        setDistractions([]);
        setFocusDropPoints([]);
        onSessionComplete();
    };

    const addDistraction = () => {
        if (currentDistraction.trim()) {
            setDistractions(prev => [...prev, currentDistraction.trim()]);
            setCurrentDistraction('');
        }
    };

    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-slate-700/50 rounded-lg p-6">
            <div className="text-center mb-6">
                <div className="text-4xl font-bold text-white mb-2">
                    {formatTime(elapsedTime)}
                </div>
                <div className="text-sm text-slate-400">
                    {isTracking ? 'Focus Session in Progress' : 'Ready to Focus'}
                </div>
            </div>

            <div className="flex justify-center space-x-4 mb-6">
                {!isTracking ? (
                    <button
                        onClick={startTracking}
                        className="p-3 bg-green-500/20 text-green-400 rounded-full hover:bg-green-500/30 transition-colors"
                    >
                        <PlayIcon className="h-6 w-6" />
                    </button>
                ) : (
                    <>
                        <button
                            onClick={pauseTracking}
                            className="p-3 bg-yellow-500/20 text-yellow-400 rounded-full hover:bg-yellow-500/30 transition-colors"
                        >
                            <PauseIcon className="h-6 w-6" />
                        </button>
                        <button
                            onClick={stopTracking}
                            className="p-3 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30 transition-colors"
                        >
                            <StopIcon className="h-6 w-6" />
                        </button>
                    </>
                )}
            </div>

            {isTracking && (
                <div className="space-y-4">
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={currentDistraction}
                            onChange={(e) => setCurrentDistraction(e.target.value)}
                            placeholder="Record a distraction..."
                            className="flex-1 px-3 py-2 bg-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                            onKeyPress={(e) => e.key === 'Enter' && addDistraction()}
                        />
                        <button
                            onClick={addDistraction}
                            className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-500 transition-colors"
                        >
                            Add
                        </button>
                    </div>

                    {distractions.length > 0 && (
                        <div className="bg-slate-600/50 rounded-lg p-3">
                            <h4 className="text-sm font-medium text-slate-300 mb-2">Recorded Distractions:</h4>
                            <ul className="space-y-1">
                                {distractions.map((distraction, index) => (
                                    <li key={index} className="text-sm text-slate-400">
                                        • {distraction}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FocusSessionTracker; 