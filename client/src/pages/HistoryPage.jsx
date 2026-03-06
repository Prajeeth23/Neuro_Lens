import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

function HistoryPage({ token }) {
    const navigate = useNavigate();
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchHistory = async () => {
            try {
                const res = await axios.get('/api/history', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setScans(res.data.scans);
            } catch (err) {
                setError('Could not load history');
            }
            setLoading(false);
        };

        fetchHistory();
    }, [token, navigate]);

    if (loading) {
        return (
            <div className="relative z-10 min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
                <div className="ui-loader">
                    <div className="ui-loader-ring" />
                    <div className="ui-loader-ring" />
                    <div className="ui-loader-ring" />
                    <div className="ui-loader-dot" />
                </div>
            </div>
        );
    }

    return (
        <div className="relative z-10 min-h-screen pt-24 pb-16 px-4">
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-3">
                        Detection History
                    </h1>
                    <p className="text-text-secondary">
                        Your previous scan results
                    </p>
                </motion.div>

                {error && (
                    <div
                        className="mb-6 p-4 rounded-lg text-sm text-center"
                        style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#ef4444',
                        }}
                    >
                        {error}
                    </div>
                )}

                {scans.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="ui-card text-center py-16"
                    >
                        <svg
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            className="mx-auto mb-4 text-text-muted"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                        </svg>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">
                            No Scans Yet
                        </h3>
                        <p className="text-sm text-text-secondary mb-6">
                            Upload and analyze media to build your detection history.
                        </p>
                        <Link to="/detect" className="ui-btn">
                            <span>Start Detection</span>
                        </Link>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        {scans.map((scan, i) => (
                            <motion.div
                                key={scan._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="ui-card"
                            >
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    {/* File icon */}
                                    <div
                                        className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={{ background: 'rgba(168, 85, 247, 0.1)' }}
                                    >
                                        <svg
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="#a855f7"
                                            strokeWidth="1.5"
                                        >
                                            {scan.file_type === 'image' ? (
                                                <>
                                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                                    <path d="M21 15l-5-5L5 21" />
                                                </>
                                            ) : (
                                                <polygon points="5 3 19 12 5 21 5 3" />
                                            )}
                                        </svg>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-semibold text-text-primary truncate">
                                            {scan.original_name}
                                        </h3>
                                        <p className="text-xs text-text-muted mt-1">
                                            {new Date(scan.created_at).toLocaleString()}
                                        </p>
                                    </div>

                                    {/* Result */}
                                    <div className="flex items-center gap-4">
                                        {scan.prediction ? (
                                            <>
                                                <span
                                                    className={`ui-badge ${scan.prediction === 'FAKE'
                                                            ? 'ui-badge-fake'
                                                            : 'ui-badge-real'
                                                        }`}
                                                >
                                                    {scan.prediction}
                                                </span>
                                                <div className="text-right">
                                                    <div
                                                        className="text-sm font-bold"
                                                        style={{
                                                            color:
                                                                scan.prediction === 'FAKE'
                                                                    ? '#ef4444'
                                                                    : '#10b981',
                                                        }}
                                                    >
                                                        {Math.round(scan.confidence_score * 100)}%
                                                    </div>
                                                    <div className="text-[10px] text-text-muted">
                                                        confidence
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <span className="text-xs text-text-muted">
                                                Pending
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default HistoryPage;
