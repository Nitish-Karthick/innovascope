import { fetchWithAuth } from '../../utils/api';
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Newspaper } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-surface-dark border border-border-dark rounded-lg px-3 py-2 text-xs shadow-xl">
            <p className="text-text-secondary mb-1">{label}</p>
            <p className="text-accent-purple">Articles: <strong>{payload[0]?.value}</strong></p>
        </div>
    );
};

const MediaCoverageChart = ({ filter }) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        fetchWithAuth('/api/media-coverage')
            .then(r => r.json())
            .then(d => setData(d.data || []))
            .catch(console.error);
    }, []);

    const getSlicedData = (arr) => {
        if (!arr || !arr.length) return [];
        let visibleCount = arr.length;
        if (filter === 'Last 7 Days' || filter === 'Last 30 Days') visibleCount = 2;
        if (filter === 'Last 90 Days') visibleCount = 3;
        
        if (visibleCount === arr.length) return arr;

        return arr.map((item, idx) => {
            if (idx >= arr.length - visibleCount) return item;
            return { ...item, articles: null };
        });
    };
    const displayData = getSlicedData(data);

    const maxArticles = displayData.length ? Math.max(...displayData.map(d => d.articles)) : 1;

    return (
        <div className="bg-card-dark rounded-xl border border-border-dark p-6 flex flex-col gap-4 hover:border-primary/50 transition-colors h-full">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-white font-display">Media Coverage</h3>
                    <p className="text-sm text-text-secondary">Estimated monthly article volume</p>
                </div>
                <div className="bg-border-dark p-2 rounded-lg text-accent-purple">
                    <Newspaper className="size-5" />
                </div>
            </div>

            {displayData.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-text-secondary text-sm">Loading...</div>
            ) : (
                <>
                    <ResponsiveContainer width="100%" height={150}>
                        <BarChart data={displayData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }} barSize={20}>
                            <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                            <Bar dataKey="articles" radius={[4, 4, 0, 0]}>
                                {displayData.map((entry, i) => {
                                    const intensity = entry.articles / maxArticles;
                                    const opacity = 0.4 + intensity * 0.6;
                                    return <Cell key={i} fill={`rgba(139, 92, 246, ${opacity})`} />;
                                })}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>

                    <div className="pt-3 border-t border-border-dark grid grid-cols-3 gap-2 text-center">
                        <div>
                            <p className="text-xl font-black text-white">{displayData[displayData.length - 1]?.articles}</p>
                            <p className="text-[10px] text-text-secondary">Latest Month</p>
                        </div>
                        <div>
                            <p className="text-xl font-black text-white">{Math.round(displayData.reduce((s, d) => s + d.articles, 0) / displayData.length)}</p>
                            <p className="text-[10px] text-text-secondary">Monthly Avg</p>
                        </div>
                        <div>
                            <p className="text-xl font-black text-accent-purple">
                                +{displayData.length > 1 ? Math.round(((displayData[displayData.length - 1].articles / displayData[0].articles) - 1) * 100) : 0}%
                            </p>
                            <p className="text-[10px] text-text-secondary">Period Growth</p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default MediaCoverageChart;
