import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, History, Zap, Key, Check, AlertCircle } from 'lucide-react';
import SituationPicker from './components/SituationPicker';
import BelievabilitySelector from './components/BelievabilitySelector';
import ExcuseResult from './components/ExcuseResult';
import ConsistencyTracker from './components/ConsistencyTracker';
import { generateExcuse } from './utils/gemini';
import { getApiKey, setApiKey, getExcuseHistory, saveExcuse } from './utils/storage';
import { SITUATIONS, BELIEVABILITY_LEVELS } from './utils/prompts';

const LOADING_MESSAGES = [
  'Crafting your perfect alibi...',
  'Consulting the excuse database...',
  'Calibrating believability levels...',
  'Manufacturing plausible deniability...',
  'Generating backup story arcs...',
  'Preparing follow-up defenses...',
  'Adding dramatic flair...',
  'Polishing your poker face guide...',
];

function App() {
  const [view, setView] = useState('generator'); // generator | tracker
  const [step, setStep] = useState(1); // 1: situation, 2: level, 3: result
  const [situation, setSituation] = useState(null);
  const [customSituation, setCustomSituation] = useState('');
  const [believability, setBelievability] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [apiKey, setApiKeyState] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);

  const DEFAULT_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

  // Init — use env key if available, otherwise check localStorage
  useEffect(() => {
    const key = DEFAULT_API_KEY || getApiKey();
    if (key) {
      setApiKey(key);
      setApiKeyState(key);
      setHasApiKey(true);
    }
    setHistory(getExcuseHistory());
  }, []);

  // Loading message rotation
  useEffect(() => {
    if (!loading) return;
    let i = 0;
    setLoadingMsg(LOADING_MESSAGES[0]);
    const interval = setInterval(() => {
      i = (i + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[i]);
    }, 2000);
    return () => clearInterval(interval);
  }, [loading]);

  const handleApiKeySubmit = () => {
    if (!apiKeyInput.trim()) return;
    setApiKey(apiKeyInput.trim());
    setApiKeyState(apiKeyInput.trim());
    setHasApiKey(true);
  };

  const handleSituationSelect = (id) => {
    setSituation(id);
    setError('');
  };

  const handleLevelSelect = (id) => {
    setBelievability(id);
    setError('');
  };

  const nextStep = () => {
    if (step === 1 && situation) {
      if (situation === 'custom' && !customSituation.trim()) {
        setError('Please describe your custom situation.');
        return;
      }
      setStep(2);
      setError('');
    } else if (step === 2 && believability) {
      handleGenerate();
    }
  };

  const prevStep = () => {
    if (step === 2) {
      setStep(1);
      setError('');
    } else if (step === 3) {
      setStep(2);
      setResult(null);
      setError('');
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setStep(3);

    try {
      const pastExcuses = getExcuseHistory();
      const data = await generateExcuse(apiKey, situation, believability, customSituation, pastExcuses);
      setResult(data);

      // Save to history
      const sitInfo = SITUATIONS.find((s) => s.id === situation);
      const saved = saveExcuse({
        situation,
        situationLabel: situation === 'custom' ? customSituation : sitInfo?.label,
        believabilityLevel: believability,
        excuse: data.excuse,
        backupStory: data.backupStory,
        riskRating: data.riskRating,
      });
      setHistory(getExcuseHistory());
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleNewExcuse = () => {
    setSituation(null);
    setCustomSituation('');
    setBelievability(null);
    setResult(null);
    setStep(1);
    setError('');
  };

  const handleRegenerate = () => {
    setResult(null);
    handleGenerate();
  };

  const refreshHistory = () => {
    setHistory(getExcuseHistory());
  };

  const canProceedStep1 = situation && (situation !== 'custom' || customSituation.trim());
  const canProceedStep2 = believability;

  return (
    <>
      {/* Background effects */}
      <div className="bg-effects" />
      <div className="bg-grid" />

      <div className="app-container">
        {/* Header */}
        <header className="header">
          <div className="header-logo" onClick={handleNewExcuse}>
            <div className="header-logo-icon">🎭</div>
            <h1>Excuse Engine</h1>
          </div>
          <nav className="header-nav">
            <button
              className={`nav-btn ${view === 'generator' ? 'active' : ''}`}
              onClick={() => setView('generator')}
            >
              <Sparkles size={16} />
              <span className="nav-label">Generate</span>
            </button>
            <button
              className={`nav-btn ${view === 'tracker' ? 'active' : ''}`}
              onClick={() => setView('tracker')}
            >
              <History size={16} />
              <span className="nav-label">Tracker</span>
              {history.length > 0 && <span className="badge">{history.length}</span>}
            </button>
          </nav>
        </header>

        {/* Main Content */}
        <main className="main-content">
          {/* API Key Setup */}
          {!hasApiKey ? (
            <motion.div
              className="api-key-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Key size={40} style={{ color: 'var(--accent-purple)', marginBottom: 16 }} />
              <h3>Set Up Your AI</h3>
              <p>
                Enter your free Google Gemini API key to power the excuse engine.
                <br />
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener"
                  style={{ color: 'var(--accent-purple)' }}
                >
                  Get a free key here →
                </a>
              </p>
              <div className="api-key-input-group">
                <input
                  type="password"
                  className="api-key-input"
                  placeholder="Paste your Gemini API key..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApiKeySubmit()}
                />
                <button className="api-key-submit" onClick={handleApiKeySubmit}>
                  <Check size={18} />
                </button>
              </div>
            </motion.div>
          ) : view === 'tracker' ? (
            /* Consistency Tracker View */
            <ConsistencyTracker history={history} onUpdate={refreshHistory} />
          ) : (
            /* Generator View */
            <>
              {/* Hero (only on step 1) */}
              {step === 1 && (
                <motion.div
                  className="hero"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="hero-badge">
                    <Zap size={12} />
                    AI-Powered Excuses
                  </div>
                  <h2>
                    Never Get Caught <br />
                    <span className="gradient-text">Without an Excuse</span>
                  </h2>
                  <p>
                    AI-generated excuses calibrated to believability. Complete with backup stories,
                    fake evidence, and follow-up defense.
                  </p>
                </motion.div>
              )}

              {/* Step Indicator */}
              {step <= 3 && (
                <div className="step-indicator">
                  <div className={`step-dot ${step >= 1 ? (step > 1 ? 'completed' : 'active') : ''}`}>
                    {step > 1 ? '✓' : '1'}
                  </div>
                  <div className={`step-line ${step > 1 ? 'completed' : ''}`} />
                  <div className={`step-dot ${step >= 2 ? (step > 2 ? 'completed' : 'active') : ''}`}>
                    {step > 2 ? '✓' : '2'}
                  </div>
                  <div className={`step-line ${step > 2 ? 'completed' : ''}`} />
                  <div className={`step-dot ${step >= 3 ? 'active' : ''}`}>3</div>
                </div>
              )}

              {/* Error */}
              {error && (
                <motion.div
                  className="error-message"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <AlertCircle size={18} />
                  {error}
                </motion.div>
              )}

              {/* Step 1: Situation Picker */}
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 style={{ marginBottom: 16, fontFamily: 'Space Grotesk', fontSize: 20, fontWeight: 600 }}>
                      What's the situation? 🤔
                    </h3>
                    <SituationPicker
                      selected={situation}
                      onSelect={handleSituationSelect}
                      customText={customSituation}
                      onCustomTextChange={setCustomSituation}
                    />
                    <div className="generate-btn-wrapper">
                      <motion.button
                        className="generate-btn"
                        onClick={nextStep}
                        disabled={!canProceedStep1}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        Next: Choose Believability →
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Believability */}
                {step === 2 && !loading && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 style={{ marginBottom: 16, fontFamily: 'Space Grotesk', fontSize: 20, fontWeight: 600 }}>
                      How bold are you feeling? 🎚️
                    </h3>
                    <BelievabilitySelector
                      selected={believability}
                      onSelect={handleLevelSelect}
                    />
                    <div className="generate-btn-wrapper" style={{ gap: 12, display: 'flex', justifyContent: 'center' }}>
                      <motion.button
                        className="generate-btn"
                        style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', boxShadow: 'none' }}
                        onClick={prevStep}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        ← Back
                      </motion.button>
                      <motion.button
                        className="generate-btn"
                        onClick={nextStep}
                        disabled={!canProceedStep2}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Sparkles size={18} />
                        Generate Excuse
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Loading */}
                {step === 3 && loading && (
                  <motion.div
                    key="loading"
                    className="loading-container"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="loading-spinner" />
                    <div className="loading-messages">
                      <p>{loadingMsg}</p>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Result */}
                {step === 3 && !loading && result && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <ExcuseResult
                      result={result}
                      situation={situation}
                      believabilityLevel={believability}
                      onNewExcuse={handleNewExcuse}
                      onRegenerate={handleRegenerate}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </main>
      </div>
    </>
  );
}

export default App;
