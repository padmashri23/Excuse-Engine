import { useState } from 'react';
import { motion } from 'framer-motion';
import { SITUATIONS } from '../utils/prompts';

export default function SituationPicker({ selected, onSelect, customText, onCustomTextChange }) {
    return (
        <div>
            <div className="situation-grid">
                {SITUATIONS.map((sit, index) => (
                    <motion.div
                        key={sit.id}
                        className={`situation-card ${selected === sit.id ? 'selected' : ''}`}
                        style={{ '--card-accent-color': sit.color }}
                        onClick={() => onSelect(sit.id)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <span className="situation-emoji">{sit.emoji}</span>
                        <span className="situation-label">{sit.label}</span>
                    </motion.div>
                ))}
            </div>

            {selected === 'custom' && (
                <motion.div
                    className="custom-input-wrapper"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                >
                    <input
                        type="text"
                        className="custom-input"
                        placeholder="Describe your situation... e.g. 'Need to leave a boring party early'"
                        value={customText}
                        onChange={(e) => onCustomTextChange(e.target.value)}
                        autoFocus
                    />
                </motion.div>
            )}
        </div>
    );
}
