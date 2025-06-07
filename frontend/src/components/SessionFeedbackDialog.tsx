import React, { useState } from 'react';
import personalizationService, { FocusSession, ContextData } from '../services/personalizationService';

interface SessionFeedbackDialogProps {
    isOpen: boolean;
    onClose: () => void;
    sessionData: {
        startTime: Date;
        endTime: Date;
        plannedDuration: number;
        actualDuration: number;
        completed: boolean;
        mood?: {
            before: number | null;
            after: number | null;
        };
    };
    userId: string;
}

const SessionFeedbackDialog: React.FC<SessionFeedbackDialogProps> = ({
    isOpen,
    onClose,
    sessionData,
    userId
}) => {
    const [productivity, setProductivity] = useState<number | undefined>(undefined);
    const [moodAfter, setMoodAfter] = useState<number | null>(null);
    const [distractionType, setDistractionType] = useState<string>('');
    const [distractionDesc, setDistractionDesc] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitSuccess, setSubmitSuccess] = useState<boolean | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Build distractions array if any
        const distractions = [];
        if (distractionType) {
            distractions.push({
                time: new Date(),
                type: distractionType,
                description: distractionDesc
            });
        }
        
        // Prepare enhanced session data
        const enhancedSessionData: FocusSession = {
            ...sessionData,
            mood: {
                before: sessionData.mood?.before || null,
                after: moodAfter
            },
            productivity,
            distractions,
            notes
        };
        
        try {
            // Track the session data
            const success = await personalizationService.trackFocusSession(userId, enhancedSessionData);
            
            // Also track context data for more personalization
            const contextData: ContextData = {
                timeOfDay: getTimeOfDay(),
                deviceType: getDeviceType(),
                location: 'unknown' // In a real app, you could ask for this or detect it if permitted
            };
            
            await personalizationService.updateContextData(userId, contextData);
            
            setSubmitSuccess(success);
            
            // Close after a short delay if successful
            if (success) {
                setTimeout(() => {
                    onClose();
                    resetForm();
                }, 1500);
            }
        } catch (error) {
            console.error('Error submitting session feedback:', error);
            setSubmitSuccess(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setProductivity(undefined);
        setMoodAfter(null);
        setDistractionType('');
        setDistractionDesc('');
        setNotes('');
        setSubmitSuccess(null);
    };

    // Helper function to get time of day
    const getTimeOfDay = (): string => {
        const hour = new Date().getHours();
        if (hour < 6) return 'night';
        if (hour < 12) return 'morning';
        if (hour < 18) return 'afternoon';
        return 'evening';
    };
    
    // Helper function to get device type
    const getDeviceType = (): string => {
        const ua = navigator.userAgent;
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
            return 'tablet';
        }
        if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
            return 'mobile';
        }
        return 'desktop';
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-lg w-full">
                <h2 className="text-2xl font-bold mb-4">Session Complete</h2>
                
                {submitSuccess === true ? (
                    <div className="text-green-600 font-medium mb-4">
                        Thanks for your feedback! This helps personalize your experience.
                    </div>
                ) : submitSuccess === false ? (
                    <div className="text-red-600 font-medium mb-4">
                        Something went wrong. Please try again.
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {/* Productivity rating */}
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">How productive was this session?</label>
                            <div className="flex space-x-2">
                                {[1, 2, 3, 4, 5].map((rating) => (
                                    <button
                                        key={rating}
                                        type="button"
                                        onClick={() => setProductivity(rating)}
                                        className={`w-10 h-10 rounded-full ${
                                            productivity === rating 
                                                ? 'bg-blue-600 text-white' 
                                                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                        } flex items-center justify-center focus:outline-none`}
                                    >
                                        {rating}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        {/* Mood after */}
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">How do you feel now?</label>
                            <div className="flex space-x-4 text-2xl">
                                <button 
                                    type="button" 
                                    onClick={() => setMoodAfter(1)}
                                    className={`p-2 rounded ${moodAfter === 1 ? 'bg-red-100' : ''}`}
                                >
                                    😔
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setMoodAfter(2)}
                                    className={`p-2 rounded ${moodAfter === 2 ? 'bg-orange-100' : ''}`}
                                >
                                    😐
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setMoodAfter(3)}
                                    className={`p-2 rounded ${moodAfter === 3 ? 'bg-yellow-100' : ''}`}
                                >
                                    🙂
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setMoodAfter(4)}
                                    className={`p-2 rounded ${moodAfter === 4 ? 'bg-green-100' : ''}`}
                                >
                                    😊
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setMoodAfter(5)}
                                    className={`p-2 rounded ${moodAfter === 5 ? 'bg-green-100' : ''}`}
                                >
                                    😁
                                </button>
                            </div>
                        </div>
                        
                        {/* Distractions */}
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Were you distracted during this session?</label>
                            <select
                                value={distractionType}
                                onChange={(e) => setDistractionType(e.target.value)}
                                className="w-full p-2 border rounded"
                            >
                                <option value="">No distractions</option>
                                <option value="notification">Notifications</option>
                                <option value="social">Social media</option>
                                <option value="people">People around me</option>
                                <option value="environment">Environmental (noise, etc)</option>
                                <option value="thoughts">Wandering thoughts</option>
                                <option value="other">Other</option>
                            </select>
                            
                            {distractionType && (
                                <textarea
                                    value={distractionDesc}
                                    onChange={(e) => setDistractionDesc(e.target.value)}
                                    placeholder="Brief description of the distraction..."
                                    className="mt-2 w-full p-2 border rounded"
                                    rows={2}
                                ></textarea>
                            )}
                        </div>
                        
                        {/* Session notes */}
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">Any notes about this session?</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full p-2 border rounded"
                                rows={2}
                            ></textarea>
                        </div>
                        
                        {/* Buttons */}
                        <div className="flex justify-end space-x-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border rounded hover:bg-gray-100"
                                disabled={isSubmitting}
                            >
                                Skip
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Saving...' : 'Save Feedback'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default SessionFeedbackDialog;