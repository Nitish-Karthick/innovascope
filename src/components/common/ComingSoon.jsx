import React from 'react';
import { Construction } from 'lucide-react';

const ComingSoon = ({ title, onBack }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-12 glass-panel rounded-xl border border-surface-highlight">
            <div className="bg-surface-highlight p-4 rounded-full mb-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary to-accent-purple opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <Construction className="size-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{title || "Coming Soon"}</h2>
            <p className="text-text-secondary max-w-md mb-8">
                This module is currently under development. Check back later for updates on market analysis and competitor tracking.
            </p>
            <button
                onClick={onBack}
                className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors cursor-pointer"
            >
                Return to Dashboard
            </button>
        </div>
    );
};

export default ComingSoon;
