import { Habit } from './HabitReminderService';

interface FocusPattern {
    averageFocusDuration: number;
    mostProductiveTime: string;
    commonDistractions: string[];
    focusDropPoints: number[];
}

interface FocusRecommendation {
    type: 'duration' | 'timing' | 'distraction' | 'general';
    message: string;
    priority: 'high' | 'medium' | 'low';
}

export class FocusAnalyticsService {
    private static instance: FocusAnalyticsService;
    private focusData: Map<string, any[]> = new Map();

    private constructor() { }

    static getInstance(): FocusAnalyticsService {
        if (!FocusAnalyticsService.instance) {
            FocusAnalyticsService.instance = new FocusAnalyticsService();
        }
        return FocusAnalyticsService.instance;
    }

    // Record a focus session
    recordFocusSession(habitId: string, data: {
        duration: number;
        startTime: string;
        distractions: string[];
        focusDropPoints: number[];
    }) {
        const sessions = this.focusData.get(habitId) || [];
        sessions.push({
            ...data,
            timestamp: new Date().toISOString()
        });
        this.focusData.set(habitId, sessions);
        localStorage.setItem('focus-ritual-focus-data', JSON.stringify(Array.from(this.focusData.entries())));
    }

    // Analyze focus patterns for a habit
    analyzeFocusPatterns(habitId: string): FocusPattern {
        const sessions = this.focusData.get(habitId) || [];
        if (sessions.length === 0) {
            return {
                averageFocusDuration: 0,
                mostProductiveTime: 'Not enough data',
                commonDistractions: [],
                focusDropPoints: []
            };
        }

        // Calculate average focus duration
        const totalDuration = sessions.reduce((sum, session) => sum + session.duration, 0);
        const averageDuration = totalDuration / sessions.length;

        // Find most productive time
        const timeSlots = sessions.map(session => {
            const hour = new Date(session.startTime).getHours();
            return hour;
        });
        const mostCommonHour = this.findMostCommon(timeSlots);
        const mostProductiveTime = `${mostCommonHour}:00`;

        // Analyze common distractions
        const allDistractions = sessions.flatMap(session => session.distractions);
        const commonDistractions = this.findMostCommon(allDistractions, 3);

        // Analyze focus drop points
        const allDropPoints = sessions.flatMap(session => session.focusDropPoints);
        const averageDropPoint = allDropPoints.reduce((sum, point) => sum + point, 0) / allDropPoints.length;

        return {
            averageFocusDuration: Math.round(averageDuration),
            mostProductiveTime,
            commonDistractions,
            focusDropPoints: [Math.round(averageDropPoint)]
        };
    }

    // Generate personalized recommendations
    generateRecommendations(habitId: string): FocusRecommendation[] {
        const patterns = this.analyzeFocusPatterns(habitId);
        const recommendations: FocusRecommendation[] = [];

        // Duration-based recommendations
        if (patterns.averageFocusDuration > 45) {
            recommendations.push({
                type: 'duration',
                message: `Your focus tends to drop after ${patterns.focusDropPoints[0]} minutes. Try breaking your sessions into shorter sprints of ${patterns.focusDropPoints[0]} minutes with short breaks in between.`,
                priority: 'high'
            });
        }

        // Timing-based recommendations
        const currentHour = new Date().getHours();
        const productiveHour = parseInt(patterns.mostProductiveTime);
        if (Math.abs(currentHour - productiveHour) > 2) {
            recommendations.push({
                type: 'timing',
                message: `You're most productive around ${patterns.mostProductiveTime}. Try scheduling your focus sessions during this time.`,
                priority: 'medium'
            });
        }

        // Distraction-based recommendations
        if (patterns.commonDistractions.length > 0) {
            recommendations.push({
                type: 'distraction',
                message: `Common distractions include: ${patterns.commonDistractions.join(', ')}. Consider using the Pomodoro technique to minimize these interruptions.`,
                priority: 'medium'
            });
        }

        // General recommendations
        if (patterns.averageFocusDuration < 20) {
            recommendations.push({
                type: 'general',
                message: 'Your focus sessions are quite short. Try gradually increasing your focus duration by 5 minutes each week.',
                priority: 'low'
            });
        }

        return recommendations;
    }

    private findMostCommon<T>(arr: T[], limit: number = 1): T[] {
        const frequency = new Map<T, number>();
        arr.forEach(item => {
            frequency.set(item, (frequency.get(item) || 0) + 1);
        });

        return Array.from(frequency.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([item]) => item);
    }

    // Load focus data from localStorage
    loadFocusData() {
        const savedData = localStorage.getItem('focus-ritual-focus-data');
        if (savedData) {
            this.focusData = new Map(JSON.parse(savedData));
        }
    }
} 