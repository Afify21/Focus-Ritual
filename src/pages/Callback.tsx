import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Callback: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // The token is already handled in the SpotifyPlayer component
        // We just need to redirect back to the main page
        navigate('/');
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Connecting to Spotify...</h2>
                <p className="text-slate-400">Please wait while we complete the authentication.</p>
            </div>
        </div>
    );
};

export default Callback; 