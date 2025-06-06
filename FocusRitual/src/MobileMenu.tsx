import React from 'react';
import { Link } from 'react-router-dom'; // Assuming react-router-dom for navigation
// TODO: Import actual icon components if using react-icons or similar

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
    // TODO: Implement authentication status and show/hide auth links accordingly
    const isAuthenticated = false; // Placeholder

    return (
        <div
            id="mobile-menu"
            className={`${isOpen ? 'block' : 'hidden'} md:hidden bg-gradient-to-b from-gray-900 to-gray-800 p-4 border-b border-teal-500/20`}
        >
            <Link to="/" className="block w-full text-left py-3.5 px-5 rounded-xl my-1.5 bg-gray-800/50 hover:bg-teal-900/40 hover:text-white transition-all group border border-gray-700/50 hover:border-teal-500/30" onClick={onClose}>
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center group-hover:bg-teal-500/30 transition-all">
                        {/* Replace with actual icon component */}
                        <i className="fas fa-home text-teal-400 text-xs group-hover:scale-125 transition-transform"></i>
                    </div>
                    <span>Home</span>
                </div>
            </Link>
            <Link to="/habits" className="block w-full text-left py-3.5 px-5 rounded-xl my-1.5 bg-gray-800/50 hover:bg-teal-900/40 hover:text-white transition-all group border border-gray-700/50 hover:border-teal-500/30" onClick={onClose}>
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center group-hover:bg-teal-500/30 transition-all">
                        <i className="fas fa-tasks text-teal-400 text-xs group-hover:scale-125 transition-transform"></i>
                    </div>
                    <span>Habits</span>
                </div>
            </Link>
            <Link to="/calendar" className="block w-full text-left py-3.5 px-5 rounded-xl my-1.5 bg-gray-800/50 hover:bg-teal-900/40 hover:text-white transition-all group border border-gray-700/50 hover:border-teal-500/30" onClick={onClose}>
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center group-hover:bg-teal-500/30 transition-all">
                        <i className="far fa-calendar text-teal-400 text-xs group-hover:scale-125 transition-transform"></i>
                    </div>
                    <span>Calendar</span>
                </div>
            </Link>
            <Link to="/analytics" className="block w-full text-left py-3.5 px-5 rounded-xl my-1.5 bg-gray-800/50 hover:bg-teal-900/40 hover:text-white transition-all group border border-gray-700/50 hover:border-teal-500/30" onClick={onClose}>
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center group-hover:bg-teal-500/30 transition-all">
                        <i className="fas fa-chart-line text-teal-400 text-xs group-hover:scale-125 transition-transform"></i>
                    </div>
                    <span>Analytics</span>
                </div>
            </Link>
            <Link to="/settings" className="block w-full text-left py-3.5 px-5 rounded-xl my-1.5 bg-gray-800/50 hover:bg-teal-900/40 hover:text-white transition-all group border border-gray-700/50 hover:border-teal-500/30" onClick={onClose}>
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center group-hover:bg-teal-500/30 transition-all">
                        <i className="fas fa-cog text-teal-400 text-xs group-hover:scale-125 transition-transform"></i>
                    </div>
                    <span>Settings</span>
                </div>
            </Link>
            {/* Add auth links (Sign In/Create Account) based on authentication status */}
            {!isAuthenticated && (
                <>
                    <Link to="/login" className="block w-full text-left py-3.5 px-5 rounded-xl my-1.5 bg-gray-800/50 hover:bg-teal-900/40 hover:text-white transition-all group border border-gray-700/50 hover:border-teal-500/30" onClick={onClose}>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center group-hover:bg-teal-500/30 transition-all">
                                <i className="fas fa-sign-in-alt text-teal-400"></i>
                            </div>
                            <span>Sign In</span>
                        </div>
                    </Link>
                    <Link to="/register" className="block w-full text-left py-3.5 px-5 rounded-xl my-1.5 bg-gray-800/50 hover:bg-teal-900/40 hover:text-white transition-all group border border-gray-700/50 hover:border-teal-500/30" onClick={onClose}>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center group-hover:bg-teal-500/30 transition-all">
                                <i className="fas fa-user-plus text-teal-400"></i>
                            </div>
                            <span>Create Account</span>
                        </div>
                    </Link>
                </>
            )}
            {isAuthenticated && (
                <button
                    // onClick={handleLogout} // Implement logout handler
                    className="block w-full text-left py-3.5 px-5 rounded-xl my-1.5 bg-gray-800/50 hover:bg-teal-900/40 hover:text-white transition-all group border border-gray-700/50 hover:border-teal-500/30"
                >
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center group-hover:bg-teal-500/30 transition-all">
                            <i className="fas fa-sign-out-alt text-teal-400"></i>
                        </div>
                        <span>Logout</span>
                    </div>
                </button>
            )}
        </div>
    );
};

export default MobileMenu;
