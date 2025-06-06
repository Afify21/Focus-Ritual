import React from 'react';
// TODO: Import actual icon components if using react-icons or similar

const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-900 text-gray-400 py-6 px-6 border-t border-gray-800 mt-8">
            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-6 md:mb-0">
                        <h2 className="text-xl font-bold text-white mb-2">Focus Ritual</h2>
                        <p className="text-sm">Enhance your productivity and focus.</p>
                    </div>
                    {/* TODO: Replace with actual links and icon components */}
                    <div className="flex space-x-6">
                        <a href="#" className="hover:text-teal-400 transition"><i className="fab fa-twitter"></i></a>
                        <a href="https://www.instagram.com/focus.ritual/" className="hover:text-teal-400 transition" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
                        <a href="https://github.com/Afify21/Focus-Ritual" className="hover:text-teal-400 transition" target="_blank" rel="noopener noreferrer"><i className="fab fa-github"></i></a>
                        <a href="https://discord.gg/F7XJeY44" className="hover:text-teal-400 transition" target="_blank" rel="noopener noreferrer"><i className="fab fa-discord"></i></a>
                    </div>
                </div>
                <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
                    <p>&copy; 2023 Focus Ritual. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
