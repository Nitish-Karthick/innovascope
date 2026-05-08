import React, { useState } from 'react';
import { Radar, Loader2, Eye, EyeOff } from 'lucide-react';
import { setAuthToken, fetchWithAuth } from '../../utils/api';

const Login = ({ onLogin, onGoToRegister }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetchWithAuth('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Login failed');

            setAuthToken(data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            onLogin(data.user);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background-dark text-white font-display">
            <div className="w-full max-w-md p-8 bg-card-dark border border-surface-highlight rounded-2xl shadow-2xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="flex items-center justify-center size-12 rounded-xl bg-gradient-to-br from-primary to-accent-purple shadow-lg mb-4">
                        <Radar className="text-white size-6" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">Welcome Back</h2>
                    <p className="text-text-secondary text-sm mt-1">Sign in to InnovaScope</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full h-11 bg-surface-highlight border-none rounded-lg px-4 text-sm text-white focus:ring-1 focus:ring-primary focus:bg-surface-dark transition-all outline-none"
                            placeholder="Enter username"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full h-11 bg-surface-highlight border-none rounded-lg px-4 pr-10 text-sm text-white focus:ring-1 focus:ring-primary focus:bg-surface-dark transition-all outline-none"
                                placeholder="Enter password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-11 mt-2 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:hover:bg-primary rounded-lg text-white font-medium shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="size-5 animate-spin" /> : 'Sign In'}
                    </button>
                </form>

                <p className="text-center text-sm text-text-secondary mt-6">
                    Don't have an account?{' '}
                    <button onClick={onGoToRegister} className="text-primary hover:text-white transition-colors">
                        Create one
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;
