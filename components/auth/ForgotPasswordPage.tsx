
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { Mail, CheckCircle, CheckSquare, Square } from 'lucide-react';

const ForgotPasswordPage: React.FC = () => {
    const { requestPasswordReset } = useAuth();
    const { goToLogin } = useNavigation();
    
    const [identifier, setIdentifier] = useState('');
    const [isHuman, setIsHuman] = useState(false);
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isHuman) return;

        setLoading(true);
        // We simulate sending even if email doesn't exist for security/privacy (standard practice)
        await requestPasswordReset(identifier);
        setLoading(false);
        setSent(true);
    };

    if (sent) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 font-sans">
                 <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl border border-slate-100 text-center">
                     <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
                     <h2 className="text-2xl font-bold text-slate-900 mb-2">Email versendet!</h2>
                     <p className="text-slate-600 mb-6">
                         Falls ein Account unter dieser Adresse existiert, haben wir Ihnen einen Link zum Zurücksetzen gesendet.
                     </p>
                     <button onClick={goToLogin} className="text-f1-pink font-bold hover:underline">Zurück zum Login</button>
                 </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 font-sans">
            <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl border border-slate-100 relative z-10">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-display font-bold text-slate-900 italic uppercase">Passwort Vergessen</h1>
                    <p className="text-sm text-slate-500 mt-2">Geben Sie Ihren Nutzernamen oder Ihre Email ein.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                         <div className="relative">
                            <Mail className="absolute left-3 top-2.5 text-slate-400" size={18} />
                            <input 
                                type="text" 
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-f1-pink focus:ring-1 focus:ring-f1-pink bg-white text-slate-900"
                                placeholder="Nutzername oder Email"
                                required
                            />
                        </div>
                    </div>

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
                        disabled={loading || !isHuman}
                        className="w-full bg-f1-pink text-white py-3 rounded-lg font-bold uppercase tracking-wider hover:bg-pink-700 transition-colors shadow-glow disabled:opacity-50"
                    >
                        {loading ? 'Sende...' : 'Link anfordern'}
                    </button>
                </form>

                 <div className="mt-6 text-center text-sm">
                    <button onClick={goToLogin} className="text-slate-400 hover:text-slate-600">
                        Abbrechen
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
