import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Target, TrendingUp, Award, Clock, Flame } from 'lucide-react';
import { SITUATIONS, BELIEVABILITY_LEVELS } from '../utils/prompts';

export default function StatsDashboard({ history }) {
    const stats = useMemo(() => {
        if (history.length === 0) return null;

        // Total excuses
        const total = history.length;

        // Most used situation
        const sitCounts = {};
        history.forEach(h => {
            const key = h.situation || 'unknown';
            sitCounts[key] = (sitCounts[key] || 0) + 1;
        });
        const topSit = Object.entries(sitCounts).sort((a, b) => b[1] - a[1])[0];
        const topSitInfo = SITUATIONS.find(s => s.id === topSit[0]);

        // Most used level
        const levelCounts = {};
        BELIEVABILITY_LEVELS.forEach(l => { levelCounts[l.id] = 0; });
        history.forEach(h => {
            if (h.believabilityLevel) levelCounts[h.believabilityLevel] = (levelCounts[h.believabilityLevel] || 0) + 1;
        });

        // Average risk
        const risks = history.filter(h => h.riskRating).map(h => parseInt(h.riskRating) || 5);
        const avgRisk = risks.length > 0 ? (risks.reduce((a, b) => a + b, 0) / risks.length).toFixed(1) : 'N/A';

        // Streak (excuses in consecutive days)
        let streak = 1;
        const dates = [...new Set(history.map(h => new Date(h.createdAt).toDateString()))];
        for (let i = 1; i < dates.length; i++) {
            const prev = new Date(dates[i - 1]);
            const curr = new Date(dates[i]);
            const diff = Math.abs((prev - curr) / 86400000);
            if (diff <= 1) streak++;
            else break;
        }

        // Situation breakdown for chart
        const sitBreakdown = SITUATIONS.filter(s => s.id !== 'custom').map(s => ({
            ...s,
            count: sitCounts[s.id] || 0,
        }));
        const customCount = sitCounts['custom'] || 0;
        if (customCount > 0) {
            sitBreakdown.push({ id: 'custom', label: 'Custom', emoji: '✨', color: '#8b5cf6', count: customCount });
        }
        const maxCount = Math.max(...sitBreakdown.map(s => s.count), 1);

        // Risk distribution
        const riskDist = { low: 0, medium: 0, high: 0 };
        risks.forEach(r => {
            if (r <= 3) riskDist.low++;
            else if (r <= 6) riskDist.medium++;
            else riskDist.high++;
        });

        return {
            total, topSitInfo, topSitCount: topSit[1],
            levelCounts, avgRisk, streak,
            sitBreakdown, maxCount, riskDist,
        };
    }, [history]);

    if (!stats) {
        return (
            <motion.div className="tracker-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <span className="tracker-empty-icon">📊</span>
                <h3>No Stats Yet</h3>
                <p>Generate some excuses first, then check back for your stats!</p>
            </motion.div>
        );
    }

    return (
        <div className="stats-container">
            <div className="stats-header">
                <h2 className="section-title">
                    <BarChart3 size={28} />
                    Your Stats
                </h2>
                <p className="section-subtitle">Your excuse generation analytics at a glance</p>
            </div>

            {/* Stat Cards */}
            <div className="stats-grid">
                <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.0 }}>
                    <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.15)', color: 'var(--accent-purple)' }}>
                        <Target size={24} />
                    </div>
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-label">Total Excuses</div>
                </motion.div>

                <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="stat-icon" style={{ background: 'rgba(249,115,22,0.15)', color: 'var(--accent-orange)' }}>
                        <Award size={24} />
                    </div>
                    <div className="stat-value">{stats.topSitInfo?.emoji || '✨'}</div>
                    <div className="stat-label">Top: {stats.topSitInfo?.label || 'Custom'} ({stats.topSitCount}x)</div>
                </motion.div>

                <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--accent-red)' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-value">{stats.avgRisk}</div>
                    <div className="stat-label">Avg Risk Level</div>
                </motion.div>

                <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--accent-yellow)' }}>
                        <Flame size={24} />
                    </div>
                    <div className="stat-value">{stats.streak}</div>
                    <div className="stat-label">Day Streak 🔥</div>
                </motion.div>
            </div>

            {/* Situation Breakdown Chart */}
            <motion.div className="stats-chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <h3 className="stats-chart-title">Situation Breakdown</h3>
                <div className="stats-bar-chart">
                    {stats.sitBreakdown.map((sit, i) => (
                        <div key={sit.id} className="stats-bar-row">
                            <div className="stats-bar-label">
                                <span>{sit.emoji}</span>
                                <span>{sit.label}</span>
                            </div>
                            <div className="stats-bar-track">
                                <motion.div
                                    className="stats-bar-fill"
                                    style={{ background: sit.color }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(sit.count / stats.maxCount) * 100}%` }}
                                    transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                                />
                            </div>
                            <span className="stats-bar-count">{sit.count}</span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Believability Distribution */}
            <motion.div className="stats-chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <h3 className="stats-chart-title">Believability Preference</h3>
                <div className="stats-donut-row">
                    {BELIEVABILITY_LEVELS.map(level => (
                        <div key={level.id} className="stats-donut-item">
                            <div className="stats-donut-ring" style={{ '--donut-color': level.color }}>
                                <svg viewBox="0 0 80 80">
                                    <circle cx="40" cy="40" r="32" className="stats-donut-bg" />
                                    <circle
                                        cx="40" cy="40" r="32"
                                        className="stats-donut-fill"
                                        style={{
                                            stroke: level.color,
                                            strokeDasharray: `${((stats.levelCounts[level.id] || 0) / stats.total) * 201} 201`,
                                        }}
                                    />
                                </svg>
                                <span className="stats-donut-value">{stats.levelCounts[level.id] || 0}</span>
                            </div>
                            <span className="stats-donut-label">{level.emoji} {level.label}</span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Risk Distribution */}
            <motion.div className="stats-chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                <h3 className="stats-chart-title">Risk Distribution</h3>
                <div className="stats-risk-bars">
                    <div className="stats-risk-item">
                        <div className="stats-risk-label">😇 Low Risk</div>
                        <div className="stats-bar-track">
                            <motion.div className="stats-bar-fill" style={{ background: '#22c55e' }}
                                initial={{ width: 0 }}
                                animate={{ width: `${stats.riskDist.low > 0 ? (stats.riskDist.low / stats.total) * 100 : 0}%` }}
                                transition={{ delay: 0.8 }}
                            />
                        </div>
                        <span className="stats-bar-count">{stats.riskDist.low}</span>
                    </div>
                    <div className="stats-risk-item">
                        <div className="stats-risk-label">🤥 Medium Risk</div>
                        <div className="stats-bar-track">
                            <motion.div className="stats-bar-fill" style={{ background: '#f59e0b' }}
                                initial={{ width: 0 }}
                                animate={{ width: `${stats.riskDist.medium > 0 ? (stats.riskDist.medium / stats.total) * 100 : 0}%` }}
                                transition={{ delay: 0.9 }}
                            />
                        </div>
                        <span className="stats-bar-count">{stats.riskDist.medium}</span>
                    </div>
                    <div className="stats-risk-item">
                        <div className="stats-risk-label">🎭 High Risk</div>
                        <div className="stats-bar-track">
                            <motion.div className="stats-bar-fill" style={{ background: '#ef4444' }}
                                initial={{ width: 0 }}
                                animate={{ width: `${stats.riskDist.high > 0 ? (stats.riskDist.high / stats.total) * 100 : 0}%` }}
                                transition={{ delay: 1.0 }}
                            />
                        </div>
                        <span className="stats-bar-count">{stats.riskDist.high}</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
