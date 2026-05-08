import { fetchWithAuth } from '../../utils/api';
import React, { useState, useEffect } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-surface-dark border border-border-dark rounded-lg px-3 py-2 text-xs shadow-xl">
            <p className="text-text-secondary mb-1 font-semibold">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value ?? '—'}</strong></p>
            ))}
        </div>
    );
};

const ForecastingChart = ({ filter }) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        fetchWithAuth('/api/forecast')
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
            return { ...item, score: null, predicted: null };
        });
    };
    const displayData = getSlicedData(data);

    return (
        <div className="bg-card-dark rounded-xl border border-border-dark p-6 flex flex-col gap-4 hover:border-primary/50 transition-colors">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-white font-display">Momentum Forecast</h3>
                    <p className="text-sm text-text-secondary mb-1">Investment velocity score (0–100) over time</p>
                    <div className="flex items-center gap-4 text-xs text-text-secondary">
                        <span className="flex items-center gap-1.5">
                            <span className="inline-block w-5 h-0.5 bg-cyan-400 rounded"></span>
                            Actual score from CSV
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="inline-block w-5 border-t-2 border-dashed border-purple-400"></span>
                            Predicted trajectory
                        </span>
                    </div>
                </div>
                <div className="bg-border-dark p-2 rounded-lg text-accent-cyan">
                    <TrendingUp className="size-5" />
                </div>
            </div>

            {displayData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-text-secondary text-sm">Loading forecast...</div>
            ) : (
                <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={displayData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.25} />
                                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gradPredicted" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af', paddingTop: 8 }} />
                        <Area
                            type="monotone" dataKey="score" name="Actual"
                            stroke="#22d3ee" strokeWidth={2} fill="url(#gradActual)"
                            connectNulls={false} dot={false} activeDot={{ r: 4 }}
                        />
                        <Area
                            type="monotone" dataKey="predicted" name="Predicted"
                            stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 4" fill="url(#gradPredicted)"
                            dot={false} activeDot={{ r: 4 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default ForecastingChart;
