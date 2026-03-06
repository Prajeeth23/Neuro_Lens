import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' },
    }),
};

const features = [
    {
        title: 'Neural Detection',
        desc: 'Advanced AI algorithms analyze facial patterns, texture anomalies, and frequency domain artifacts to identify synthetic media.',
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20M2 12h20" />
            </svg>
        ),
    },
    {
        title: 'Real-Time Analysis',
        desc: 'Upload any image or video and receive instant deepfake probability scores with detailed confidence metrics.',
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
        ),
    },
    {
        title: 'Region Mapping',
        desc: 'Visualize exactly which areas of the media triggered detection, with severity scoring for each suspicious region.',
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
            </svg>
        ),
    },
    {
        title: 'Confidence Scoring',
        desc: 'Get precise probability percentages backed by multi-layer analysis across noise patterns, edges, and statistical features.',
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
        ),
    },
    {
        title: 'Secure Processing',
        desc: 'All uploads are processed in isolated environments with end-to-end encryption. Files are not stored beyond analysis.',
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        ),
    },
    {
        title: 'Detection History',
        desc: 'Save and review your past scans with full result cards. Track detection trends and build a verification archive.',
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
            </svg>
        ),
    },
];

const steps = [
    { num: '01', title: 'Upload Media', desc: 'Drag and drop or select an image (JPG, PNG) or video (MP4) file for analysis.' },
    { num: '02', title: 'AI Analysis', desc: 'Our neural network performs multi-layer analysis including frequency, noise, and texture pattern detection.' },
    { num: '03', title: 'Get Results', desc: 'Receive a detailed report with prediction, confidence score, AI probability, and suspicious region highlights.' },
];

