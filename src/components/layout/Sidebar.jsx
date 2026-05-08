import React from 'react';
import {
    Radar,
    TrendingUp,
    Newspaper,
    ArrowLeftRight,
    Settings,
    Database,
    History as HistoryIcon,
    LogOut,
    User
} from 'lucide-react';
import clsx from 'clsx';

const Sidebar = ({ user, currentView, onViewChange, onLogout }) => {
    return (
        <aside className="w-20 lg:w-64 flex flex-col border-r border-surface-highlight bg-background-dark flex-shrink-0 transition-all duration-300">
            {/* Logo Area */}
            <div className="h-16 flex items-center gap-3 px-6 border-b border-surface-highlight">
                <div className="relative flex items-center justify-center size-8 rounded-lg bg-gradient-to-br from-primary to-accent-purple shadow-lg shrink-0">
                    <Radar className="text-white size-5" />
                </div>
                <div className="hidden lg:flex flex-col overflow-hidden">
                    <h1 className="text-white text-base font-bold leading-none tracking-tight whitespace-nowrap">InnovaScope</h1>
                    <span className="text-text-secondary text-xs mt-1 whitespace-nowrap">v3.0.1 Enterprise</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 flex flex-col gap-2 p-4 overflow-y-auto">
                <NavItem
                    icon={Radar}
                    label="Radar View"
                    active={currentView === 'dashboard'}
                    onClick={() => onViewChange('dashboard')}
                />
                <NavItem
                    icon={TrendingUp}
                    label="Forecasts"
                    active={currentView === 'details'}
                    onClick={() => onViewChange('details')}
                />
                <NavItem
                    icon={Newspaper}
                    label="Market News"
                    active={currentView === 'market_news'}
                    onClick={() => onViewChange('market_news')}
                />
                <NavItem
                    icon={ArrowLeftRight}
                    label="Comparisons"
                    active={currentView === 'comparisons'}
                    onClick={() => onViewChange('comparisons')}
                />
                <NavItem
                    icon={Database}
                    label="Upload Data"
                    active={currentView === 'upload'}
                    onClick={() => onViewChange('upload')}
                />
                <NavItem
                    icon={HistoryIcon}
                    label="History"
                    active={currentView === 'history'}
                    onClick={() => onViewChange('history')}
                />

                <div className="hidden lg:block my-2 h-px bg-surface-highlight mx-2"></div>

                <div className="hidden lg:block px-3 py-2">
                    <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Saved Reports</p>
                    <div className="flex flex-col gap-3">
                        <SavedReport color="bg-accent-cyan" label="Q3 AI Landscape" />
                        <SavedReport color="bg-accent-purple" label="Cloud Native '24" />
                    </div>
                </div>
            </nav>

            {/* Bottom Settings */}
            <div className="p-4 border-t border-surface-highlight">
                <NavItem
                    icon={Settings}
                    label="Settings"
                    active={currentView === 'settings'}
                    onClick={() => onViewChange('settings')}
                />
                <NavItem
                    icon={LogOut}
                    label="Log Out"
                    onClick={onLogout}
                    className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                />

                <div className="mt-4 flex items-center gap-3 px-3">
                    <div className="size-8 rounded-full bg-surface-highlight flex items-center justify-center border border-surface-highlight shrink-0">
                        <User className="size-5 text-text-secondary" />
                    </div>
                    <div className="hidden lg:flex flex-col overflow-hidden">
                        <span className="text-sm font-medium text-white truncate">{user?.name || user?.username || 'User'}</span>
                        <span className="text-xs text-text-secondary truncate">{user?.role || 'Analyst'}</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};

const NavItem = ({ icon: Icon, label, active = false, onClick, className }) => (
    <button
        onClick={onClick}
        className={clsx(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group w-full text-left",
            active
                ? "bg-primary/20 text-white"
                : "text-text-secondary hover:bg-surface-highlight hover:text-white",
            className
        )}
    >
        <Icon
            className={clsx(
                "size-5 transition-colors",
                active ? "text-white" : className ? "" : "group-hover:text-accent-cyan"
            )}
        />
        <span className="hidden lg:block text-sm font-medium whitespace-nowrap">{label}</span>
    </button>
);

const SavedReport = ({ color, label }) => (
    <a href="#" className="flex items-center gap-2 text-sm text-text-secondary hover:text-white transition-colors">
        <span className={`size-2 rounded-full ${color}`}></span>
        <span className="truncate">{label}</span>
    </a>
);

export default Sidebar;
