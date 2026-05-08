import { fetchWithAuth } from '../utils/api';
import React, { useState, useEffect } from 'react';
import { Share, Download, TrendingUp, ArrowLeft, UploadCloud, BarChart2, Sparkles } from 'lucide-react';
import ForecastingChart from '../components/details/ForecastingChart';
import SentimentChart from '../components/details/SentimentChart';
import DeveloperInterestChart from '../components/details/DeveloperInterestChart';
import MediaCoverageChart from '../components/details/MediaCoverageChart';

const TrendDetails = ({ techName, selectedFilter, onBack, onUploadClick }) => {
    const [hasData, setHasData] = useState(null);
    const [topTech, setTopTech] = useState(null);

    useEffect(() => {
        fetchWithAuth('http://localhost:8000/api/status')
            .then(r => r.json())
            .then(d => {
                setHasData(d.has_data);
                if (d.has_data) {
                    // Fetch top trending item for dynamic title
                    return fetchWithAuth('http://localhost:8000/api/trending')
                        .then(r => r.json())
                        .then(d => {
                             if (techName && typeof techName === 'string') {
                                 const found = d.items?.find(i => i.name.toLowerCase() === techName.toLowerCase());
                                 setTopTech(found || d.items?.[0] || null);
                             } else {
                                 setTopTech(d.items?.[0] || null);
                             }
                        });
                }
            })
            .catch(() => setHasData(false));
    }, [techName]);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    };

    const handleExport = () => {
        const techName = topTech?.name || 'Tech Analysis';
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
            report: `${techName} Analysis`,
            score: topTech?.score,
            change: topTech?.change,
            category: topTech?.category
        }));
        const a = document.createElement('a');
        a.setAttribute('href', dataStr);
        a.setAttribute('download', `${techName.replace(/\s+/g, '_')}_report.json`);
        document.body.appendChild(a);
        a.click();
        a.remove();
    };

    // Derived display values from top tech
    const displayTechName = topTech?.name || 'Dataset Overview';
    const techCat = topTech?.category || 'Technology';
    const techScore = topTech?.score || '—';
    const techChange = topTech?.change || '—';
    const isUp = topTech?.changeType !== 'down';

    return (
        <>
            <button onClick={onBack} className="flex items-center gap-2 text-text-secondary hover:text-white mb-4 transition-colors w-fit">
                <ArrowLeft className="size-4" /> Back to Dashboard
            </button>

            {hasData === false ? (
                <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
                    <div className="relative">
                        <div className="size-20 rounded-2xl bg-surface-highlight border border-border-dark flex items-center justify-center">
                            <BarChart2 className="size-10 text-text-secondary opacity-60" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 size-7 rounded-full bg-primary flex items-center justify-center">
                            <UploadCloud className="size-3.5 text-white" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white font-display mb-2">No dataset loaded</h2>
                        <p className="text-text-secondary max-w-sm text-sm leading-relaxed">
                            Upload a CSV dataset to see forecast analytics, sentiment analysis, developer interest and media coverage.
                        </p>
                    </div>
                    <button
                        onClick={onUploadClick}
                        className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 rounded-xl text-white font-bold shadow-lg shadow-primary/25 transition-all hover:scale-105"
                    >
                        <UploadCloud className="size-5" /> Upload Dataset
                    </button>
                </div>
            ) : (
                <>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border-dark pb-6">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                                    {techCat}
                                </span>
                                <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${isUp ? 'text-accent-green bg-accent-green/10' : 'text-red-400 bg-red-400/10'
                                    }`}>
                                    <TrendingUp className="size-3.5" />
                                    {isUp ? 'High Velocity' : 'Declining'} · {techChange}
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white font-display">
                                {displayTechName}
                            </h1>
                            <p className="text-text-secondary max-w-2xl text-lg">
                                Top-ranked technology from your dataset with an investment velocity score of <span className="text-white font-semibold">{techScore}</span>.
                                Forecasts, sentiment, developer interest and media coverage are derived from your uploaded CSV.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleShare}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border-dark hover:bg-border-dark transition-colors text-white font-medium"
                            >
                                <Share className="size-4" /> Share
                            </button>
                            <button
                                onClick={handleExport}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/90 transition-colors text-white font-medium shadow-lg shadow-primary/25"
                            >
                                <Download className="size-4" /> Export Report
                            </button>
                        </div>
                    </div>

                    {topTech?.analysis_summary && (
                        <div className="bg-surface-highlight border border-border-dark rounded-xl p-5 md:p-6 shadow-lg relative overflow-hidden group">
                            <div className="absolute top-0 right-0 -m-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Sparkles className="size-32 text-accent-cyan" />
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles className="size-5 text-accent-cyan" />
                                <h3 className="font-display font-bold text-white text-lg tracking-wide">AI Analyst Summary</h3>
                            </div>
                            <p className="text-text-secondary leading-relaxed relative z-10 text-[15px]">
                                {topTech.analysis_summary}
                            </p>
                        </div>
                    )}

                    {/* Main Forecasting Chart */}
                    <ForecastingChart filter={selectedFilter} />

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <SentimentChart />
                        <DeveloperInterestChart />
                        <MediaCoverageChart filter={selectedFilter} />
                    </div>
                </>
            )}
        </>
    );
};

export default TrendDetails;
