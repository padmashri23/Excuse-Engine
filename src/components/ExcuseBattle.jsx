import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Sparkles, Trophy, Shield } from 'lucide-react';
import { SITUATIONS, BELIEVABILITY_LEVELS } from '../utils/prompts';
import { generateBattle } from '../utils/gemini';

const BATTLE_SITUATIONS = SITUATIONS.filter(s => s.id !== 'custom');

export default function ExcuseBattle({ apiKey }) {
    const [situation, setSituation] = useState(null);
    const [level, setLevel] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [revealed, setRevealed] = useState(false);

    const handleBattle = async () => {
        if (!situation || !level) return;
        setLoading(true);
        setError('');
        setResult(null);
        setRevealed(false);

        try {
            const data = await generateBattle(apiKey, situation, level);
            setResult(data);
        } catch (err) {
            setError(err.message || 'Battle failed');
        } finally {
            setLoading(false);
        }
    };

    const revealWinner = () => setRevealed(true);

    return (
        <div className="battle-container">
            <div className="battle-header">
                <h2 className="section-title">
                    <Swords size={28} />
                    Excuse Battle
                </h2>
                <p className="section-subtitle">Two AI-generated excuses enter. Only one survives judgment.</p>
            </div>

            {/* Situation Picker */}
            {!result && (
                <div className="battle-setup">
                    <h3 className="battle-setup-title">Pick the Battlefield</h3>
                    <div className="battle-situation-grid">
                        {BATTLE_SITUATIONS.map(sit => (
                            <motion.div
                                key={sit.id}
                                className={`battle-sit-card ${situation === sit.id ? 'selected' : ''}`}
                                style={{ '--card-accent-color': sit.color }}
                                onClick={() => setSituation(sit.id)}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                <span>{sit.emoji}</span>
                                <span>{sit.label}</span>
                            </motion.div>
                        ))}
                    </div>

                    <h3 className="battle-setup-title" style={{ marginTop: 24 }}>Choose Intensity</h3>
                    <div className="battle-level-grid">
                        {BELIEVABILITY_LEVELS.map(l => (
                            <motion.div
                                key={l.id}
                                className={`battle-level-card ${level === l.id ? 'selected' : ''}`}
                                style={{ '--level-color': l.color }}
                                onClick={() => setLevel(l.id)}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                <span>{l.emoji}</span>
                                <span>{l.label}</span>
                            </motion.div>
                        ))}
                    </div>

                    <div className="roulette-action">
                        <motion.button
                            className="generate-btn"
                            onClick={handleBattle}
                            disabled={!situation || !level || loading}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            {loading ? (
                                <>
                                    <div className="loading-spinner-sm" />
                                    Generating Battle...
                                </>
                            ) : (
                                <>
                                    <Swords size={18} />
                                    Start Battle!
                                </>
                            )}
                        </motion.button>
                    </div>
                </div>
            )}

            {error && (
                <motion.div className="error-message" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {error}
                </motion.div>
            )}

            {/* Battle Result */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        className="battle-arena"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="battle-cards">
                            {/* Excuse A */}
                            <motion.div
                                className={`battle-excuse-card ${revealed && result.winner === 'A' ? 'winner' : ''} ${revealed && result.winner !== 'A' ? 'loser' : ''}`}
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="battle-card-label">
                                    <Shield size={16} />
                                    Excuse A
                                    {revealed && result.winner === 'A' && <Trophy size={16} className="trophy-icon" />}
                                </div>
                                <p className="battle-excuse-text">{result.excuseA.excuse}</p>
                                <div className="battle-meta">
                                    <span className="battle-strategy">Strategy: {result.excuseA.strategy}</span>
                                    <span className={`risk-badge ${result.excuseA.riskRating <= 3 ? 'risk-low' : result.excuseA.riskRating <= 6 ? 'risk-medium' : 'risk-high'}`}>
                                        Risk: {result.excuseA.riskRating}/10
                                    </span>
                                </div>
                            </motion.div>

                            {/* VS Divider */}
                            <motion.div
                                className="battle-vs"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.4, type: 'spring' }}
                            >
                                VS
                            </motion.div>

                            {/* Excuse B */}
                            <motion.div
                                className={`battle-excuse-card ${revealed && result.winner === 'B' ? 'winner' : ''} ${revealed && result.winner !== 'B' ? 'loser' : ''}`}
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <div className="battle-card-label">
                                    <Shield size={16} />
                                    Excuse B
                                    {revealed && result.winner === 'B' && <Trophy size={16} className="trophy-icon" />}
                                </div>
                                <p className="battle-excuse-text">{result.excuseB.excuse}</p>
                                <div className="battle-meta">
                                    <span className="battle-strategy">Strategy: {result.excuseB.strategy}</span>
                                    <span className={`risk-badge ${result.excuseB.riskRating <= 3 ? 'risk-low' : result.excuseB.riskRating <= 6 ? 'risk-medium' : 'risk-high'}`}>
                                        Risk: {result.excuseB.riskRating}/10
                                    </span>
                                </div>
                            </motion.div>
                        </div>

                        {/* Reveal / Judge */}
                        {!revealed ? (
                            <div className="roulette-action">
                                <motion.button
                                    className="generate-btn battle-reveal-btn"
                                    onClick={revealWinner}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Trophy size={18} />
                                    Reveal Winner!
                                </motion.button>
                            </div>
                        ) : (
                            <motion.div
                                className="battle-judgment"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="battle-winner-banner">
                                    🏆 Excuse {result.winner} Wins!
                                </div>
                                <div className="excuse-card">
                                    <div className="excuse-card-header">
                                        <span className="excuse-card-icon">⚖️</span>
                                        <span className="excuse-card-title">Judge's Reasoning</span>
                                    </div>
                                    <div className="excuse-card-body">
                                        <p className="excuse-text">{result.judgeReasoning}</p>
                                    </div>
                                </div>
                                <div className="excuse-card">
                                    <div className="excuse-card-header">
                                        <span className="excuse-card-icon">👥</span>
                                        <span className="excuse-card-title">Audience Reaction</span>
                                    </div>
                                    <div className="excuse-card-body">
                                        <p className="excuse-text">{result.audienceReaction}</p>
                                    </div>
                                </div>
                                <div className="roulette-action">
                                    <motion.button
                                        className="generate-btn"
                                        onClick={() => { setResult(null); setRevealed(false); }}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                    >
                                        <Swords size={18} />
                                        New Battle
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
