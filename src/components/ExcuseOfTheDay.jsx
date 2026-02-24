import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, RefreshCw } from 'lucide-react';
import { generateExcuseOfDay } from '../utils/gemini';

export default function ExcuseOfTheDay({ apiKey }) {
    const [excuse, setExcuse] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Check cache first
        const cached = localStorage.getItem('excuse_of_day');
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                const today = new Date().toDateString();
                if (parsed.date === today) {
                    setExcuse(parsed.data);
                    return;
                }
            } catch { }
        }
        // Auto-fetch if we have an API key
        if (apiKey) fetchExcuseOfDay();
    }, [apiKey]);

    const fetchExcuseOfDay = async () => {
        setLoading(true);
        try {
            const data = await generateExcuseOfDay(apiKey);
            setExcuse(data);
            localStorage.setItem('excuse_of_day', JSON.stringify({
                date: new Date().toDateString(),
                data,
            }));
        } catch {
            // Silently fail - this is optional
        } finally {
            setLoading(false);
        }
    };

    if (!excuse && !loading) return null;

    return (
        <motion.div
            className="eotd-banner"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
        >
            <div className="eotd-header">
                <div className="eotd-title">
                    <Calendar size={16} />
                    <span>Excuse of the Day</span>
                </div>
                {excuse?.emoji && <span className="eotd-emoji">{excuse.emoji}</span>}
            </div>
            {loading ? (
                <div className="eotd-loading">
                    <RefreshCw size={14} className="spin-icon" />
                    <span>Loading today's excuse...</span>
                </div>
            ) : excuse ? (
                <>
                    <p className="eotd-excuse">{excuse.excuse}</p>
                    <div className="eotd-meta">
                        <span className="eotd-situation">📌 {excuse.situation}</span>
                        <span className="eotd-rating">⭐ {excuse.rating}</span>
                    </div>
                </>
            ) : null}
        </motion.div>
    );
}
