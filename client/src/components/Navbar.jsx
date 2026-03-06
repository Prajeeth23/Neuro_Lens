import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function Navbar({ user, onLogout }) {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50">
            <div
                className="backdrop-blur-xl border-b"
                style={{
                    background: 'rgba(10, 10, 15, 0.85)',
                    borderColor: 'rgba(168, 85, 247, 0.1)',
                }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3 group">
                            <div
                                className="w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden"
                                style={{
                                    boxShadow: '0 0 15px rgba(168, 85, 247, 0.3)',
                                }}
                            >
                                <img src="/neurolens-logo.jpg" alt="NeuroLens" className="w-full h-full object-cover" />
                            </div>
                            <span
                                className="text-lg font-bold tracking-wide"
                                style={{
                                    background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >
                                NeuroLens
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-6">
                            <Link
                                to="/"
                                className="text-sm text-text-secondary hover:text-neon-purple transition-colors"
                            >
                                Home
                            </Link>
                            <Link
                                to="/detect"
                                className="text-sm text-text-secondary hover:text-neon-purple transition-colors"
                            >
                                Detection
                            </Link>
                            {user && (
                                <Link
                                    to="/history"
                                    className="text-sm text-text-secondary hover:text-neon-purple transition-colors"
                                >
                                    History
                                </Link>
                            )}
                            {user ? (
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-text-muted">
                                        {user.name}
                                    </span>
                                    <button
                                        onClick={onLogout}
                                        className="ui-btn ui-btn-sm"
                                        style={{ padding: '6px 16px', fontSize: '12px' }}
                                    >
                                        <span>Logout</span>
                                    </button>
                                </div>
                            ) : (
                                <Link to="/login" className="ui-btn ui-btn-sm">
                                    <span>Login</span>
                                </Link>
                            )}
                        </div>

                        {/* Mobile hamburger */}
                        <button
                            className="md:hidden text-text-secondary"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                {mobileMenuOpen ? (
                                    <path d="M18 6L6 18M6 6l12 12" />
                                ) : (
                                    <path d="M3 12h18M3 6h18M3 18h18" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="md:hidden overflow-hidden border-t"
                            style={{
                                background: 'rgba(10, 10, 15, 0.95)',
                                borderColor: 'rgba(168, 85, 247, 0.1)',
                            }}
                        >
                            <div className="px-4 py-4 flex flex-col gap-3">
                                <Link
                                    to="/"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-sm text-text-secondary hover:text-neon-purple py-2"
                                >
                                    Home
                                </Link>
                                <Link
                                    to="/detect"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-sm text-text-secondary hover:text-neon-purple py-2"
                                >
                                    Detection
                                </Link>
                                {user && (
                                    <Link
                                        to="/history"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="text-sm text-text-secondary hover:text-neon-purple py-2"
                                    >
                                        History
                                    </Link>
                                )}
                                {user ? (
                                    <button
                                        onClick={() => {
                                            onLogout();
                                            setMobileMenuOpen(false);
                                        }}
                                        className="ui-btn ui-btn-sm w-fit"
                                    >
                                        <span>Logout</span>
                                    </button>
                                ) : (
                                    <Link
                                        to="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="ui-btn ui-btn-sm w-fit"
                                    >
                                        <span>Login</span>
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
}

export default Navbar;
