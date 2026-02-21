import { motion } from 'framer-motion';
import { BELIEVABILITY_LEVELS } from '../utils/prompts';

export default function BelievabilitySelector({ selected, onSelect }) {
    return (
        <div className="believability-section">
            <div className="believability-cards">
                {BELIEVABILITY_LEVELS.map((level, index) => (
                    <motion.div
                        key={level.id}
                        className={`believability-card ${level.id} ${selected === level.id ? 'selected' : ''}`}
                        onClick={() => onSelect(level.id)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08, duration: 0.3 }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        <motion.span
                            className="believability-emoji"
                            animate={selected === level.id ? { scale: [1, 1.2, 1] } : {}}
                            transition={{ duration: 0.4 }}
                        >
                            {level.emoji}
                        </motion.span>
                        <div className="believability-label">{level.label}</div>
                        <div className="believability-desc">{level.description}</div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
