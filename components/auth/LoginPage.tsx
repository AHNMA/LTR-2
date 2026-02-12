
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { User, Lock, CheckSquare, Square, AlertCircle, X } from 'lucide-react';

const LoginPage: React.FC = () => {
    const { login } = useAuth();
    const { goToHome, goToRegister, goToForgotPassword } = useNavigation();
    
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [keepSignedIn, setKeepSignedIn] = useState(false);
    const [isHuman, setIsHuman] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!isHuman) {
            setError('Bitte bestätigen Sie, dass Sie ein Mensch sind.');
            return;
        }

        setLoading(true);
        const result = await login(identifier, password);
        setLoading(false);

        if (result.success) {
            goToHome();
        } else {
            setError(result.message || 'Ungültiger Benutzername oder Passwort.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 font-sans">
            <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl border border-slate-100 relative z-10">
                <button 
                    onClick={goToHome}
                    className="absolute top-4 right-4 text-slate-300 hover:text-f1-pink transition-colors"
                    title="Zurück zur Startseite"
                >
                    <X size={24} />
                </button>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-display font-bold text-slate-900 italic uppercase">Login</h1>
                    <div className="h-1 w-16 bg-f1-pink mx-auto mt-2"></div>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 flex items-center border border-red-100">
                        <AlertCircle size={16} className="mr-2 shrink-0" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nutzername oder Email</label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 text-slate-400" size={18} />
                            <input 
                                type="text" 
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-f1-pink focus:ring-1 focus:ring-f1-pink bg-white text-slate-900"
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Passwort</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 text-slate-400" size={18} />
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-f1-pink focus:ring-1 focus:ring-f1-pink bg-white text-slate-900"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div 
                            className="flex items-center cursor-pointer group"
                            onClick={() => setKeepSignedIn(!keepSignedIn)}
                        >
                            <div className="relative mr-2">
                                {keepSignedIn ? (
                                    <CheckSquare size={18} className="text-f1-pink fill-white" />
                                ) : (
                                    <Square size={18} className="text-slate-300 fill-white group-hover:text-f1-pink transition-colors" />
                                )}
                            </div>
                            <span className="text-sm text-slate-600 select-none group-hover:text-slate-800 transition-colors">Angemeldet bleiben</span>
                        </div>
                        <button type="button" onClick={goToForgotPassword} className="text-sm text-slate-400 hover:text-f1-pink font-medium">
                            Passwort vergessen?
                        </button>
                    </div>

                    {/* Human Check Custom */}
                    <div 
                        className="bg-white p-3 rounded-lg border border-slate-200 flex items-center cursor-pointer group hover:border-f1-pink/50 transition-colors"
                        onClick={() => setIsHuman(!isHuman)}
                    >
                        <div className="relative mr-3">
                            {isHuman ? (
                                <CheckSquare size={20} className="text-f1-pink fill-white" />
                            ) : (
                                <Square size={20} className="text-slate-300 fill-white group-hover:text-f1-pink/50 transition-colors" />
                            )}
                        </div>
                        <label className="text-sm text-slate-700 font-medium cursor-pointer select-none flex-grow">
                            Ich bin ein Mensch
                        </label>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-f1-pink text-white py-3 rounded-lg font-bold uppercase tracking-wider hover:bg-pink-700 transition-colors shadow-glow disabled:opacity-50"
                    >
                        {loading ? 'Lade...' : 'Einloggen'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-slate-500">
                    Noch kein Account?{' '}
                    <button onClick={goToRegister} className="text-f1-pink font-bold hover:underline">
                        Jetzt registrieren
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
