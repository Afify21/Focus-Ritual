import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';

type Mood = 'energetic' | 'calm' | 'focused' | 'relaxed';

interface RitualStep {
    id: string;
    title: string;
    description: string;
    duration: number;
    audioUrl?: string;
    voicePrompt?: string;
    mood?: Mood;
    intensity?: number;
    customPrompt?: string;
}

interface FocusRitualProps {
    onComplete: () => void;
    customRitual?: RitualStep[];
    onMoodChange?: (mood: string) => void;
    onIntensityChange?: (intensity: number) => void;
}

interface MoodData {
    timestamp: number;
    mood: string;
    intensity: number;
    heartRate?: number;
    stressLevel?: number;
}

const defaultRitual: RitualStep[] = [
    {
        id: 'breathing',
        title: 'Deep Breathing',
        description: 'Take 3 deep breaths to center yourself',
        duration: 30,
        voicePrompt: 'Guide the user through 3 deep breaths, emphasizing the importance of mindful breathing for focus.',
        mood: 'calm',
        intensity: 0.3,
    },
    {
        id: 'soundscape',
        title: 'Soundscape',
        description: 'Listen to calming ambient sounds',
        duration: 60,
        voicePrompt: 'Create a calming ambient soundscape that helps the user enter a focused state.',
        mood: 'focused',
        intensity: 0.5,
    },
    {
        id: 'intention',
        title: 'Set Intention',
        description: 'Set your focus intention for this session',
        duration: 30,
        voicePrompt: 'Guide the user in setting a clear intention for their focus session.',
        mood: 'energetic',
        intensity: 0.7,
    },
];

