import React, { useState } from 'react';
import { Search, Calendar, ChevronDown, Plus, RotateCcw, AlertTriangle, X } from 'lucide-react';
import { fetchWithAuth } from '../../utils/api';

const Header = ({ onUploadClick, onReset, selectedFilter, setSelectedFilter }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [resetting, setResetting] = useState(false);
    const filters = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'This Year'];

    const handleReset = async () => {
        setResetting(true);
        await fetchWithAuth('/api/reset', { method: 'DELETE' });
        setResetting(false);
        setShowResetConfirm(false);
        onReset?.();
    };

    return (
        <header className="h-16 flex items-center justify-between px-6 border-b border-surface-highlight bg-background-dark/80 backdrop-blur-md z-10 sticky top-0">
            <div className="flex items-center gap-6 flex-1">
                <h2 className="text-lg font-bold text-white tracking-tight hidden md:block">InnovaScope</h2>

                {/* Search */}
                <div className="relative hidden md:block w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary size-4" />
                    <input
                        type="text"
                        placeholder="Search technology..."
                        className="w-full h-9 bg-surface-highlight border-none rounded-lg pl-10 pr-4 text-sm text-white placeholder-text-secondary focus:ring-1 focus:ring-primary focus:bg-surface-dark transition-all outline-none"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative">
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-2 h-9 px-3 bg-surface-highlight hover:bg-surface-highlight/80 rounded-lg text-sm font-medium text-white transition-colors border border-transparent hover:border-surface-highlight">
                        <Calendar className="size-4" />
                        <span className="hidden sm:inline">{selectedFilter}</span>
                        <ChevronDown className="size-4 text-text-secondary" />
                    </button>
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-40 bg-card-dark border border-border-dark rounded-lg shadow-xl overflow-hidden py-1 z-50">
                            {filters.map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => { setSelectedFilter(filter); setDropdownOpen(false); }}
                                    className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:text-white hover:bg-surface-highlight transition-colors"
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    onClick={onUploadClick}
                    title="Upload Dataset"
                    className="flex items-center justify-center size-9 bg-primary hover:bg-primary-dark rounded-lg text-white shadow-lg shadow-primary/20 transition-all hover:scale-110 active:scale-95"
                >
                    <Plus className="size-5" />
                </button>

                {/* Reset button + inline confirm */}
                <div className="relative">
                    <button
                        onClick={() => setShowResetConfirm(v => !v)}
                        title="Reset Dashboard"
                        className={`flex items-center justify-center size-9 rounded-lg transition-all ${showResetConfirm ? 'bg-red-500/20 text-red-400' : 'text-text-secondary hover:text-red-400 hover:bg-red-400/10'}`}
                    >
                        <RotateCcw className={`size-4 ${resetting ? 'animate-spin' : ''}`} />
                    </button>

                    {showResetConfirm && (
                        <div className="absolute right-0 top-12 w-64 bg-card-dark border border-red-500/30 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                            <div className="flex items-start gap-3 mb-3">
                                <AlertTriangle className="size-5 text-red-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-white text-sm font-semibold mb-0.5">Reset dashboard?</p>
                                    <p className="text-text-secondary text-xs leading-relaxed">This will delete all uploaded CSV data and return to the empty state.</p>
                                </div>
                                <button onClick={() => setShowResetConfirm(false)} className="text-text-secondary hover:text-white ml-auto shrink-0">
                                    <X className="size-4" />
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowResetConfirm(false)}
                                    className="flex-1 py-1.5 text-xs text-text-secondary bg-surface-highlight hover:bg-border-dark rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReset}
                                    disabled={resetting}
                                    className="flex-1 py-1.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-60"
                                >
                                    {resetting ? 'Resetting…' : 'Reset'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
