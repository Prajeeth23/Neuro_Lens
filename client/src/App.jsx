import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import DetectionPage from './pages/DetectionPage';
import ResultPage from './pages/ResultPage';
import LoginPage from './pages/LoginPage';
import HistoryPage from './pages/HistoryPage';

function App() {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('deepguard_user');
        return stored ? JSON.parse(stored) : null;
    });

    const [token, setToken] = useState(() => {
        return localStorage.getItem('deepguard_token') || null;
    });

    const handleLogin = (userData, tokenStr) => {
        setUser(userData);
        setToken(tokenStr);
        localStorage.setItem('deepguard_user', JSON.stringify(userData));
        localStorage.setItem('deepguard_token', tokenStr);
    };

    const handleLogout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('deepguard_user');
        localStorage.removeItem('deepguard_token');
    };

    return (
        <Router>
            <div className="min-h-screen bg-cyber-dark relative">
                <div className="cyber-grid" />
                <Navbar user={user} onLogout={handleLogout} />
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/detect" element={<DetectionPage token={token} />} />
                    <Route
                        path="/result"
                        element={<ResultPage user={user} token={token} />}
                    />
                    <Route
                        path="/login"
                        element={<LoginPage onLogin={handleLogin} />}
                    />
                    <Route
                        path="/history"
                        element={<HistoryPage token={token} />}
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
