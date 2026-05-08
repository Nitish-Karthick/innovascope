import { fetchWithAuth } from '../utils/api';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Newspaper, UploadCloud } from 'lucide-react';

const EmptyState = ({ onBack }) => (
    <div className="flex flex-col items-center justify-center gap-6 py-24 text-center animate-in fade-in duration-500">
        <div className="relative">
            <div className="size-24 rounded-2xl bg-surface-highlight border border-border-dark flex items-center justify-center shadow-xl">
                <Newspaper className="size-12 text-text-secondary opacity-60" />
            </div>
            <div className="absolute -bottom-2 -right-2 size-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                <UploadCloud className="size-4 text-white" />
            </div>
        </div>

        <div>
            <h2 className="text-2xl font-black text-white font-display mb-2">No market news</h2>
            <p className="text-text-secondary max-w-sm text-sm leading-relaxed">
                Upload a CSV file on the dashboard to populate live market news.
            </p>
        </div>

        <button
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 rounded-xl text-white font-bold shadow-lg shadow-primary/25 transition-all hover:scale-105 active:scale-95"
        >
            <ArrowLeft className="size-5" />
            Return to Dashboard
        </button>
    </div>
);

const MarketNews = ({ onBack }) => {
    const [status, setStatus] = useState(null); // null = loading
    const [newsItems, setNewsItems] = useState([]);
    const [selectedTechNews, setSelectedTechNews] = useState("All");

    useEffect(() => {
        fetchWithAuth('/api/status')
            .then(r => r.json())
            .then(d => {
                setStatus(d);
                if (d.has_data) {
                    fetchWithAuth('/api/trending')
                        .then(r => r.json())
                        .then(data => {
                            const flattenedNews = [];
                            if (data && data.items) {
                                data.items.forEach(tech => {
                                    if (tech.recent_news && tech.recent_news.length > 0) {
                                        tech.recent_news.forEach(news => {
                                            flattenedNews.push({ ...news, techName: tech.name, techColor: tech.color || "accent-cyan" });
                                        });
                                    }
                                });
                            }
                            setNewsItems(flattenedNews);
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
                 Checking for market news...
             </div>
         );
    }
    
    if (!status.has_data || newsItems.length === 0) {
         return <EmptyState onBack={onBack} />;
    }

    const uniqueTechs = ['All', ...new Set(newsItems.map(item => item.techName))];
    const displayedNews = selectedTechNews === 'All' ? newsItems : newsItems.filter(n => n.techName === selectedTechNews);

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-4xl mx-auto w-full">
            <button onClick={onBack} className="flex items-center gap-2 text-text-secondary hover:text-white mb-2 transition-colors w-fit">
                <ArrowLeft className="size-4" /> Back to Dashboard
            </button>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 border-b border-border-dark pb-6">
                 <div className="flex items-center gap-4">
                     <div className="p-3 bg-surface-highlight border border-border-dark rounded-xl">
                          <Newspaper className="size-6 text-accent-cyan" />
                     </div>
                     <div>
                          <h1 className="text-3xl font-black text-white font-display">Live Market News</h1>
                          <p className="text-text-secondary text-sm">Real-time headlines and snippets feeding the LLM analysis.</p>
                     </div>
                 </div>

                 <div className="flex flex-col gap-1.5 w-full md:w-64">
                     <label className="text-xs text-text-secondary font-semibold uppercase tracking-wider ml-1">Filter by Technology</label>
                     <select 
                         className="w-full h-10 px-3 bg-card-dark border border-border-dark rounded-lg text-white text-sm outline-none focus:border-primary transition-colors cursor-pointer appearance-none"
                         value={selectedTechNews}
                         onChange={(e) => setSelectedTechNews(e.target.value)}
                     >
                         {uniqueTechs.map(tech => (
                             <option key={tech} value={tech}>{tech}</option>
                         ))}
                     </select>
                 </div>
            </div>

            <div className="flex flex-col gap-4">
                 {displayedNews.length === 0 ? (
                     <div className="py-12 text-center text-text-secondary">No news articles found for this filter.</div>
                 ) : (
                     displayedNews.map((news, idx) => {
                          const dateToDisplay = news.date ? new Date(news.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : "Recently";
                          return (
                          <div key={idx} className="flex flex-col p-5 bg-surface rounded-xl border border-border-dark hover:border-border-highlight transition-colors shadow-lg">
                               <div className="flex items-center justify-between gap-4 mb-3">
                                   <div className="flex items-center gap-2">
                                       <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md border ${getColorClasses(news.techColor)}`}>
                                           {news.techName}
                                       </span>
                                       <span className="text-text-secondary text-xs">{dateToDisplay}</span>
                                   </div>
                                   <span className="text-xs font-medium text-text-secondary bg-surface-highlight px-2 py-1 rounded-md">{news.source}</span>
                               </div>
                               <h3 className="text-lg font-bold text-white mb-2 leading-snug">{news.title}</h3>
                               <p className="text-text-secondary text-sm leading-relaxed">{news.snippet}</p>
                          </div>
                          );
                     })
                 )}
            </div>
        </div>
    );
};

export default MarketNews;
