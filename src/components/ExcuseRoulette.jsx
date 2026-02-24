import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dices, Sparkles, RotateCcw } from 'lucide-react';
import { SITUATIONS, BELIEVABILITY_LEVELS } from '../utils/prompts';
import { generateExcuse } from '../utils/gemini';
import { saveExcuse, getExcuseHistory } from '../utils/storage';

const WHEEL_ITEMS = SITUATIONS.filter(s => s.id !== 'custom');
const SEGMENT_ANGLE = 360 / WHEEL_ITEMS.length;

export default function ExcuseRoulette({ apiKey, onHistoryUpdate }) {
    const [spinning, setSpinning] = useState(false);
    const [selectedSit, setSelectedSit] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const totalRotationRef = useRef(0);
    const [displayRotation, setDisplayRotation] = useState(0);

    const spin = () => {
        if (spinning || loading) return;
        setSpinning(true);
        setResult(null);
        setError('');

        // Pick random winners
        const winnerIdx = Math.floor(Math.random() * WHEEL_ITEMS.length);
        const winnerLevel = BELIEVABILITY_LEVELS[Math.floor(Math.random() * BELIEVABILITY_LEVELS.length)];

        // Calculate rotation: multiple full turns + land on the winner segment
        // The pointer is at top (0°). We need the winning segment's center to align with 0°.
        // Segment i starts at i * SEGMENT_ANGLE, center is at i * SEGMENT_ANGLE + SEGMENT_ANGLE/2
        const segmentCenter = winnerIdx * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
        // We need to rotate the wheel so this segment aligns with the top (360 - segmentCenter)
        const landingAngle = 360 - segmentCenter;
        const fullSpins = 5 + Math.floor(Math.random() * 3); // 5-7 full rotations
        const newTotal = totalRotationRef.current + (fullSpins * 360) + landingAngle - (totalRotationRef.current % 360);

        totalRotationRef.current = newTotal;
        setDisplayRotation(newTotal);

        // After animation settles, reveal the result
        setTimeout(() => {
            setSelectedSit(WHEEL_ITEMS[winnerIdx]);
            setSelectedLevel(winnerLevel);
            setSpinning(false);
            generateFromSelection(WHEEL_ITEMS[winnerIdx], winnerLevel);
        }, 3500);
    };

    const generateFromSelection = async (sit, level) => {
        setLoading(true);
        try {
            const pastExcuses = getExcuseHistory();
            const data = await generateExcuse(apiKey, sit.id, level.id, '', pastExcuses);
            setResult(data);
            saveExcuse({
                situation: sit.id,
                situationLabel: sit.label,
                believabilityLevel: level.id,
                excuse: data.excuse,
                backupStory: data.backupStory,
                riskRating: data.riskRating,
            });
            if (onHistoryUpdate) onHistoryUpdate();
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    // Build colored segments using conic gradient
    const segmentColors = WHEEL_ITEMS.map((item, i) => {
        const hue = (i * 360) / WHEEL_ITEMS.length;
        const start = (i * 100) / WHEEL_ITEMS.length;
        const end = ((i + 1) * 100) / WHEEL_ITEMS.length;
        return `hsla(${hue}, 60%, ${i % 2 === 0 ? '18' : '22'}%, 0.9) ${start}% ${end}%`;
    });
    const conicGradient = `conic-gradient(from 0deg, ${segmentColors.join(', ')})`;

    return (
        <div className="roulette-container">
            <div className="roulette-header">
                <h2 className="section-title">
                    <Dices size={28} />
                    Excuse Roulette
                </h2>
                <p className="section-subtitle">Feeling lucky? Spin the wheel and let fate choose your excuse!</p>
            </div>

            {/* Wheel */}
            <div className="roulette-wheel-wrapper">
                <div className="roulette-pointer-top">▼</div>
                <motion.div
                    className="roulette-wheel"
                    animate={{ rotate: displayRotation }}
                    transition={{ duration: 3.5, ease: [0.2, 0.8, 0.3, 1] }}
                    style={{ background: conicGradient }}
                >
                    {WHEEL_ITEMS.map((item, i) => {
                        const angle = SEGMENT_ANGLE * i + SEGMENT_ANGLE / 2;
                        const radius = 95;
                        const rad = (angle - 90) * (Math.PI / 180);
                        const x = 50 + radius / 2.6 * Math.cos(rad);
                        const y = 50 + radius / 2.6 * Math.sin(rad);
                        return (
                            <span
                                key={item.id}
                                className="roulette-emoji"
                                style={{
                                    position: 'absolute',
                                    left: `${x}%`,
                                    top: `${y}%`,
                                    transform: `translate(-50%, -50%) rotate(-${displayRotation}deg)`,
                                    fontSize: 22,
                                    transition: 'transform 3.5s cubic-bezier(0.2, 0.8, 0.3, 1)',
                                    zIndex: 2,
                                }}
                                title={item.label}
                            >
                                {item.emoji}
                            </span>
                        );
                    })}
                    {/* Segment divider lines */}
                    {WHEEL_ITEMS.map((_, i) => (
                        <div
                            key={`line-${i}`}
                            className="roulette-divider"
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                width: '50%',
                                height: '1px',
                                background: 'rgba(255,255,255,0.1)',
                                transformOrigin: '0 0',
                                transform: `rotate(${SEGMENT_ANGLE * i}deg)`,
                            }}
                        />
                    ))}
                    <div className="roulette-center">🎰</div>
                </motion.div>
            </div>

            {/* Selected Items */}
            <AnimatePresence>
                {selectedSit && selectedLevel && !spinning && (
                    <motion.div
                        className="roulette-selection"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="roulette-selected-item">
                            <span className="roulette-selected-emoji">{selectedSit.emoji}</span>
                            <span>{selectedSit.label}</span>
                        </div>
                        <span className="roulette-x">×</span>
                        <div className="roulette-selected-item" style={{ borderColor: selectedLevel.color }}>
                            <span className="roulette-selected-emoji">{selectedLevel.emoji}</span>
                            <span>{selectedLevel.label}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Spin Button */}
            <div className="roulette-action">
                <motion.button
                    className="generate-btn roulette-btn"
                    onClick={spin}
                    disabled={spinning || loading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {spinning ? (
                        <>
                            <RotateCcw size={18} className="spin-icon" />
                            Spinning...
                        </>
                    ) : loading ? (
                        <>
                            <Sparkles size={18} />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Dices size={18} />
                            {result ? 'Spin Again!' : 'Spin the Wheel!'}
                        </>
                    )}
                </motion.button>
            </div>

            {/* Error */}
            {error && (
                <motion.div className="error-message" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {error}
                </motion.div>
            )}

            {/* Result */}
            <AnimatePresence>
                {result && !loading && (
                    <motion.div
                        className="roulette-result"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="excuse-card">
                            <div className="excuse-card-header">
                                <span className="excuse-card-icon">🎲</span>
                                <span className="excuse-card-title">Your Random Excuse</span>
                            </div>
                            <div className="excuse-card-body">
                                <p className="excuse-text">{result.excuse}</p>
                            </div>
                        </div>
                        <div className="excuse-card">
                            <div className="excuse-card-header">
                                <span className="excuse-card-icon">📖</span>
                                <span className="excuse-card-title">Backup Story</span>
                            </div>
                            <div className="excuse-card-body">
                                <p className="excuse-text">{result.backupStory}</p>
                            </div>
                        </div>
                        <div className="excuse-card">
                            <div className="excuse-card-header">
                                <span className="excuse-card-icon">🎭</span>
                                <span className="excuse-card-title">Delivery Tips</span>
                            </div>
                            <div className="excuse-card-body">
                                <div className="delivery-tips">{result.deliveryTips}</div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
