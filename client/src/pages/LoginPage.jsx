import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

function LoginPage({ onLogin }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [isRegister, setIsRegister] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
            const body = isRegister
                ? { name, email, password }
                : { email, password };

            const res = await axios.post(endpoint, body);

            onLogin(res.data.user, res.data.token);

            // Redirect back if came from save
            const returnTo = location.state?.returnTo;
            if (returnTo) {
                navigate(returnTo, { state: location.state?.resultData });
            } else {
                navigate('/detect');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong');
        }
        setLoading(false);
    };

    return (
        <div className="relative z-10 min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="ui-card ui-card-glow">
                    <div className="text-center mb-8">
                        <div
                            className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center"
                            style={{
                                background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
                                boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)',
                            }}
                        >
                            <svg
                                width="28"
                                height="28"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="2"
                            >
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-text-primary">
                            {isRegister ? 'Create Account' : 'Welcome Back'}
                        </h2>
                        <p className="text-sm text-text-secondary mt-2">
                            {isRegister
                                ? 'Sign up to save your detection history'
                                : 'Log in to access your saved scans'}
                        </p>
                    </div>

                    {error && (
                        <div
                            className="mb-4 p-3 rounded-lg text-sm"
                            style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                color: '#ef4444',
                            }}
                        >
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {isRegister && (
                            <div className="ui-input-group">
                                <label className="ui-input-label">Name</label>
                                <input
                                    type="text"
                                    className="ui-input"
                                    placeholder="Enter your name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        <div className="ui-input-group">
                            <label className="ui-input-label">Email</label>
                            <input
                                type="email"
                                className="ui-input"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="ui-input-group">
                            <label className="ui-input-label">Password</label>
                            <input
                                type="password"
                                className="ui-input"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            className="ui-btn ui-btn-lg w-full justify-center mt-2"
                            disabled={loading}
                        >
                            <span>
                                {loading
                                    ? 'Please wait...'
                                    : isRegister
                                        ? 'Create Account'
                                        : 'Login'}
                            </span>
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setIsRegister(!isRegister);
                                setError('');
                            }}
                            className="text-sm text-text-secondary hover:text-neon-purple transition-colors"
                        >
                            {isRegister
                                ? 'Already have an account? Login'
                                : 'Need an account? Register'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default LoginPage;