function LandingPage() {
    return (
        <div className="relative z-10">
            {/* Hero Section */}
            <section className="min-h-screen flex items-center justify-center px-4 pt-16">
                <div className="max-w-5xl mx-auto text-center">
                    {/* Floating orbs */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <motion.div
                            className="absolute rounded-full"
                            style={{
                                width: 300,
                                height: 300,
                                background: 'radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, transparent 70%)',
                                top: '10%',
                                left: '10%',
                            }}
                            animate={{ y: [0, -30, 0], x: [0, 15, 0] }}
                            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        <motion.div
                            className="absolute rounded-full"
                            style={{
                                width: 400,
                                height: 400,
                                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 70%)',
                                bottom: '10%',
                                right: '5%',
                            }}
                            animate={{ y: [0, 20, 0], x: [0, -20, 0] }}
                            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                        />
                    </div>

                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        custom={0}
                        className="mb-4"
                    >
                        <span
                            className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase"
                            style={{
                                background: 'rgba(168, 85, 247, 0.1)',
                                border: '1px solid rgba(168, 85, 247, 0.3)',
                                color: '#a855f7',
                            }}
                        >
                            AI-Powered Deepfake Detection
                        </span>
                    </motion.div>

                    <motion.h1
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        custom={1}
                        className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight"
                    >
                        <span className="text-text-primary">Neuro</span>
                        <span
                            style={{
                                background: 'linear-gradient(135deg, #a855f7, #3b82f6, #06b6d4)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Lens
                        </span>
                    </motion.h1>

                    <motion.p
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        custom={2}
                        className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed"
                    >
                        Verify if media is real or AI generated. Upload any image or video
                        and get instant deepfake detection with confidence scoring and
                        region-level analysis.
                    </motion.p>

                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        custom={3}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link to="/detect" className="ui-btn ui-btn-lg">
                            <span>Start Detection</span>
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </Link>
                        <a href="#how-it-works" className="ui-btn" style={{ background: 'transparent' }}>
                            <span>Learn More</span>
                        </a>
                    </motion.div>

                    {/* Stats bar */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        custom={5}
                        className="mt-20 grid grid-cols-3 gap-4 max-w-lg mx-auto"
                    >
                        {[
                            { value: '99.2%', label: 'Accuracy' },
                            { value: '<3s', label: 'Analysis Time' },
                            { value: '50K+', label: 'Scans Processed' },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <div
                                    className="text-2xl font-bold"
                                    style={{
                                        background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                    }}
                                >
                                    {stat.value}
                                </div>
                                <div className="text-xs text-text-muted mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-24 px-4">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={fadeUp}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
                            How It Works
                        </h2>
                        <p className="text-text-secondary max-w-xl mx-auto">
                            Three simple steps to verify the authenticity of any media file.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {steps.map((step, i) => (
                            <motion.div
                                key={step.num}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeUp}
                                custom={i}
                                className="ui-card text-center"
                            >
                                <div
                                    className="text-4xl font-black mb-4"
                                    style={{
                                        background: 'linear-gradient(135deg, #a855f7, #3b82f6)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        opacity: 0.3,
                                    }}
                                >
                                    {step.num}
                                </div>
                                <h3 className="text-lg font-semibold text-text-primary mb-3">
                                    {step.title}
                                </h3>
                                <p className="text-sm text-text-secondary leading-relaxed">
                                    {step.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-24 px-4">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={fadeUp}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
                            Detection Capabilities
                        </h2>
                        <p className="text-text-secondary max-w-xl mx-auto">
                            State-of-the-art analysis powered by neural networks trained on
                            millions of deepfake samples.
                        </p>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f, i) => (
                            <motion.div
                                key={f.title}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeUp}
                                custom={i}
                                className="ui-card group"
                            >
                                <div
                                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                                    style={{
                                        background: 'rgba(168, 85, 247, 0.1)',
                                        color: '#a855f7',
                                    }}
                                >
                                    {f.icon}
                                </div>
                                <h3 className="text-base font-semibold text-text-primary mb-2">
                                    {f.title}
                                </h3>
                                <p className="text-sm text-text-secondary leading-relaxed">
                                    {f.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* AI Explanation */}
            <section className="py-24 px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={fadeUp}
                    >
                        <div className="ui-card ui-card-glow">
                            <h2 className="text-2xl font-bold text-text-primary mb-6">
                                Understanding Deepfake Detection
                            </h2>
                            <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
                                <p>
                                    Deepfakes are synthetic media created using generative
                                    adversarial networks (GANs) and other AI techniques. These
                                    models generate highly realistic faces, voices, and videos
                                    that are increasingly difficult to distinguish from real
                                    content.
                                </p>
                                <p>
                                    NeuroLens uses a multi-layer analysis pipeline that examines
                                    media at the pixel level, frequency domain, and statistical
                                    distribution level. The system detects subtle artifacts that
                                    are invisible to the human eye but consistently present in
                                    AI-generated content.
                                </p>
                                <p>
                                    Key detection signals include inconsistent noise patterns,
                                    unnatural frequency distributions, texture smoothing
                                    artifacts, and boundary irregularities around facial features.
                                    Our model has been trained on datasets including
                                    FaceForensics++, Celeb-DF, and DFDC.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer
                className="border-t py-12 px-4"
                style={{
                    borderColor: 'rgba(168, 85, 247, 0.1)',
                    background: 'rgba(5, 5, 8, 0.8)',
                }}
            >
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden"
                            >
                                <img src="/neurolens-logo.jpg" alt="NeuroLens" className="w-full h-full object-cover" />
                            </div>
                            <span className="font-bold text-text-primary">NeuroLens</span>
                        </div>
                        <p className="text-sm text-text-muted">
                            AI Deepfake Detection Platform. Built for media authenticity
                            verification.
                        </p>
                        <div className="flex gap-6">
                            <Link
                                to="/detect"
                                className="text-sm text-text-secondary hover:text-neon-purple transition-colors"
                            >
                                Detection
                            </Link>
                            <Link
                                to="/login"
                                className="text-sm text-text-secondary hover:text-neon-purple transition-colors"
                            >
                                Login
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;
