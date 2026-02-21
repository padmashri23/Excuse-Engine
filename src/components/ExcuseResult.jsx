import { useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Download, RotateCcw, Share2, AlertTriangle, Sparkles, BookOpen, Shield, MessageCircle, Lightbulb } from 'lucide-react';
import { toPng } from 'html-to-image';
import { BELIEVABILITY_LEVELS, SITUATIONS } from '../utils/prompts';

export default function ExcuseResult({ result, situation, believabilityLevel, onNewExcuse, onRegenerate }) {
    const shareRef = useRef(null);
    const [copied, setCopied] = useState(false);
    const [toast, setToast] = useState('');

    const sitInfo = SITUATIONS.find((s) => s.id === situation);
    const levelInfo = BELIEVABILITY_LEVELS.find((l) => l.id === believabilityLevel);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 2000);
    };

    const copyExcuse = useCallback(() => {
        navigator.clipboard.writeText(result.excuse).then(() => {
            setCopied(true);
            showToast('✅ Excuse copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        });
    }, [result.excuse]);

    const downloadCard = useCallback(async () => {
        if (!shareRef.current) return;
        try {
            const dataUrl = await toPng(shareRef.current, { pixelRatio: 2 });
            const link = document.createElement('a');
            link.download = 'excuse-engine-card.png';
            link.href = dataUrl;
            link.click();
            showToast('📸 Card downloaded!');
        } catch (err) {
            showToast('❌ Download failed');
        }
    }, []);

    const riskNum = parseInt(result.riskRating) || 5;
    const riskClass = riskNum <= 3 ? 'risk-low' : riskNum <= 6 ? 'risk-medium' : 'risk-high';
    const riskLabel = riskNum <= 3 ? 'Low Risk' : riskNum <= 6 ? 'Medium Risk' : 'High Risk';

    return (
        <div className="excuse-result">
            {/* Header */}
            <div className="result-header">
                <div>
                    <motion.h2
                        className="result-title"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        Your Excuse Package {levelInfo?.emoji}
                    </motion.h2>
                    <span className={`risk-badge ${riskClass}`}>
                        <Shield size={12} />
                        {riskLabel} ({riskNum}/10)
                    </span>
                </div>
                <div className="result-actions">
                    <button className="result-action-btn" onClick={copyExcuse}>
                        <Copy size={14} />
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button className="result-action-btn" onClick={downloadCard}>
                        <Download size={14} />
                        Save Card
                    </button>
                    <button className="result-action-btn" onClick={onRegenerate}>
                        <RotateCcw size={14} />
                        Regenerate
                    </button>
                    <button className="result-action-btn primary" onClick={onNewExcuse}>
                        <Sparkles size={14} />
                        New Excuse
                    </button>
                </div>
            </div>

            {/* Conflict Alert */}
            {result.conflicts && result.conflicts !== 'none' && result.conflicts.toLowerCase() !== 'none' && (
                <motion.div
                    className="conflict-alert"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <AlertTriangle size={18} />
                    <div>
                        <strong>Consistency Warning:</strong> {result.conflicts}
                    </div>
                </motion.div>
            )}

            {/* Excuse Cards */}
            <div className="excuse-cards">
                {/* Main Excuse */}
                <motion.div
                    className="excuse-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="excuse-card-header">
                        <span className="excuse-card-icon">💬</span>
                        <span className="excuse-card-title">The Excuse</span>
                    </div>
                    <div className="excuse-card-body">
                        <p className="excuse-text">{result.excuse}</p>
                    </div>
                </motion.div>

                {/* Backup Story */}
                <motion.div
                    className="excuse-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="excuse-card-header">
                        <span className="excuse-card-icon">📖</span>
                        <span className="excuse-card-title">Backup Story</span>
                    </div>
                    <div className="excuse-card-body">
                        <p className="excuse-text">{result.backupStory}</p>
                    </div>
                </motion.div>

                {/* Fake Evidence */}
                <motion.div
                    className="excuse-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="excuse-card-header">
                        <span className="excuse-card-icon">🕵️</span>
                        <span className="excuse-card-title">Evidence Suggestions</span>
                    </div>
                    <div className="excuse-card-body">
                        <ul className="evidence-list">
                            {(result.fakeEvidence || []).map((item, i) => (
                                <li key={i} className="evidence-item">
                                    <span className="evidence-number">{i + 1}</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>

                {/* Follow-up Defense */}
                <motion.div
                    className="excuse-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="excuse-card-header">
                        <span className="excuse-card-icon">❓</span>
                        <span className="excuse-card-title">Follow-up Defense</span>
                    </div>
                    <div className="excuse-card-body">
                        <div className="followup-list">
                            {(result.followUpDefense || []).map((item, i) => (
                                <div key={i} className="followup-item">
                                    <div className="followup-question">Q: {item.question}</div>
                                    <div className="followup-answer">A: {item.answer}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Delivery Tips */}
                {result.deliveryTips && (
                    <motion.div
                        className="excuse-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="excuse-card-header">
                            <span className="excuse-card-icon">🎭</span>
                            <span className="excuse-card-title">Delivery Tips</span>
                        </div>
                        <div className="excuse-card-body">
                            <div className="delivery-tips">{result.deliveryTips}</div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Share Card (for download) */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                <div ref={shareRef} className="share-card" style={{ width: 500, padding: 32 }}>
                    <div className="share-card-brand">
                        <span className="share-card-brand-icon">🎭</span>
                        <span className="share-card-brand-name">Excuse Engine</span>
                    </div>
                    <div className="share-card-excuse">{result.excuse}</div>
                    <div className="share-card-meta">
                        <span className={`share-card-tag ${riskClass}`}>
                            {levelInfo?.emoji} {levelInfo?.label}
                        </span>
                        <span>Risk: {riskNum}/10</span>
                        <span>{sitInfo?.emoji} {sitInfo?.label}</span>
                    </div>
                </div>
            </div>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        className="toast"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                    >
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
