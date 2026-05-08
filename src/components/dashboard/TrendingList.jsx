import { fetchWithAuth } from '../../utils/api';
import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';



const TrendingList = ({ filter, onItemClick }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWithAuth('http://localhost:8000/api/trending')
            .then(res => res.json())
            .then(d => {
                setData(d.items);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const getSlicedData = (arr) => {
        if (!arr || !arr.length) return [];
        let visibleCount = arr.length;
        if (filter === 'Last 7 Days' || filter === 'Last 30 Days') visibleCount = 2;
        if (filter === 'Last 90 Days') visibleCount = 3;
        
        if (visibleCount === arr.length) return arr;

        return arr.map((item, idx) => {
            if (idx >= arr.length - visibleCount) return item;
            return { ...item, v: null };
        });
    };

    return (
        <div className="glass-panel rounded-xl p-0 flex flex-col overflow-hidden" style={{ maxHeight: 'calc(100vh - 160px)' }}>
            <div className="p-6 border-b border-surface-highlight flex justify-between items-center bg-surface-highlight/30">
                <h3 className="text-white text-lg font-bold">Trending Now</h3>
                <button className="text-xs text-primary hover:text-white transition-colors">View All</button>
            </div>
            {loading ? (
                <div className="flex-1 flex items-center justify-center text-text-secondary">Loading trends...</div>
            ) : (
                <div className="overflow-y-auto flex-1 scrollbar-thin">
                    {data.map((item, i) => (
                        <TrendingItem
                            key={i}
                            name={item.name} category={item.category} score={item.score}
                            change={item.change} changeType={item.changeType} color={item.color} 
                            data={getSlicedData(item.data)}
                            onClick={() => onItemClick && onItemClick(item.name)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const TrendingItem = ({ name, category, score, change, changeType, color, data, onClick }) => {
    const strokeColor = color === 'accent-cyan' ? '#00f0ff' :
        color === 'accent-purple' ? '#b941ff' :
            color === 'emerald-500' ? '#10b981' : '#f87171';

    return (
        <div className="p-4 border-b border-surface-highlight hover:bg-surface-highlight/50 transition-colors group cursor-pointer" onClick={onClick}>
            <div className="flex justify-between items-start mb-2">
                <div className="flex flex-col">
                    <span className={`text-white font-medium group-hover:text-${color} transition-colors`}>{name}</span>
                    <span className="text-xs text-text-secondary bg-surface-highlight w-fit px-1.5 py-0.5 rounded mt-1">{category}</span>
                </div>
                <div className="text-right">
                    <span className="text-white font-bold block">{score}</span>
                    <span className={`text-[10px] text-${color} flex items-center justify-end gap-0.5`}>
                        {changeType === 'up' ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                        {change}
                    </span>
                </div>
            </div>
            <div className="h-8 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <Line type="monotone" dataKey="v" stroke={strokeColor} strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default TrendingList;
