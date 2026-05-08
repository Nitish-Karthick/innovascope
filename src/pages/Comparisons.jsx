import { fetchWithAuth } from '../utils/api';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, GitCompare, LayoutGrid, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';

const Comparisons = ({ onBack }) => {
    const [status, setStatus] = useState(null); // null = loading
    const [techItems, setTechItems] = useState([]);
    const [selectedA, setSelectedA] = useState('');
    const [selectedB, setSelectedB] = useState('');

    useEffect(() => {
        fetchWithAuth('/api/status')
            .then(r => r.json())
            .then(d => {
                setStatus(d);
                if (d.has_data) {
                    fetchWithAuth('/api/trending')
                        .then(r => r.json())
                        .then(data => {
                            if (data && data.items && data.items.length > 0) {
                                setTechItems(data.items);
                                // Default select top 2
                                setSelectedA(data.items[0].name);
                                if (data.items.length > 1) {
                                    setSelectedB(data.items[1].name);
                                } else {
                                    setSelectedB(data.items[0].name);
                                }
                            }
                        });
                }
            })
            .catch(() => setStatus({ has_data: false, has_more: false }));
    }, []);

    const getColorClasses = (color) => {
        switch (color) {
            case 'accent-cyan': return 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20';
            case 'accent-purple': return 'bg-accent-purple/10 text-accent-purple border-accent-purple/20';
            case 'emerald-500': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'red-400': return 'bg-red-400/10 text-red-400 border-red-400/20';
            default: return 'bg-white/10 text-white border-white/20';
        }
    };

    if (status === null) {
         return (
             <div className="flex items-center justify-center py-24 text-text-secondary">
                 Loading comparisons...
             </div>
         );
    }
    
    if (!status.has_data || techItems.length === 0) {
         return (
             <div className="flex flex-col items-center justify-center gap-6 py-24 text-center animate-in fade-in duration-500">
                 <div className="size-24 rounded-2xl bg-surface-highlight border border-border-dark flex items-center justify-center shadow-xl">
                     <LayoutGrid className="size-12 text-text-secondary opacity-60" />
                 </div>
                 <div>
                     <h2 className="text-2xl font-black text-white font-display mb-2">No data to compare</h2>
                     <p className="text-text-secondary max-w-sm text-sm">Upload a dataset first to enable market comparisons.</p>
                 </div>
                 <button onClick={onBack} className="mt-4 px-6 py-3 bg-primary rounded-xl text-white font-bold shadow-lg shadow-primary/25">
                     Return to Dashboard
                 </button>
             </div>
         );
    }

    const techA = techItems.find(t => t.name === selectedA);
    const techB = techItems.find(t => t.name === selectedB);

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto w-full">
            <button onClick={onBack} className="flex items-center gap-2 text-text-secondary hover:text-white mb-2 transition-colors w-fit">
                <ArrowLeft className="size-4" /> Back to Dashboard
            </button>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border-dark pb-6">
                 <div className="flex gap-4">
                     <div className="p-3 bg-surface-highlight border border-border-dark rounded-xl">
                          <GitCompare className="size-6 text-primary" />
                     </div>
                     <div>
                          <h1 className="text-3xl font-black text-white font-display">Head-to-Head Comparison</h1>
                          <p className="text-text-secondary text-sm">Compare market sentiment and investment velocity.</p>
                     </div>
                 </div>
                 
                 <div className="flex items-center gap-4 w-full md:w-auto">
                     <div className="flex-1 md:w-48 relative">
                         <select 
                            value={selectedA} 
                            onChange={(e) => setSelectedA(e.target.value)}
                            className="bg-surface-highlight border border-border-dark text-white font-bold text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-3 outline-none appearance-none shadow-lg cursor-pointer"
                         >
                             {techItems.map((t, idx) => <option key={`a-${idx}`} value={t.name}>{t.name}</option>)}
                         </select>
                     </div>
                     <span className="text-text-secondary font-black text-sm uppercase tracking-widest bg-background-dark px-2 rounded-full border border-border-dark py-1 shadow mt-1">VS</span>
                     <div className="flex-1 md:w-48 relative">
                         <select 
                            value={selectedB} 
                            onChange={(e) => setSelectedB(e.target.value)}
                            className="bg-surface-highlight border border-border-dark text-white font-bold text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-3 outline-none appearance-none shadow-lg cursor-pointer"
                         >
                             {techItems.map((t, idx) => <option key={`b-${idx}`} value={t.name}>{t.name}</option>)}
                         </select>
                     </div>
                 </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[techA, techB].map((tech, idx) => {
                    if (!tech) return <div key={idx} className="bg-surface-highlight rounded-2xl border border-border-dark p-6">Select a technology</div>;
                    
                    const isUp = tech.changeType !== 'down';
                    
                    return (
                        <div key={idx} className="bg-surface-highlight rounded-2xl border border-border-dark p-6 md:p-8 flex flex-col gap-6 shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                                <GitCompare className="size-48 text-white" />
                            </div>
                            
                            <div className="flex justify-between items-start z-10">
                                <div className="flex flex-col gap-2">
                                    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded border w-fit ${getColorClasses(tech.color)}`}>
                                        {tech.category}
                                    </span>
                                    <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white font-display leading-none">{tech.name}</h2>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-text-secondary uppercase font-bold tracking-widest block mb-1">Velocity</span>
                                    <span className="text-4xl text-white font-black block">{tech.score}</span>
                                    <span className={`flex items-center justify-end gap-1 mt-1 font-bold ${isUp ? 'text-accent-green' : 'text-red-400'}`}>
                                        {isUp ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                                        {tech.change}
                                    </span>
                                </div>
                            </div>

                            <div className="h-px w-full bg-border-dark/50 z-10 my-2"></div>
                            
                            <div className="z-10 flex-1 bg-background-dark/50 p-5 rounded-xl border border-border-dark">
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles className="size-4 text-primary" />
                                    <h4 className="text-white font-bold text-sm tracking-wide">AI Analysis</h4>
                                </div>
                                <p className="text-text-secondary text-sm leading-relaxed">
                                    {tech.analysis_summary || "No AI analysis summary is available for this technology. Ensure your dataset has been processed by the NLP engine."}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Comparisons;
