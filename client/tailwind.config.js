/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'cyber-dark': '#0a0a0f',
                'cyber-darker': '#050508',
                'cyber-surface': '#12121a',
                'cyber-border': '#1e1e2e',
                'neon-purple': '#a855f7',
                'neon-purple-dim': '#7c3aed',
                'neon-blue': '#3b82f6',
                'neon-cyan': '#06b6d4',
                'neon-pink': '#ec4899',
                'neon-green': '#10b981',
                'neon-red': '#ef4444',
                'text-primary': '#e2e8f0',
                'text-secondary': '#94a3b8',
                'text-muted': '#64748b',
            },
            boxShadow: {
                'neon-purple': '0 0 15px rgba(168, 85, 247, 0.4), 0 0 45px rgba(168, 85, 247, 0.15)',
                'neon-blue': '0 0 15px rgba(59, 130, 246, 0.4), 0 0 45px rgba(59, 130, 246, 0.15)',
                'neon-cyan': '0 0 15px rgba(6, 182, 212, 0.4), 0 0 45px rgba(6, 182, 212, 0.15)',
                'glow': '0 0 20px rgba(168, 85, 247, 0.3)',
                'glow-lg': '0 0 40px rgba(168, 85, 247, 0.4), 0 0 80px rgba(59, 130, 246, 0.2)',
            },
            backgroundImage: {
                'gradient-cyber': 'linear-gradient(135deg, #0a0a0f 0%, #12121a 50%, #0a0a0f 100%)',
                'gradient-neon': 'linear-gradient(135deg, #a855f7 0%, #3b82f6 50%, #06b6d4 100%)',
                'gradient-card': 'linear-gradient(145deg, rgba(18, 18, 26, 0.8) 0%, rgba(10, 10, 15, 0.9) 100%)',
            },
            fontFamily: {
                'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
                'sans': ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
                'scan-line': 'scanLine 3s linear infinite',
                'float': 'float 6s ease-in-out infinite',
                'grid-move': 'gridMove 20s linear infinite',
            },
            keyframes: {
                pulseGlow: {
                    '0%, 100%': { boxShadow: '0 0 15px rgba(168, 85, 247, 0.4)' },
                    '50%': { boxShadow: '0 0 30px rgba(168, 85, 247, 0.7), 0 0 60px rgba(59, 130, 246, 0.3)' },
                },
                scanLine: {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(100%)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                gridMove: {
                    '0%': { backgroundPosition: '0 0' },
                    '100%': { backgroundPosition: '50px 50px' },
                },
            },
        },
    },
    plugins: [],
};
