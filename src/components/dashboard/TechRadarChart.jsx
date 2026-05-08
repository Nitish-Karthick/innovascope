import { fetchWithAuth } from '../../utils/api';
import React, { useState, useEffect } from 'react';
import clsx from 'clsx';

const TechRadarChart = ({ onPointClick }) => {
    const [points, setPoints] = useState([]);

    useEffect(() => {
        fetchWithAuth('/api/radar')
            .then(res => res.json())
            .then(d => setPoints(d.points || []))
            .catch(console.error);
    }, []);

    return (
        <div className="xl:col-span-2 glass-panel rounded-xl p-6 flex flex-col relative overflow-hidden self-start">
            <div className="flex justify-between items-start mb-6 z-10">
                <div>
                    <h3 className="text-white text-lg font-bold">Technology Landscape</h3>
                    <p className="text-text-secondary text-sm">Real-time quadrant analysis based on NLP sentiment</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-3 py-1.5 rounded-md bg-surface-highlight text-xs font-medium text-white border border-transparent hover:border-primary/50 transition-all">All</button>
                    <button className="px-3 py-1.5 rounded-md bg-transparent text-xs font-medium text-text-secondary hover:text-white border border-surface-highlight hover:border-text-secondary transition-all">Tools</button>
                    <button className="px-3 py-1.5 rounded-md bg-transparent text-xs font-medium text-text-secondary hover:text-white border border-surface-highlight hover:border-text-secondary transition-all">Platforms</button>
                </div>
            </div>

            {/* Radar Chart Simulation */}
            <div className="relative flex items-center justify-center min-h-[320px] max-h-[440px] h-[45vh]">
                {/* Background Grid/Circles */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                    {/* Crosshairs */}
                    <div className="absolute w-full h-px bg-white"></div>
                    <div className="absolute h-full w-px bg-white"></div>
                    {/* Circles */}
                    <div className="absolute w-[25%] h-[25%] rounded-full border border-dashed border-white"></div>
                    <div className="absolute w-[50%] h-[50%] rounded-full border border-dashed border-white"></div>
                    <div className="absolute w-[75%] h-[75%] rounded-full border border-dashed border-white"></div>
                    <div className="absolute w-[100%] h-[100%] rounded-full border border-white opacity-50"></div>
                </div>

                {/* Labels */}
                <div className="absolute top-4 font-bold text-xs uppercase tracking-widest text-text-secondary opacity-50">Adopt</div>
                <div className="absolute top-[28%] font-bold text-xs uppercase tracking-widest text-text-secondary opacity-50">Trial</div>
                <div className="absolute top-[40%] font-bold text-xs uppercase tracking-widest text-text-secondary opacity-50">Assess</div>
                <div className="absolute top-[46%] font-bold text-xs uppercase tracking-widest text-text-secondary opacity-50">Hold</div>

                <div className="absolute top-4 left-4 text-primary font-bold opacity-30 text-2xl lg:text-4xl">TOOLS</div>
                <div className="absolute top-4 right-4 text-primary font-bold opacity-30 text-2xl lg:text-4xl">PLATFORMS</div>
                <div className="absolute bottom-4 right-4 text-primary font-bold opacity-30 text-2xl lg:text-4xl">LANGUAGES</div>
                <div className="absolute bottom-4 left-4 text-primary font-bold opacity-30 text-2xl lg:text-4xl">TECHNIQUES</div>

                {/* Data Points */}
                {points.map((p, i) => (
                    <RadarBlip
                        key={i}
                        {...p}
                        onClick={onPointClick}
                    />
                ))}
            </div>
        </div>
    );
};

const RadarBlip = ({ top, left, right, bottom, color, glow, label, onClick }) => (
    <div
        className="absolute group z-20"
        style={{ top, left, right, bottom }}
    >
        <div
            className={clsx(
                "size-3 rounded-full border-2 border-background-dark cursor-pointer transition-transform hover:scale-150",
                color,
                glow
            )}
            onClick={() => onClick(label)}
        ></div>
        <div className="absolute left-4 -top-8 bg-surface-highlight px-3 py-1.5 rounded-lg text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl border border-white/10 pointer-events-none">
            {label}
        </div>
    </div>
);

export default TechRadarChart;
