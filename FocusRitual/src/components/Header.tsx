import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Assuming react-router-dom for navigation
// TODO: Import actual icon components if using react-icons or similar

const Header: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <nav className="bg-gradient-to-r from-gray-900 to-black border-b border-teal-500/20 py-3 px-6 flex items-center justify-center sticky top-0 z-50 backdrop-blur-sm">
            {/* Logo and Name */}
            <div className="absolute left-6 flex items-center gap-2 group">
                {/* Use the new logo */}
                <img src="/images/logo.png" alt="Focus Ritual Logo" className="h-10 transition-all duration-300 group-hover:rotate-6 group-hover:drop-shadow-[0_0_10px_rgba(4,217,217,0.7)]" />
                <span className="text-base font-bold tracking-wider bg-gradient-to-r from-teal-400 via-green-400 to-emerald-500 text-transparent bg-clip-text">FOCUS RITUAL</span>
            </div>

            {/* Main Navigation */}
            <div className="hidden md:flex flex-1 justify-center items-center">
                <div className="flex space-x-1">
                    <Link to="/" className="relative px-4 py-2 rounded-lg text-white hover:text-white transition-all group/nav">
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 flex items-center justify-center group-hover/nav:bg-teal-600/30 group-hover/nav:rounded-full transition-all">
                                {/* Replace with actual icon component if using react-icons */}
                                <i className="fas fa-home text-sm group-hover/nav:scale-125 transition-transform"></i>
                            </div>
                            <span>Home</span>
                        </div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-[2px] bg-gradient-to-r from-teal-400/0 via-emerald-400 to-teal-400/0 opacity-0 group-hover/nav:opacity-100 transition-opacity"></div>
                    </Link>
                    <Link to="/habits" className="relative px-4 py-2 rounded-lg text-white hover:text-white transition-all group/nav">
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 flex items-center justify-center group-hover/nav:bg-teal-600/30 group-hover/nav:rounded-full transition-all">
                                <i className="fas fa-tasks text-sm group-hover/nav:scale-125 transition-transform"></i>
                            </div>
                            <span>Habits</span>
                        </div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-[2px] bg-gradient-to-r from-teal-400/0 via-emerald-400 to-teal-400/0 opacity-0 group-hover/nav:opacity-100 transition-opacity"></div>
                    </Link>
                    <Link to="/calendar" className="relative px-4 py-2 rounded-lg text-white hover:text-white transition-all group/nav">
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 flex items-center justify-center group-hover/nav:bg-teal-600/30 group-hover/nav:rounded-full transition-all">
                                <i className="far fa-calendar text-sm group-hover/nav:scale-125 transition-transform"></i>
                            </div>
                            <span>Calendar</span>
                        </div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-[2px] bg-gradient-to-r from-teal-400/0 via-emerald-400 to-teal-400/0 opacity-0 group-hover/nav:opacity-100 transition-opacity"></div>
                    </Link>
                    <Link to="/analytics" className="relative px-4 py-2 rounded-lg text-white hover:text-white transition-all group/nav">
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 flex items-center justify-center group-hover/nav:bg-teal-600/30 group-hover/nav:rounded-full transition-all">
                                <i className="fas fa-chart-line text-sm group-hover/nav:scale-125 transition-transform"></i>
                            </div>
                            <span>Analytics</span>
                        </div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-[2px] bg-gradient-to-r from-teal-400/0 via-emerald-400 to-teal-400/0 opacity-0 group-hover/nav:opacity-100 transition-opacity"></div>
                    </Link>
                    <Link to="/settings" className="relative px-4 py-2 rounded-lg text-white hover:text-white transition-all group/nav">
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 flex items-center justify-center group-hover/nav:bg-teal-600/30 group-hover/nav:rounded-full transition-all">
                                <i className="fas fa-cog text-sm group-hover/nav:scale-125 transition-transform"></i>
                            </div>
                            <span>Settings</span>
                        </div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-[2px] bg-gradient-to-r from-teal-400/0 via-emerald-400 to-teal-400/0 opacity-0 group-hover/nav:opacity-100 transition-opacity"></div>
                    </Link>
                </div>
            </div>

            {/* Account Dropdown */}
            <div className="absolute right-6 hidden md:flex">
                <div className="relative group">
                    <button className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg flex items-center space-x-2 transition">
                        <div className="flex items-center justify-center">
                            <span>Create Account</span>
                        </div>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border border-gray-700/50">
                        <Link to="/login" className="block px-4 py-2 text-white hover:bg-teal-900/20 transition flex items-center space-x-2">
                            <i className="fas fa-sign-in-alt text-teal-400"></i>
                            <span>Sign In</span>
                        </Link>
                        <Link to="/register" className="block px-4 py-2 text-white hover:bg-teal-900/20 transition flex items-center space-x-2">
                            <i className="fas fa-user-plus text-teal-400"></i>
                            <span>Create Account</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden w-8 h-8 flex items-center justify-center rounded-full bg-gray-800/50 hover:bg-teal-900/20 transition-all group"
            >
                <i className="fas fa-bars text-base text-gray-300 group-hover:text-teal-400 transition-all"></i>
            </button>
        </nav>
    );
};

export default Header;
