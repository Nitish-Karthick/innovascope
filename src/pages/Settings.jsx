import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, ArrowLeft, Loader2, Save, User, Eye, EyeOff } from 'lucide-react';
import { fetchWithAuth } from '../utils/api';

const Settings = ({ onBack }) => {
    const [formData, setFormData] = useState({ name: '', email: '', role: '', groq_api_key: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const res = await fetchWithAuth('http://localhost:8000/api/user/settings');
                if (!res.ok) throw new Error('Failed to load settings');
                const data = await res.json();
                setFormData({
                    name: data.name || '',
                    email: data.email || '',
                    role: data.role || '',
                    groq_api_key: data.groq_api_key || ''
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadSettings();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            const res = await fetchWithAuth('http://localhost:8000/api/user/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (!res.ok) throw new Error('Failed to save settings');
            
            // Update local storage user profile name
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                user.name = formData.name;
                user.role = formData.role;
                localStorage.setItem('user', JSON.stringify(user));
                window.dispatchEvent(new Event('user-updated'));
            }

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
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
                        <SettingsIcon className="text-primary size-6" />
                        Account Settings
                    </h2>
                    <p className="text-sm text-text-secondary">Manage your profile details and preferences.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="size-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="max-w-2xl bg-card-dark border border-surface-highlight rounded-2xl p-8">
                    <div className="flex items-center gap-6 mb-8 pb-8 border-b border-surface-highlight">
                        <div className="size-20 rounded-full bg-surface-highlight flex items-center justify-center border-4 border-card-dark shadow-xl">
                            <User className="size-8 text-text-secondary" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">{formData.name}</h3>
                            <p className="text-text-secondary">{formData.role}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                                Profile updated successfully!
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Display Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full h-11 bg-surface-highlight border-none rounded-lg px-4 text-sm text-white focus:ring-1 focus:ring-primary focus:bg-surface-dark transition-all outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Role / Title</label>
                                <input
                                    type="text"
                                    value={formData.role}
                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                    className="w-full h-11 bg-surface-highlight border-none rounded-lg px-4 text-sm text-white focus:ring-1 focus:ring-primary focus:bg-surface-dark transition-all outline-none"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-text-secondary mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full h-11 bg-surface-highlight border-none rounded-lg px-4 text-sm text-white focus:ring-1 focus:ring-primary focus:bg-surface-dark transition-all outline-none"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-text-secondary mb-2">Groq API Key (Llama-3.3-70b)</label>
                                <div className="relative">
                                    <input
                                        type={showApiKey ? "text" : "password"}
                                        value={formData.groq_api_key}
                                        onChange={(e) => setFormData({...formData, groq_api_key: e.target.value})}
                                        placeholder="gsk_..."
                                        className="w-full h-11 bg-surface-highlight border-none rounded-lg px-4 pr-10 text-sm text-white focus:ring-1 focus:ring-primary focus:bg-surface-dark transition-all outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowApiKey(!showApiKey)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors"
                                    >
                                        {showApiKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                    </button>
                                </div>
                                <p className="text-xs text-text-secondary mt-1">Required to generate AI insights when uploading or processing data.</p>
                            </div>
                        </div>

                        <div className="pt-4 mt-2 border-t border-surface-highlight flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="h-11 px-6 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:hover:bg-primary rounded-lg text-white font-medium shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                            >
                                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Settings;