const FocusRitual: React.FC<FocusRitualProps> = ({
    onComplete,
    customRitual,
    onMoodChange,
    onIntensityChange,
}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
    const [isGeneratingVoiceover, setIsGeneratingVoiceover] = useState(false);
    const [ritualSteps, setRitualSteps] = useState<RitualStep[]>(customRitual || defaultRitual);
    const [customDuration, setCustomDuration] = useState<number>(ritualSteps[0].duration);
    const [moodData, setMoodData] = useState<MoodData[]>([]);
    const [currentMood, setCurrentMood] = useState<Mood>(ritualSteps[0].mood || 'calm');
    const [currentIntensity, setCurrentIntensity] = useState<number>(ritualSteps[0].intensity || 0.5);
    const [isCustomizing, setIsCustomizing] = useState(false);
    const [customPrompt, setCustomPrompt] = useState('');
    const [isAnalyzingMood, setIsAnalyzingMood] = useState(false);
    const [showMoodInsights, setShowMoodInsights] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);

    // Keyboard shortcuts
    useHotkeys('space', () => isPlaying ? handlePause() : handleStart());
    useHotkeys('esc', () => handlePause());
    useHotkeys('ctrl+shift+c', () => setIsCustomizing(true));

    useEffect(() => {
        if (currentStep < ritualSteps.length) {
            setTimeLeft(ritualSteps[currentStep].duration);
            setCustomDuration(ritualSteps[currentStep].duration);
            setCurrentMood(ritualSteps[currentStep].mood || 'calm');
            setCurrentIntensity(ritualSteps[currentStep].intensity || 0.5);
        }
    }, [currentStep, ritualSteps]);

    useEffect(() => {
        if (isPlaying && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && currentStep < ritualSteps.length - 1) {
            setCurrentStep((prev) => prev + 1);
        } else if (timeLeft === 0 && currentStep === ritualSteps.length - 1) {
            onComplete();
        }
    }, [isPlaying, timeLeft, currentStep, ritualSteps.length, onComplete]);

    useEffect(() => {
        // Initialize audio context for mood analysis
        audioContextRef.current = new AudioContext();
        return () => {
            audioContextRef.current?.close();
            mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        };
    }, []);

    const startMoodAnalysis = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            const source = audioContextRef.current?.createMediaStreamSource(stream);
            const analyzer = audioContextRef.current?.createAnalyser();
            source?.connect(analyzer!);

            const dataArray = new Uint8Array(analyzer!.frequencyBinCount);
            const analyzeMood = () => {
                if (!isPlaying) return;
                analyzer!.getByteFrequencyData(dataArray);
                // Analyze audio data for mood indicators
                const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                const mood = analyzeAudioMood(average);
                setMoodData(prev => [...prev, {
                    timestamp: Date.now(),
                    mood,
                    intensity: currentIntensity,
                }]);
                requestAnimationFrame(analyzeMood);
            };
            analyzeMood();
        } catch (error) {
            console.error('Error starting mood analysis:', error);
        }
    };

    const analyzeAudioMood = (average: number): string => {
        // Simple mood analysis based on audio frequency
        if (average < 50) return 'calm';
        if (average < 100) return 'focused';
        if (average < 150) return 'energetic';
        return 'excited';
    };

    const generateVoiceover = async (step: RitualStep) => {
        setIsGeneratingVoiceover(true);
        try {
            const response = await fetch('/api/ai/generate-voiceover', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: step.customPrompt || step.voicePrompt,
                    duration: step.duration,
                    mood: step.mood,
                    intensity: step.intensity,
                }),
            });
            const data = await response.json();
            return data.audioUrl;
        } catch (error) {
            console.error('Error generating voiceover:', error);
            return null;
        } finally {
            setIsGeneratingVoiceover(false);
        }
    };

    const handleStart = async () => {
        setIsPlaying(true);
        startMoodAnalysis();
        const currentStepData = ritualSteps[currentStep];

        if (currentStepData.voicePrompt || currentStepData.customPrompt) {
            const audioUrl = await generateVoiceover(currentStepData);
            if (audioUrl) {
                const newAudio = new Audio(audioUrl);
                newAudio.play();
                setAudio(newAudio);
            }
        } else if (currentStepData.audioUrl) {
            const newAudio = new Audio(currentStepData.audioUrl);
            newAudio.play();
            setAudio(newAudio);
        }

        // Notify mood and intensity changes
        onMoodChange?.(currentStepData.mood || 'neutral');
        onIntensityChange?.(currentStepData.intensity || 0.5);
    };

    const handlePause = () => {
        setIsPlaying(false);
        if (audio) {
            audio.pause();
        }
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    };

    const handleCustomizeDuration = (newDuration: number) => {
        setCustomDuration(newDuration);
        const updatedSteps = [...ritualSteps];
        updatedSteps[currentStep] = {
            ...updatedSteps[currentStep],
            duration: newDuration,
        };
        setRitualSteps(updatedSteps);
        setTimeLeft(newDuration);
    };

    const handleCustomizeStep = () => {
        const updatedSteps = [...ritualSteps];
        updatedSteps[currentStep] = {
            ...updatedSteps[currentStep],
            customPrompt,
            mood: currentMood,
            intensity: currentIntensity,
        };
        setRitualSteps(updatedSteps);
        setIsCustomizing(false);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getMoodColor = (mood: string) => {
        switch (mood) {
            case 'calm': return 'bg-blue-500';
            case 'focused': return 'bg-green-500';
            case 'energetic': return 'bg-yellow-500';
            case 'excited': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full"
            >
                <h2 className="text-2xl font-bold text-center mb-6">Focus Ritual</h2>

                {currentStep < ritualSteps.length ? (
                    <>
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-2">
                                {ritualSteps[currentStep].title}
                            </h3>
                            <p className="text-gray-600">
                                {ritualSteps[currentStep].description}
                            </p>
                            <div className="flex items-center mt-2">
                                <span className="text-sm text-gray-500 mr-2">Mood:</span>
                                <span className={`px-2 py-1 rounded text-white ${getMoodColor(ritualSteps[currentStep].mood || 'neutral')}`}>
                                    {ritualSteps[currentStep].mood || 'neutral'}
                                </span>
                            </div>
                        </div>

                        <div className="text-center mb-6">
                            <motion.div
                                key={timeLeft}
                                initial={{ scale: 0.5 }}
                                animate={{ scale: 1 }}
                                className="text-4xl font-bold mb-4"
                            >
                                {formatTime(timeLeft)}
                            </motion.div>
                            <div className="flex justify-center space-x-4">
                                {!isPlaying ? (
                                    <button
                                        onClick={handleStart}
                                        disabled={isGeneratingVoiceover}
                                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
                                    >
                                        {isGeneratingVoiceover ? 'Generating...' : 'Start'}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handlePause}
                                        className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                                    >
                                        Pause
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Customize Duration (seconds)
                            </label>
                            <input
                                type="range"
                                min="10"
                                max="300"
                                value={customDuration}
                                onChange={(e) => handleCustomizeDuration(Number(e.target.value))}
                                className="w-full"
                            />
                            <div className="text-center text-sm text-gray-500">
                                {customDuration} seconds
                            </div>
                        </div>

                        <motion.div
                            className="w-full bg-gray-200 rounded-full h-2"
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 0.5 }}
                        >
                            <motion.div
                                className="bg-blue-500 h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{
                                    width: `${((ritualSteps[currentStep].duration - timeLeft) /
                                        ritualSteps[currentStep].duration) *
                                        100}%`,
                                }}
                                transition={{ duration: 0.5 }}
                            />
                        </motion.div>

                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => setIsCustomizing(true)}
                                className="text-blue-500 hover:text-blue-600"
                            >
                                Customize Step
                            </button>
                        </div>
                    </>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center"
                    >
                        <h3 className="text-xl font-semibold mb-4">Ritual Complete!</h3>
                        <p className="text-gray-600 mb-4">
                            You're now ready to begin your focused work session.
                        </p>
                        <button
                            onClick={onComplete}
                            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                        >
                            Begin Session
                        </button>
                    </motion.div>
                )}
            </motion.div>

            <AnimatePresence>
                {isCustomizing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="bg-white rounded-lg p-6 max-w-md w-full"
                        >
                            <h3 className="text-xl font-semibold mb-4">Customize Step</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Custom Prompt
                                    </label>
                                    <textarea
                                        value={customPrompt}
                                        onChange={(e) => setCustomPrompt(e.target.value)}
                                        className="w-full p-2 border rounded"
                                        placeholder="Enter a custom prompt for the AI voiceover..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mood
                                    </label>
                                    <select
                                        value={currentMood}
                                        onChange={(e) => setCurrentMood(e.target.value as Mood)}
                                        className="w-full p-2 border rounded"
                                    >
                                        <option value="calm">Calm</option>
                                        <option value="focused">Focused</option>
                                        <option value="energetic">Energetic</option>
                                        <option value="excited">Excited</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Intensity
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        value={currentIntensity}
                                        onChange={(e) => setCurrentIntensity(Number(e.target.value))}
                                        className="w-full"
                                    />
                                    <div className="text-center text-sm text-gray-500">
                                        {Math.round(currentIntensity * 100)}%
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-4">
                                <button
                                    onClick={() => setIsCustomizing(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCustomizeStep}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showMoodInsights && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="bg-white rounded-lg p-6 max-w-md w-full"
                        >
                            <h3 className="text-xl font-semibold mb-4">Mood Insights</h3>
                            <div className="space-y-4">
                                {moodData.map((data, i) => (
                                    <div key={i} className="p-3 bg-gray-50 rounded">
                                        <div className="flex justify-between items-center">
                                            <span className={`px-2 py-1 rounded text-white ${getMoodColor(data.mood)}`}>
                                                {data.mood}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {new Date(data.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <div className="mt-2">
                                            <div className="text-sm text-gray-600">
                                                Intensity: {Math.round(data.intensity * 100)}%
                                            </div>
                                            {data.heartRate && (
                                                <div className="text-sm text-gray-600">
                                                    Heart Rate: {data.heartRate} BPM
                                                </div>
                                            )}
                                            {data.stressLevel && (
                                                <div className="text-sm text-gray-600">
                                                    Stress Level: {data.stressLevel}/10
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => setShowMoodInsights(false)}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FocusRitual; 