import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, History, Zap, Key, Check, AlertCircle, Dices, Search, Swords, ShieldAlert, BarChart3, Sun, Moon, Home } from 'lucide-react';
import SituationPicker from './components/SituationPicker';
import BelievabilitySelector from './components/BelievabilitySelector';
import ExcuseResult from './components/ExcuseResult';
import ConsistencyTracker from './components/ConsistencyTracker';
import ExcuseRoulette from './components/ExcuseRoulette';
import ExcuseRater from './components/ExcuseRater';
import ExcuseBattle from './components/ExcuseBattle';
import BSDetector from './components/BSDetector';
import StatsDashboard from './components/StatsDashboard';
import ExcuseOfTheDay from './components/ExcuseOfTheDay';
import { generateExcuse } from './utils/gemini';
import { getApiKey, setApiKey, getExcuseHistory, saveExcuse, getTheme, setTheme as setStoredTheme } from './utils/storage';
import { SITUATIONS, BELIEVABILITY_LEVELS, AUDIENCES, CULTURAL_TONES } from './utils/prompts';

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

const NAV_ITEMS = [
  { id: 'generator', label: 'Home', icon: Home },
  { id: 'tracker', label: 'Tracker', icon: History },
  { id: 'roulette', label: 'Roulette', icon: Dices },
  { id: 'rater', label: 'Rater', icon: Search },
  { id: 'battle', label: 'Battle', icon: Swords },
  { id: 'detector', label: 'BS', icon: ShieldAlert },
  { id: 'stats', label: 'Stats', icon: BarChart3 },
];

function App() {
  const [view, setView] = useState('generator');
  const [step, setStep] = useState(1);
  const [situation, setSituation] = useState(null);
  const [customSituation, setCustomSituation] = useState('');
  const [believability, setBelievability] = useState(null);
  const [audience, setAudience] = useState('');
  const [culturalTone, setCulturalTone] = useState('');
  const [result, setResult] = useState(null);
  const [lastSavedId, setLastSavedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [apiKey, setApiKeyState] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [theme, setThemeState] = useState('dark');

  const DEFAULT_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

  // Init
  useEffect(() => {
    const key = DEFAULT_API_KEY || getApiKey();
    if (key) {
      setApiKey(key);
      setApiKeyState(key);
      setHasApiKey(true);
    }
    setHistory(getExcuseHistory());

    // Theme
    const savedTheme = getTheme();
    setThemeState(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
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

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setThemeState(newTheme);
    setStoredTheme(newTheme);
  };

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
      const data = await generateExcuse(apiKey, situation, believability, customSituation, pastExcuses, audience, culturalTone);
      setResult(data);

      const sitInfo = SITUATIONS.find((s) => s.id === situation);
      const saved = saveExcuse({
        situation,
        situationLabel: situation === 'custom' ? customSituation : sitInfo?.label,
        believabilityLevel: believability,
        excuse: data.excuse,
        backupStory: data.backupStory,
        riskRating: data.riskRating,
      });
      setLastSavedId(saved.id);
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
    setLastSavedId(null);
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
          <div className="header-right">
            <nav className="header-nav">
              {NAV_ITEMS.map(item => (
                <button
                  key={item.id}
                  className={`nav-btn ${view === item.id ? 'active' : ''}`}
                  onClick={() => setView(item.id)}
                >
                  <item.icon size={16} />
                  <span className="nav-label">{item.label}</span>
                  {item.id === 'tracker' && history.length > 0 && (
                    <span className="badge">{history.length}</span>
                  )}
                </button>
              ))}
            </nav>
            <button className="theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
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
                Enter your free Groq API key to power the excuse engine.
                <br />
                <a
                  href="https://console.groq.com/keys"
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
                  placeholder="Paste your Groq API key..."
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
            <ConsistencyTracker history={history} onUpdate={refreshHistory} />
          ) : view === 'roulette' ? (
            <ExcuseRoulette apiKey={apiKey} onHistoryUpdate={refreshHistory} />
          ) : view === 'rater' ? (
            <ExcuseRater apiKey={apiKey} />
          ) : view === 'battle' ? (
            <ExcuseBattle apiKey={apiKey} />
          ) : view === 'detector' ? (
            <BSDetector apiKey={apiKey} />
          ) : view === 'stats' ? (
            <StatsDashboard history={history} />
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

              {/* Excuse of the Day */}
              {step === 1 && <ExcuseOfTheDay apiKey={apiKey} />}

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

                    {/* Audience Selector */}
                    <div className="option-selector">
                      <label className="option-label">👤 Who's it for? <span className="option-optional">(optional)</span></label>
                      <div className="option-chips">
                        {AUDIENCES.map(a => (
                          <button
                            key={a.id}
                            className={`option-chip ${audience === a.id ? 'selected' : ''}`}
                            onClick={() => setAudience(audience === a.id ? '' : a.id)}
                          >
                            {a.emoji} {a.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Cultural Tone Selector */}
                    <div className="option-selector">
                      <label className="option-label">🌍 Cultural tone <span className="option-optional">(optional)</span></label>
                      <div className="option-chips">
                        {CULTURAL_TONES.map(c => (
                          <button
                            key={c.id}
                            className={`option-chip ${culturalTone === c.id ? 'selected' : ''}`}
                            onClick={() => setCulturalTone(culturalTone === c.id ? '' : c.id)}
                          >
                            {c.emoji} {c.label}
                          </button>
                        ))}
                      </div>
                    </div>

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
                      excuseId={lastSavedId}
                      onFavoriteToggle={refreshHistory}
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
