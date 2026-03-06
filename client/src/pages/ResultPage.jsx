import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
} from 'chart.js';
import axios from 'axios';
import { useState } from 'react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
    }),
};

function ResultPage({ user, token }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const data = location.state;

    if (!data || !data.result) {
        return (
            <div className="relative z-10 min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
                <div className="ui-card text-center max-w-md">
                    <h2 className="text-xl font-bold text-text-primary mb-3">
                        No Results Found
                    </h2>
                    <p className="text-sm text-text-secondary mb-6">
                        Please upload and analyze a file first to see detection results.
                    </p>
                    <Link to="/detect" className="ui-btn">
                        <span>Go to Detection</span>
                    </Link>
                </div>
            </div>
        );
    }

    const { result, fileName, fileType, preview } = data;
    const isFake = result.prediction === 'FAKE';
    const confidencePct = Math.round(result.confidence * 100);
    const aiProbPct = Math.round(result.ai_probability);

    // Doughnut chart
    const doughnutData = {
        labels: ['AI Probability', 'Authentic Probability'],
        datasets: [
            {
                data: [aiProbPct, 100 - aiProbPct],
                backgroundColor: [
                    isFake ? 'rgba(239, 68, 68, 0.8)' : 'rgba(16, 185, 129, 0.8)',
                    'rgba(30, 30, 46, 0.8)',
                ],
                borderColor: [
                    isFake ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)',
                    'rgba(30, 30, 46, 0.3)',
                ],
                borderWidth: 2,
                cutout: '75%',
            },
        ],
    };

    const doughnutOpts = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(10, 10, 15, 0.95)',
                borderColor: 'rgba(168, 85, 247, 0.3)',
                borderWidth: 1,
                titleColor: '#e2e8f0',
                bodyColor: '#94a3b8',
            },
        },
    };

    // Bar chart for regions
    const regionLabels = (result.regions || []).map((r) => r.label);
    const regionSeverities = (result.regions || []).map((r) => r.severity * 100);

    const barData = {
        labels: regionLabels.length > 0 ? regionLabels : ['No anomalies'],
        datasets: [
            {
                label: 'Severity %',
                data: regionSeverities.length > 0 ? regionSeverities : [0],
                backgroundColor: regionSeverities.map((s) =>
                    s > 75
                        ? 'rgba(239, 68, 68, 0.7)'
                        : s > 50
                            ? 'rgba(245, 158, 11, 0.7)'
                            : 'rgba(16, 185, 129, 0.7)'
                ),
                borderColor: regionSeverities.map((s) =>
                    s > 75
                        ? 'rgba(239, 68, 68, 0.3)'
                        : s > 50
                            ? 'rgba(245, 158, 11, 0.3)'
                            : 'rgba(16, 185, 129, 0.3)'
                ),
                borderWidth: 1,
                borderRadius: 6,
            },
        ],
    };

    const barOpts = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                grid: { color: 'rgba(168, 85, 247, 0.05)' },
                ticks: { color: '#64748b', font: { size: 11 } },
            },
            x: {
                grid: { display: false },
                ticks: { color: '#94a3b8', font: { size: 11 } },
            },
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(10, 10, 15, 0.95)',
                borderColor: 'rgba(168, 85, 247, 0.3)',
                borderWidth: 1,
                titleColor: '#e2e8f0',
                bodyColor: '#94a3b8',
            },
        },
    };

    const handleSave = async () => {
        if (!user || !token) {
            navigate('/login', { state: { returnTo: '/result', resultData: data } });
            return;
        }

        setSaving(true);
        try {
            await axios.post(
                '/api/save-scan',
                { scanId: result.scanId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSaved(true);
        } catch (err) {
            console.error('Save error:', err);
        }
        setSaving(false);
    };

    const handleDownloadReport = () => {
        const report = `
NEUROLENS DETECTION REPORT
==========================

File: ${fileName}
Type: ${fileType}
Date: ${new Date().toISOString()}

PREDICTION: ${result.prediction}
Confidence: ${confidencePct}%
AI Probability: ${aiProbPct}%

EXPLANATION:
${result.explanation}

SUSPICIOUS REGIONS:
${(result.regions || []).length > 0
                ? result.regions.map((r) => `- ${r.label}: ${Math.round(r.severity * 100)}% severity`).join('\n')
                : 'No suspicious regions detected.'
            }

Generated by NeuroLens AI Deepfake Detection Platform
    `.trim();

        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `neurolens-report-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="relative z-10 min-h-screen pt-24 pb-16 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    custom={0}
                    className="text-center mb-10"
                >
                    <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-3">
                        Detection Results
                    </h1>
                    <p className="text-text-secondary text-sm">
                        Analysis complete for: {fileName}
                    </p>
                </motion.div>

                {/* Main Result Card */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    custom={1}
                    className="ui-card ui-card-glow mb-6"
                >
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                        {/* Preview with scan overlay */}
                        {preview && (
                            <div className="relative w-full md:w-64 h-64 rounded-xl overflow-hidden flex-shrink-0">
                                <img
                                    src={preview}
                                    alt="Analyzed media"
                                    className="w-full h-full object-cover"
                                />
                                {/* Region highlights */}
                                {(result.regions || []).map((r, i) => (
                                    <div
                                        key={i}
                                        className="absolute border-2 rounded"
                                        style={{
                                            left: `${r.x}%`,
                                            top: `${r.y}%`,
                                            width: `${r.w}%`,
                                            height: `${r.h}%`,
                                            borderColor:
                                                r.severity > 0.7
                                                    ? 'rgba(239, 68, 68, 0.8)'
                                                    : 'rgba(245, 158, 11, 0.6)',
                                            boxShadow:
                                                r.severity > 0.7
                                                    ? '0 0 10px rgba(239, 68, 68, 0.4)'
                                                    : '0 0 10px rgba(245, 158, 11, 0.3)',
                                        }}
                                    >
                                        <span
                                            className="absolute -top-5 left-0 text-[10px] font-mono px-1 rounded"
                                            style={{
                                                background: 'rgba(10, 10, 15, 0.8)',
                                                color:
                                                    r.severity > 0.7 ? '#ef4444' : '#f59e0b',
                                            }}
                                        >
                                            {r.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Prediction Info */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="mb-4">
                                <span className={`ui-badge ${isFake ? 'ui-badge-fake' : 'ui-badge-real'}`}>
                                    {result.prediction}
                                </span>
                            </div>
                            <h2 className="text-2xl font-bold text-text-primary mb-2">
                                {isFake
                                    ? 'AI-Generated Content Detected'
                                    : 'Authentic Media Verified'}
                            </h2>
                            <p className="text-sm text-text-secondary leading-relaxed mb-6">
                                {result.explanation}
                            </p>

                            {/* Score pills */}
                            <div className="flex flex-wrap gap-4">
                                <div
                                    className="px-4 py-3 rounded-xl"
                                    style={{ background: 'rgba(18, 18, 26, 0.8)' }}
                                >
                                    <div className="text-xs text-text-muted mb-1">Confidence</div>
                                    <div
                                        className="text-xl font-bold"
                                        style={{
                                            color: isFake ? '#ef4444' : '#10b981',
                                        }}
                                    >
                                        {confidencePct}%
                                    </div>
                                </div>
                                <div
                                    className="px-4 py-3 rounded-xl"
                                    style={{ background: 'rgba(18, 18, 26, 0.8)' }}
                                >
                                    <div className="text-xs text-text-muted mb-1">AI Probability</div>
                                    <div
                                        className="text-xl font-bold"
                                        style={{
                                            color: aiProbPct > 50 ? '#ef4444' : '#10b981',
                                        }}
                                    >
                                        {aiProbPct}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Charts Row */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* Doughnut */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        custom={2}
                        className="ui-card"
                    >
                        <h3 className="text-base font-semibold text-text-primary mb-4">
                            Detection Score
                        </h3>
                        <div className="relative" style={{ height: 220 }}>
                            <Doughnut data={doughnutData} options={doughnutOpts} />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <div
                                        className="text-3xl font-bold"
                                        style={{ color: isFake ? '#ef4444' : '#10b981' }}
                                    >
                                        {aiProbPct}%
                                    </div>
                                    <div className="text-xs text-text-muted">AI Score</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Bar chart */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        custom={3}
                        className="ui-card"
                    >
                        <h3 className="text-base font-semibold text-text-primary mb-4">
                            Suspicious Regions
                        </h3>
                        <div style={{ height: 220 }}>
                            <Bar data={barData} options={barOpts} />
                        </div>
                    </motion.div>
                </div>

                {/* Actions */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    custom={4}
                    className="flex flex-wrap gap-4 justify-center"
                >
                    <button
                        className="ui-btn ui-btn-success"
                        onClick={handleSave}
                        disabled={saving || saved}
                    >
                        <span>{saved ? 'Saved' : saving ? 'Saving...' : 'Save Result'}</span>
                    </button>
                    <button className="ui-btn" onClick={handleDownloadReport}>
                        <span>Download Report</span>
                    </button>
                    <Link to="/detect" className="ui-btn" style={{ background: 'transparent' }}>
                        <span>New Scan</span>
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}

export default ResultPage;
