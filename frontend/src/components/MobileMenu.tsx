import React from 'react';
import { Link } from 'react-router-dom';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="md:hidden bg-gradient-to-b from-gray-900 to-gray-800 p-4 border-b border-teal-500/20">
            <Link to="/" className="block w-full text-left py-3.5 px-5 rounded-xl my-1.5 bg-gray-800/50 hover:bg-teal-900/40 hover:text-white transition-all group border border-gray-700/50 hover:border-teal-500/30">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center group-hover:bg-teal-500/30 transition-all">
                        <i className="fas fa-home text-teal-400 text-xs group-hover:scale-125 transition-transform"></i>
                    </div>
                    <span>Home</span>
                </div>
            </Link>
            <Link to="/habits" className="block w-full text-left py-3.5 px-5 rounded-xl my-1.5 bg-gray-800/50 hover:bg-teal-900/40 hover:text-white transition-all group border border-gray-700/50 hover:border-teal-500/30">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center group-hover:bg-teal-500/30 transition-all">
                        <i className="fas fa-tasks text-teal-400 text-xs group-hover:scale-125 transition-transform"></i>
                    </div>
                    <span>Habits</span>
                </div>
            </Link>
            <Link to="/calendar" className="block w-full text-left py-3.5 px-5 rounded-xl my-1.5 bg-gray-800/50 hover:bg-teal-900/40 hover:text-white transition-all group border border-gray-700/50 hover:border-teal-500/30">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center group-hover:bg-teal-500/30 transition-all">
                        <i className="far fa-calendar text-teal-400 text-xs group-hover:scale-125 transition-transform"></i>
                    </div>
                    <span>Calendar</span>
                </div>
            </Link>
            <Link to="/analytics" className="block w-full text-left py-3.5 px-5 rounded-xl my-1.5 bg-gray-800/50 hover:bg-teal-900/40 hover:text-white transition-all group border border-gray-700/50 hover:border-teal-500/30">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center group-hover:bg-teal-500/30 transition-all">
                        <i className="fas fa-chart-line text-teal-400 text-xs group-hover:scale-125 transition-transform"></i>
                    </div>
                    <span>Analytics</span>
                </div>
            </Link>
            <Link to="/settings" className="block w-full text-left py-3.5 px-5 rounded-xl my-1.5 bg-gray-800/50 hover:bg-teal-900/40 hover:text-white transition-all group border border-gray-700/50 hover:border-teal-500/30">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center group-hover:bg-teal-500/30 transition-all">
                        <i className="fas fa-cog text-teal-400 text-xs group-hover:scale-125 transition-transform"></i>
                    </div>
                    <span>Settings</span>
                </div>
            </Link>
        </div>
    );
};

export default MobileMenu; 