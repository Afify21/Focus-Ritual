import React, { useState, useEffect } from 'react';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { useTheme } from '../context/ThemeContext';

const quotes = [
    // Motivational Quotes
    {
        text: "The only way to do great work is to love what you do.",
        author: "Steve Jobs",
        type: "motivation"
    },
    {
        text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        author: "Winston Churchill",
        type: "motivation"
    },
    {
        text: "The future belongs to those who believe in the beauty of their dreams.",
        author: "Eleanor Roosevelt",
        type: "motivation"
    },
    {
        text: "Education is the most powerful weapon which you can use to change the world.",
        author: "Nelson Mandela",
        type: "motivation"
    },
    {
        text: "The expert in anything was once a beginner.",
        author: "Helen Hayes",
        type: "motivation"
    },
    {
        text: "Don't watch the clock; do what it does. Keep going.",
        author: "Sam Levenson",
        type: "motivation"
    },
    {
        text: "The only limit to our realization of tomorrow is our doubts of today.",
        author: "Franklin D. Roosevelt",
        type: "motivation"
    },
    {
        text: "Believe you can and you're halfway there.",
        author: "Theodore Roosevelt",
        type: "motivation"
    },
    {
        text: "It does not matter how slowly you go as long as you do not stop.",
        author: "Confucius",
        type: "motivation"
    },
    {
        text: "The harder you work for something, the greater you'll feel when you achieve it.",
        author: "Unknown",
        type: "motivation"
    },
    {
        text: "Success is walking from failure to failure with no loss of enthusiasm.",
        author: "Winston Churchill",
        type: "motivation"
    },
    {
        text: "The best way to predict the future is to create it.",
        author: "Peter Drucker",
        type: "motivation"
    },
    {
        text: "Your time is limited, don't waste it living someone else's life.",
        author: "Steve Jobs",
        type: "motivation"
    },
    {
        text: "The only person you are destined to become is the person you decide to be.",
        author: "Ralph Waldo Emerson",
        type: "motivation"
    },
    {
        text: "Don't be pushed around by the fears in your mind. Be led by the dreams in your heart.",
        author: "Roy T. Bennett",
        type: "motivation"
    },

    // Study Tips
    {
        text: "Take regular breaks every 25 minutes to maintain peak productivity.",
        author: "Study Tip",
        type: "tip"
    },
    {
        text: "Create a dedicated study space to train your brain for focus.",
        author: "Study Tip",
        type: "tip"
    },
    {
        text: "Use the Pomodoro Technique: 25 minutes of focused work followed by a 5-minute break.",
        author: "Study Tip",
        type: "tip"
    },
    {
        text: "Stay hydrated! Water helps maintain focus and cognitive function.",
        author: "Study Tip",
        type: "tip"
    },
    {
        text: "Review your notes within 24 hours to improve retention by up to 60%.",
        author: "Study Tip",
        type: "tip"
    },
    {
        text: "Use active recall: Test yourself instead of just re-reading material.",
        author: "Study Tip",
        type: "tip"
    },
    {
        text: "Create mind maps to visualize and connect complex concepts.",
        author: "Study Tip",
        type: "tip"
    },
    {
        text: "Teach others what you've learned to reinforce your understanding.",
        author: "Study Tip",
        type: "tip"
    },
    {
        text: "Get 7-8 hours of sleep to consolidate your learning.",
        author: "Study Tip",
        type: "tip"
    },
    {
        text: "Use spaced repetition to review material at increasing intervals.",
        author: "Study Tip",
        type: "tip"
    },
    {
        text: "Take notes by hand to improve memory retention.",
        author: "Study Tip",
        type: "tip"
    },
    {
        text: "Study in different locations to create multiple memory associations.",
        author: "Study Tip",
        type: "tip"
    },
    {
        text: "Use the Feynman Technique: Explain concepts in simple terms.",
        author: "Study Tip",
        type: "tip"
    },
    {
        text: "Practice mindfulness to improve concentration and reduce stress.",
        author: "Study Tip",
        type: "tip"
    },
    {
        text: "Create a study schedule and stick to it consistently.",
        author: "Study Tip",
        type: "tip"
    },
    {
        text: "Use the 80/20 rule: Focus on the 20% of material that will give you 80% of the results.",
        author: "Study Tip",
        type: "tip"
    },
    {
        text: "Take care of your physical health - exercise improves brain function.",
        author: "Study Tip",
        type: "tip"
    },
    {
        text: "Use the Cornell Note-Taking System for better organization.",
        author: "Study Tip",
        type: "tip"
    },
    {
        text: "Break down complex topics into smaller, manageable chunks.",
        author: "Study Tip",
        type: "tip"
    },
    {
        text: "Use mnemonic devices to remember lists and sequences.",
        author: "Study Tip",
        type: "tip"
    }
];

const QuoteGenerator: React.FC = () => {
    const [currentQuote, setCurrentQuote] = useState(quotes[0]);
    const [isAnimating, setIsAnimating] = useState(false);
    const { currentTheme } = useTheme();

    const generateNewQuote = () => {
        setIsAnimating(true);
        setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * quotes.length);
            setCurrentQuote(quotes[randomIndex]);
            setIsAnimating(false);
        }, 300);
    };

    useEffect(() => {
        generateNewQuote();
    }, []);

    return (
        <div className={`backdrop-blur-lg rounded-xl p-6 shadow-xl border border-white/10 ${currentTheme.id !== 'default' ? 'bg-white/30' : 'bg-white/5'}`}>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Daily Inspiration</h2>
                <button
                    onClick={generateNewQuote}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-700 transition-colors"
                    disabled={isAnimating}
                >
                    <SparklesIcon className="h-5 w-5" />
                    <span>New Quote</span>
                </button>
            </div>
            <div className={`transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                <p className="text-lg mb-2 italic">"{currentQuote.text}"</p>
                <p className="text-slate-400 text-sm">- {currentQuote.author}</p>
                <div className="mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${currentQuote.type === 'motivation'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-green-500/20 text-green-400'
                        }`}>
                        {currentQuote.type === 'motivation' ? 'Motivation' : 'Study Tip'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default QuoteGenerator; 