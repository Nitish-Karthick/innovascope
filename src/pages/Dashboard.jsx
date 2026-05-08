import { fetchWithAuth } from '../utils/api';
import React, { useState, useEffect } from 'react';
import { UploadCloud, Database, Loader2 } from 'lucide-react';
import TechRadarChart from '../components/dashboard/TechRadarChart';
import TrendingList from '../components/dashboard/TrendingList';

const EmptyState = ({ onUploadClick }) => (
    <div className="col-span-3 flex flex-col items-center justify-center gap-6 py-24 text-center animate-in fade-in duration-500">
        <div className="relative">
            <div className="size-24 rounded-2xl bg-surface-highlight border border-border-dark flex items-center justify-center shadow-xl">
                <Database className="size-12 text-text-secondary opacity-60" />
            </div>
            <div className="absolute -bottom-2 -right-2 size-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                <UploadCloud className="size-4 text-white" />
            </div>
        </div>

        <div>
            <h2 className="text-2xl font-black text-white font-display mb-2">No dataset loaded</h2>
            <p className="text-text-secondary max-w-sm text-sm leading-relaxed">
                Upload a CSV file to populate the radar chart, trending list, and all forecast analytics with your own data.
            </p>
        </div>

        <div className="text-xs text-text-secondary bg-surface-highlight/50 border border-border-dark rounded-lg px-5 py-3 text-left max-w-sm">
            <p className="font-semibold text-white mb-1">Expected CSV columns:</p>
            <code className="text-accent-cyan text-[11px]">technology, category, sentiment_score, investment_velocity</code>
        </div>

        <button
            onClick={onUploadClick}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 rounded-xl text-white font-bold shadow-lg shadow-primary/25 transition-all hover:scale-105 active:scale-95"
        >
            <UploadCloud className="size-5" />
            Upload Dataset
        </button>
    </div>
);

const Dashboard = ({ selectedFilter, onViewDetails, onUploadClick, onRefresh }) => {
    const [status, setStatus] = useState(null); // null = loading
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        fetchWithAuth('/api/status')
            .then(r => r.json())
            .then(d => setStatus(d))
            .catch(() => setStatus({ has_data: false, has_more: false }));
    }, []);

    const handleLoadMore = async () => {
        setLoadingMore(true);
        try {
            const res = await fetchWithAuth('/api/process-next', { method: 'POST' });
            if (!res.ok) {
                const data = await res.json();
                if (data.detail === "MISSING_API_KEY") {
                    window.dispatchEvent(new CustomEvent('api-key-error', { detail: "MISSING API KEY: Please configure your Groq API Key in Settings before processing data." }));
                } else if (data.detail && data.detail.startsWith("GROQ_API_ERROR")) {
                    window.dispatchEvent(new CustomEvent('api-key-error', { detail: `API Error: ${data.detail.replace('GROQ_API_ERROR:', '')}. Please check your API key.` }));
                } else {
                    console.error("Failed to load more data", data);
                }
            } else {
                if (onRefresh) onRefresh();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingMore(false);
        }
    };

    if (status === null) {
        return (
            <div className="col-span-3 flex items-center justify-center py-24 text-text-secondary">
                Checking dataset...
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {status.has_data ? (
                    <>
                        <TechRadarChart onPointClick={onViewDetails} />
                        <TrendingList filter={selectedFilter} onItemClick={onViewDetails} />
                    </>
                ) : (
                    <EmptyState onUploadClick={onUploadClick} />
                )}
            </div>
            
            {status.has_more && (
                <div className="flex justify-center mt-2 pb-8">
                    <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="group flex items-center gap-3 px-8 py-3.5 bg-surface-highlight border hover:bg-surface-highlight/80 border-border-dark rounded-xl text-white font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]"
                    >
                        {loadingMore ? (
                            <>
                                <Loader2 className="size-5 animate-spin text-primary" />
                                <span className="text-primary font-bold">Processing Live NLP...</span>
                            </>
                        ) : (
                            <span className="group-hover:text-primary transition-colors">Load More Intelligence</span>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
