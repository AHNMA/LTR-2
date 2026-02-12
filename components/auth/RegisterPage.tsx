
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { User, Mail, Lock, CheckCircle, XCircle, AlertTriangle, X, Send, CheckSquare, Square } from 'lucide-react';

const RegisterPage: React.FC = () => {
    const { register, checkAvailability, verifyEmail } = useAuth();
    const { goToLogin, goToHome } = useNavigation();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [confirmEmail, setConfirmEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isHuman, setIsHuman] = useState(false);
    
    // Validation States
    const [usernameAvail, setUsernameAvail] = useState<boolean | null>(null);
    const [emailAvail, setEmailAvail] = useState<boolean | null>(null);
    const [passwordValid, setPasswordValid] = useState(false);
    const [emailsMatch, setEmailsMatch] = useState(false);
    const [passwordsMatch, setPasswordsMatch] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [generalError, setGeneralError] = useState('');
    const [successMode, setSuccessMode] = useState(false);

    // Regex for: 8 chars, 1 digit, 1 upper, 1 special
    const pwRegex = /(?=.*\d)(?=.*[A-Z])(?=.*[\W_]).{8,}/;

    // Effects for Validation
    useEffect(() => {
        if (username.length > 2) setUsernameAvail(checkAvailability('username', username));
        else setUsernameAvail(null);
    }, [username]);

    useEffect(() => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(email)) setEmailAvail(checkAvailability('email', email));
        else setEmailAvail(null);
        
        setEmailsMatch(email === confirmEmail && email !== '');
    }, [email, confirmEmail]);

    useEffect(() => {
        setPasswordValid(pwRegex.test(password));
        setPasswordsMatch(password === confirmPassword && password !== '');
    }, [password, confirmPassword]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGeneralError('');

        if (!usernameAvail || !emailAvail || !passwordValid || !emailsMatch || !passwordsMatch || !isHuman) {
            setGeneralError('Bitte überprüfen Sie alle Felder.');
            return;
        }

        setLoading(true);
        const success = await register({ username, email }, password);
        setLoading(false);

        if (success) {
            setSuccessMode(true);
        } else {
            setGeneralError('Registrierung fehlgeschlagen.');
        }
    };

    // Helper to simulate clicking the link in the email
    const simulateVerification = () => {
        verifyEmail(email);
        alert('E-Mail erfolgreich verifiziert! Sie können sich nun einloggen.');
        goToLogin();
    };

    const StatusIcon = ({ valid }: { valid: boolean | null }) => {
        if (valid === null) return null;
        return valid ? <CheckCircle size={16} className="text-green-500 ml-2" /> : <XCircle size={16} className="text-red-500 ml-2" />;
    };

    if (successMode) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12 font-sans">
                 <div className="bg-white w-full max-w-lg p-10 rounded-2xl shadow-xl border border-slate-100 text-center relative">
                    <button onClick={goToHome} className="absolute top-4 right-4 text-slate-300 hover:text-f1-pink transition-colors"><X size={24} /></button>
                    
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Send size={40} className="text-green-600 ml-1" />
                    </div>
                    <h2 className="text-3xl font-display font-bold text-slate-900 mb-2 uppercase italic">Fast fertig!</h2>
                    <p className="text-slate-600 mb-8 leading-relaxed">
                        Wir haben eine Bestätigungs-E-Mail an <strong>{email}</strong> gesendet.<br/>
                        Bitte klicken Sie auf den Link in der E-Mail, um Ihren Account zu aktivieren.
                    </p>

                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 text-sm text-slate-500">
                        <strong>Demo Modus:</strong> Da keine echte E-Mail versendet werden kann, klicken Sie bitte hier:
                        <button onClick={simulateVerification} className="block w-full mt-2 bg-slate-800 text-white py-2 rounded hover:bg-slate-700 font-bold uppercase">
                            Link in E-Mail simulieren
                        </button>
                    </div>

                    <button onClick={goToLogin} className="text-f1-pink font-bold hover:underline">Zurück zum Login</button>
                 </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12 font-sans">
            <div className="bg-white w-full max-w-lg p-8 rounded-2xl shadow-xl border border-slate-100 relative z-10">
                <button 
                    onClick={goToHome}
                    className="absolute top-4 right-4 text-slate-300 hover:text-f1-pink transition-colors"
                    title="Zurück zur Startseite"
                >
                    <X size={24} />
                </button>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-display font-bold text-slate-900 italic uppercase">Registrierung</h1>
                    <div className="h-1 w-24 bg-f1-pink mx-auto mt-2"></div>
                </div>

                {generalError && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 flex items-center border border-red-100">
                        <AlertTriangle size={16} className="mr-2 shrink-0" />
                        {generalError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Username */}
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nutzername</label>
                        <div className="relative flex items-center">
                            <User className="absolute left-3 text-slate-400" size={18} />
                            <input 
                                type="text" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-1 bg-white text-slate-900 ${usernameAvail === false ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-f1-pink focus:ring-f1-pink'}`}
                                required
                            />
                            <div className="absolute right-3"><StatusIcon valid={usernameAvail} /></div>
                        </div>
                        {usernameAvail === false && <p className="text-[10px] text-red-500 mt-1">Nutzername bereits vergeben.</p>}
                    </div>

                    {/* Email Group */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Email</label>
                            <div className="relative flex items-center">
                                <Mail className="absolute left-3 text-slate-400" size={18} />
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`w-full pl-10 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-1 bg-white text-slate-900 ${emailAvail === false ? 'border-red-500' : 'border-slate-300 focus:border-f1-pink focus:ring-f1-pink'}`}
                                    required
                                />
                                <div className="absolute right-3"><StatusIcon valid={emailAvail} /></div>
                            </div>
                            {emailAvail === false && <p className="text-[10px] text-red-500 mt-1">Email bereits registriert.</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Email bestätigen</label>
                            <div className="relative flex items-center">
                                <input 
                                    type="email" 
                                    value={confirmEmail}
                                    onChange={(e) => setConfirmEmail(e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 bg-white text-slate-900 ${!emailsMatch && confirmEmail ? 'border-red-500' : 'border-slate-300 focus:border-f1-pink focus:ring-f1-pink'}`}
                                    required
                                />
                                <div className="absolute right-3"><StatusIcon valid={emailsMatch && confirmEmail.length > 0} /></div>
                            </div>
                        </div>
                    </div>

                    {/* Password Group */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Passwort</label>
                            <div className="relative flex items-center">
                                <Lock className="absolute left-3 text-slate-400" size={18} />
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`w-full pl-10 pr-8 py-2 border rounded-lg focus:outline-none focus:ring-1 bg-white text-slate-900 ${!passwordValid && password ? 'border-red-500' : 'border-slate-300 focus:border-f1-pink focus:ring-f1-pink'}`}
                                    required
                                />
                                <div className="absolute right-3"><StatusIcon valid={passwordValid} /></div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Passwort bestätigen</label>
                            <div className="relative flex items-center">
                                <input 
                                    type="password" 
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 bg-white text-slate-900 ${!passwordsMatch && confirmPassword ? 'border-red-500' : 'border-slate-300 focus:border-f1-pink focus:ring-f1-pink'}`}
                                    required
                                />
                                <div className="absolute right-3"><StatusIcon valid={passwordsMatch && confirmPassword.length > 0} /></div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Password Rules Hint */}
                    <div className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded">
                        Mindestens 8 Zeichen, eine Zahl, ein Großbuchstabe und ein Sonderzeichen.
                    </div>

                    {/* Human Check */}
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
                            Ich bin kein Roboter
                        </label>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-f1-pink text-white py-3 rounded-lg font-bold uppercase tracking-wider hover:bg-pink-700 transition-colors shadow-glow disabled:opacity-50"
                    >
                        {loading ? 'Registriere...' : 'Account erstellen'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-slate-500">
                    Bereits einen Account?{' '}
                    <button onClick={goToLogin} className="text-f1-pink font-bold hover:underline">
                        Zum Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
