import { fetchWithAuth } from '../../utils/api';
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Code2, TrendingUp, TrendingDown } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-surface-dark border border-border-dark rounded-lg px-3 py-2 text-xs shadow-xl">
            <p className="text-white font-semibold mb-1">{label}</p>
            <p className="text-accent-cyan">Interest: <strong>{payload[0]?.value}</strong></p>
        </div>
    );
};

const COLORS = ['#22d3ee', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

const DeveloperInterestChart = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        fetchWithAuth('/api/developer-interest')
            .then(r => r.json())
            .then(d => setData(d.data || []))
            .catch(console.error);
    }, []);

    return (
        <div className="bg-card-dark rounded-xl border border-border-dark p-6 flex flex-col gap-4 hover:border-primary/50 transition-colors h-full">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-bold text-white font-display">Developer Interest</h3>
                    <p className="text-sm text-text-secondary">Top technologies by adoption velocity</p>
                </div>
                <div className="bg-border-dark p-2 rounded-lg text-accent-purple">
                    <Code2 className="size-5" />
                </div>
            </div>

            {data.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-text-secondary text-sm">Loading...</div>
            ) : (
                <>
                    <ResponsiveContainer width="100%" height={140}>
                        <BarChart data={data} margin={{ top: 0, right: 0, left: -28, bottom: 0 }} barSize={18}>
                            <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false}
                                tickFormatter={v => v.length > 10 ? v.slice(0, 10) + '…' : v} />
                            <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                            <Bar dataKey="interest" radius={[4, 4, 0, 0]}>
                                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>

                    <div className="pt-3 border-t border-border-dark flex flex-col gap-2">
                        {data.map((item, i) => (
                            <div key={i} className="flex justify-between items-center">
                                <span className="text-xs text-white truncate max-w-[140px]">{item.name}</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-white">{item.interest}</span>
                                    <span className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ${item.growth >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                        {item.growth >= 0
                                            ? <TrendingUp className="size-2.5 mr-0.5" />
                                            : <TrendingDown className="size-2.5 mr-0.5" />}
                                        {Math.abs(item.growth)}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default DeveloperInterestChart;
