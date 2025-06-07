import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="max-w-4xl w-full text-center space-y-8">
                <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white">
                    Welcome to Focus Ritual
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400">
                    Your personal productivity companion
                </p>

                <div className="space-x-4">
                    <button
                        onClick={() => navigate('/login')}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => navigate('/register')}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Create Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomePage; 