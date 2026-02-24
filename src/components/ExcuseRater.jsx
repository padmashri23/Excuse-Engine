import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { rateExcuse } from '../utils/gemini';

export default function ExcuseRater({ apiKey }) {
    const [excuseText, setExcuseText] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleRate = async () => {
        if (!excuseText.trim()) return;
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const data = await rateExcuse(apiKey, excuseText.trim());
            setResult(data);
        } catch (err) {
            setError(err.message || 'Failed to rate excuse');
        } finally {
            setLoading(false);
        }
    };

    const score = result?.score || 0;
    const scoreClass = score <= 3 ? 'score-low' : score <= 6 ? 'score-medium' : 'score-high';

    return (
        <div className="rater-container">
            <div className="rater-header">
                <h2 className="section-title">
                    <Search size={28} />
                    Excuse Rater
                </h2>
                <p className="section-subtitle">Paste any excuse and our AI will rate its believability</p>
            </div>

            <div className="rater-input-section">
                <textarea
                    className="rater-textarea"
                    placeholder="Paste an excuse here... e.g. 'Sorry I'm late, my dog ate my car keys and I had to wait for him to... return them.'"
                    value={excuseText}
                    onChange={(e) => setExcuseText(e.target.value)}
                    rows={4}
                />
                <motion.button
                    className="generate-btn"
                    onClick={handleRate}
                    disabled={!excuseText.trim() || loading}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                >
                    {loading ? (
                        <>
                            <div className="loading-spinner-sm" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <Star size={18} />
                            Rate This Excuse
                        </>
                    )}
                </motion.button>
            </div>

            {error && (
                <motion.div className="error-message" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {error}
                </motion.div>
            )}

            <AnimatePresence>
                {result && (
                    <motion.div
                        className="rater-result"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Score Gauge */}
                        <div className={`rater-score-container ${scoreClass}`}>
                            <div className="rater-score-ring">
                                <svg viewBox="0 0 120 120" className="rater-score-svg">
                                    <circle cx="60" cy="60" r="52" className="rater-score-bg-circle" />
                                    <circle
                                        cx="60" cy="60" r="52"
                                        className="rater-score-circle"
                                        strokeDasharray={`${(score / 10) * 327} 327`}
                                    />
                                </svg>
                                <div className="rater-score-value">{score}</div>
                                <div className="rater-score-label">/ 10</div>
                            </div>
                            <div className="rater-verdict">{result.verdict}</div>
                        </div>

                        {/* Strengths & Weaknesses */}
                        <div className="rater-analysis-grid">
                            <div className="rater-analysis-card strengths">
                                <h4><TrendingUp size={16} /> Strengths</h4>
                                <ul>
                                    {(result.strengths || []).map((s, i) => (
                                        <li key={i}><CheckCircle size={14} /> {s}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="rater-analysis-card weaknesses">
                                <h4><TrendingDown size={16} /> Weaknesses</h4>
                                <ul>
                                    {(result.weaknesses || []).map((w, i) => (
                                        <li key={i}><AlertTriangle size={14} /> {w}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Red Flags */}
                        {result.redFlags && result.redFlags.length > 0 && (
                            <div className="rater-flags">
                                <h4>🚩 Red Flags</h4>
                                <div className="rater-flags-list">
                                    {result.redFlags.map((f, i) => (
                                        <span key={i} className="rater-flag-tag">{f}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tips */}
                        <div className="excuse-card">
                            <div className="excuse-card-header">
                                <span className="excuse-card-icon">💡</span>
                                <span className="excuse-card-title">Improvement Tips</span>
                            </div>
                            <div className="excuse-card-body">
                                <p className="excuse-text">{result.improvementTips}</p>
                            </div>
                        </div>

                        <div className="excuse-card">
                            <div className="excuse-card-header">
                                <span className="excuse-card-icon">👥</span>
                                <span className="excuse-card-title">Who Would Believe It?</span>
                            </div>
                            <div className="excuse-card-body">
                                <p className="excuse-text">{result.wouldBelieve}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
