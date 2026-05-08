import { fetchWithAuth } from '../../utils/api';
import React, { useState, useEffect } from 'react';
import { Brain } from 'lucide-react';

const SentimentChart = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchWithAuth('/api/sentiment')
            .then(res => res.json())
            .then(d => setData(d))
            .catch(console.error);
    }, []);

    if (!data) return <div className="bg-card-dark rounded-xl border border-border-dark p-6 text-text-secondary flex items-center justify-center">Loading sentiment...</div>;

    const dasharray = `${data.positive}, 100`;

    return (
        <div className="bg-card-dark rounded-xl border border-border-dark p-6 flex flex-col gap-6 hover:border-primary/50 transition-colors h-full">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-white font-display">Sentiment Analysis</h3>
                    <p className="text-sm text-text-secondary">NLP Analysis of 12k+ sources</p>
                </div>
                <div className="bg-border-dark p-2 rounded-lg text-primary">
                    <Brain className="size-6" />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="relative size-24 shrink-0">
                    <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                        <path className="text-border-dark" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                        <path className="text-accent-green" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={dasharray} strokeWidth="3"></path>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-bold text-white">{data.positive}%</span>
                        <span className="text-[10px] text-text-secondary">Positive</span>
                    </div>
                </div>

                <div className="flex flex-col gap-2 flex-1">
                    <div className="flex justify-between text-xs">
                        <span className="text-white">Positive</span>
                        <span className="text-text-secondary">{data.positive}%</span>
                    </div>
                    <div className="w-full bg-border-dark rounded-full h-1.5">
                        <div className="bg-accent-green h-1.5 rounded-full" style={{ width: `${data.positive}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                        <span className="text-white">Neutral</span>
                        <span className="text-text-secondary">{data.neutral}%</span>
                    </div>
                    <div className="w-full bg-border-dark rounded-full h-1.5">
                        <div className="bg-text-secondary h-1.5 rounded-full" style={{ width: `${data.neutral}%` }}></div>
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-border-dark mt-auto">
                <p className="text-xs font-bold text-text-secondary uppercase mb-3 tracking-wider">Top Keywords</p>
                <div className="flex flex-wrap gap-2">
                    {data.keywords.map(kw => (
                        <span key={kw} className="px-2 py-1 bg-border-dark rounded text-xs text-white">{kw}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SentimentChart;
