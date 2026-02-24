import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Search, Eye, HelpCircle } from 'lucide-react';
import { detectBS } from '../utils/gemini';

export default function BSDetector({ apiKey }) {
    const [excuseText, setExcuseText] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const handleDetect = async () => {
        if (!excuseText.trim()) return;
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const data = await detectBS(apiKey, excuseText.trim());
            setResult(data);
        } catch (err) {
            setError(err.message || 'Detection failed');
        } finally {
            setLoading(false);
        }
    };

    const bsScore = result?.bsScore || 0;
    const bsClass = bsScore <= 3 ? 'bs-low' : bsScore <= 6 ? 'bs-medium' : 'bs-high';
    const bsEmoji = bsScore <= 3 ? '✅' : bsScore <= 6 ? '🤨' : '🚨';

    return (
        <div className="bs-container">
            <div className="bs-header">
                <h2 className="section-title">
                    <ShieldAlert size={28} />
                    BS Detector
                </h2>
                <p className="section-subtitle">Someone gave you an excuse? Let's see if it's legit or pure BS.</p>
            </div>

            <div className="rater-input-section">
                <textarea
                    className="rater-textarea"
                    placeholder="Paste the excuse someone gave you... e.g. 'I couldn't make it because my flight got cancelled due to a volcanic eruption'"
                    value={excuseText}
                    onChange={(e) => setExcuseText(e.target.value)}
                    rows={4}
                />
                <motion.button
                    className="generate-btn bs-detect-btn"
                    onClick={handleDetect}
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
                            <Eye size={18} />
                            Detect BS
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
                        className="bs-result"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* BS Score Meter */}
                        <div className={`bs-meter-container ${bsClass}`}>
                            <div className="bs-meter">
                                <div className="bs-meter-fill" style={{ width: `${bsScore * 10}%` }} />
                                <div className="bs-meter-labels">
                                    <span>Legit</span>
                                    <span>Sus</span>
                                    <span>Total BS</span>
                                </div>
                            </div>
                            <div className="bs-score-display">
                                <span className="bs-emoji">{bsEmoji}</span>
                                <span className="bs-score-num">{bsScore}/10</span>
                            </div>
                            <div className="bs-verdict">{result.verdict}</div>
                            <div className="bs-probability">
                                Probability it's real: <strong>{result.probabilityReal}</strong>
                            </div>
                        </div>

                        {/* Red Flags */}
                        <div className="excuse-card">
                            <div className="excuse-card-header">
                                <span className="excuse-card-icon">🚩</span>
                                <span className="excuse-card-title">Red Flags</span>
                            </div>
                            <div className="excuse-card-body">
                                <ul className="bs-flags-list">
                                    {(result.redFlags || []).map((flag, i) => (
                                        <li key={i} className="bs-flag-item red">
                                            <ShieldAlert size={14} />
                                            {flag}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Green Flags */}
                        {result.greenFlags && result.greenFlags.length > 0 && (
                            <div className="excuse-card">
                                <div className="excuse-card-header">
                                    <span className="excuse-card-icon">✅</span>
                                    <span className="excuse-card-title">Green Flags</span>
                                </div>
                                <div className="excuse-card-body">
                                    <ul className="bs-flags-list">
                                        {result.greenFlags.map((flag, i) => (
                                            <li key={i} className="bs-flag-item green">
                                                <Search size={14} />
                                                {flag}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Cross-Examination Questions */}
                        <div className="excuse-card">
                            <div className="excuse-card-header">
                                <span className="excuse-card-icon">🔍</span>
                                <span className="excuse-card-title">Cross-Examination Questions</span>
                            </div>
                            <div className="excuse-card-body">
                                <div className="bs-questions-list">
                                    {(result.crossExamQuestions || []).map((q, i) => (
                                        <div key={i} className="bs-question-item">
                                            <HelpCircle size={14} />
                                            <span>{q}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Advice */}
                        <div className="excuse-card">
                            <div className="excuse-card-header">
                                <span className="excuse-card-icon">💡</span>
                                <span className="excuse-card-title">Our Advice</span>
                            </div>
                            <div className="excuse-card-body">
                                <p className="excuse-text">{result.advice}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
