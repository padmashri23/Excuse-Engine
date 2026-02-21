import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Clock, AlertTriangle } from 'lucide-react';
import { SITUATIONS, BELIEVABILITY_LEVELS } from '../utils/prompts';
import { deleteExcuse, clearHistory } from '../utils/storage';

export default function ConsistencyTracker({ history, onUpdate }) {
    const handleDelete = (id) => {
        deleteExcuse(id);
        onUpdate();
    };

    const handleClear = () => {
        if (window.confirm('Clear all excuse history? This cannot be undone.')) {
            clearHistory();
            onUpdate();
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    if (history.length === 0) {
        return (
            <motion.div
                className="tracker-empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <span className="tracker-empty-icon">📋</span>
                <h3>No Excuses Yet</h3>
                <p>Your excuse history will appear here so you don't contradict yourself.</p>
            </motion.div>
        );
    }

    return (
        <div>
            <div className="tracker-header">
                <h3>
                    <Clock size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                    Excuse Timeline ({history.length})
                </h3>
                <button className="tracker-clear-btn" onClick={handleClear}>
                    <Trash2 size={14} />
                    Clear All
                </button>
            </div>

            <div className="tracker-list">
                <AnimatePresence>
                    {history.map((item, index) => {
                        const sitInfo = SITUATIONS.find((s) => s.id === item.situation) || {};
                        const levelInfo = BELIEVABILITY_LEVELS.find((l) => l.id === item.believabilityLevel) || {};
                        const levelClass = item.believabilityLevel === 'safe' ? 'risk-low'
                            : item.believabilityLevel === 'risky' ? 'risk-medium' : 'risk-high';

                        return (
                            <motion.div
                                key={item.id}
                                className="tracker-item"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className="tracker-timeline">
                                    <div className="tracker-dot" style={{ background: levelInfo.color || '#8b5cf6' }} />
                                    {index < history.length - 1 && <div className="tracker-line" />}
                                </div>

                                <div className="tracker-content">
                                    <div className="tracker-content-header">
                                        <span className="tracker-situation">
                                            {sitInfo.emoji || '✨'} {item.situationLabel || sitInfo.label || 'Custom'}
                                        </span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span className="tracker-date">{formatDate(item.createdAt)}</span>
                                            <button
                                                className="tracker-delete-btn"
                                                onClick={() => handleDelete(item.id)}
                                                title="Delete"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="tracker-excuse">{item.excuse}</p>
                                    <span className={`tracker-level-badge ${levelClass}`}>
                                        {levelInfo.emoji} {levelInfo.label}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}
