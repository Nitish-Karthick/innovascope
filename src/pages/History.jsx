import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, ArrowLeft, Loader2, FileText, Calendar, Activity, AlertCircle } from 'lucide-react';
import { fetchWithAuth } from '../utils/api';

const History = ({ onBack }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetchWithAuth('http://localhost:8000/api/user/history');
                if (!res.ok) throw new Error('Failed to load history');
                const data = await res.json();
                setHistory(data.history || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: 'numeric', minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-300">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={onBack}
                    className="p-2 bg-surface-highlight hover:bg-surface-dark rounded-lg transition-colors text-text-secondary hover:text-white"
                >
                    <ArrowLeft className="size-5" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <HistoryIcon className="text-primary size-6" />
                        Analysis History
                    </h2>
                    <p className="text-sm text-text-secondary">View your past dataset uploads and AI summaries.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="size-8 animate-spin text-primary" />
                </div>
            ) : error ? (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                    {error}
                </div>
            ) : history.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-card-dark border border-surface-highlight rounded-2xl">
                    <HistoryIcon className="size-16 text-surface-highlight mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No History Yet</h3>
                    <p className="text-text-secondary max-w-md">You haven't uploaded any datasets yet. Upload data from the dashboard to see your history.</p>
                </div>
            ) : (
                <div className="bg-card-dark border border-surface-highlight rounded-2xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-surface-highlight bg-surface-dark/50">
                                <th className="px-6 py-4 font-semibold text-text-secondary text-sm">Dataset Name</th>
                                <th className="px-6 py-4 font-semibold text-text-secondary text-sm">Upload Date</th>
                                <th className="px-6 py-4 font-semibold text-text-secondary text-sm">Rows Processed</th>
                                <th className="px-6 py-4 font-semibold text-text-secondary text-sm">Overall Sentiment</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-highlight">
                            {history.slice().reverse().map((item) => (
                                <tr key={item.id} className="hover:bg-surface-highlight/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-surface-highlight rounded-lg group-hover:bg-primary/20 group-hover:text-primary transition-colors text-text-secondary">
                                                <FileText className="size-4" />
                                            </div>
                                            <span className="font-medium text-white">{item.filename}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-text-secondary">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="size-4" />
                                            {formatDate(item.date)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-text-secondary">
                                        {item.rows_processed} rows
                                    </td>
                                    <td className="px-6 py-4">
                                        {typeof item.sentiment_score === 'number' || !isNaN(Number(item.sentiment_score)) ? (
                                            <div className="flex items-center gap-2">
                                                <Activity className="size-4 text-primary" />
                                                <span className="font-bold text-white">{item.sentiment_score}%</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-red-400">
                                                <AlertCircle className="size-4" />
                                                <span className="font-bold text-sm max-w-[250px] truncate" title={item.sentiment_score}>{item.sentiment_score}</span>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default History;
