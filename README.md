# 🎭 Excuse Engine

AI-powered excuse generator that creates believable excuses complete with backup stories, fake evidence, and follow-up defense — so you never get caught off guard.

**Live Demo:** Built with React + Vite | Powered by Groq (LLaMA 3.3)

---

## ✨ Features

### Core Generator
- **Situation Picker** — Choose from 7 common excuse scenarios or write your own
- **Believability Levels** — Safe, Risky, or Nuclear intensity
- **Audience Selector** — Tailor excuses for Boss, Mom, Friend, Partner, Teacher, or Landlord
- **Cultural Tone** — Indian, British, American, Australian, or Gen-Z flavor
- **Time-Awareness** — Auto-detects morning/afternoon/evening for context-appropriate excuses

### 🎲 Excuse Roulette
Spin the animated wheel and let fate pick your situation + believability level. Auto-generates an excuse on landing.

### 📊 Excuse Rater
Paste any excuse and get an AI analysis — score out of 10, strengths, weaknesses, improvement tips, and red flags.

### ⚔️ Excuse Battle
Two AI-generated excuses go head-to-head for the same situation. Pick an intensity, watch them battle, and reveal the winner with judge's reasoning.

### 🛡️ BS Detector
Analyze any excuse for BS indicators — red flags, green flags, cross-examination questions, and a BS probability score.

### 📈 Stats Dashboard
Visual analytics of your excuse history — total count, most-used situations, believability distribution (donut charts), and risk breakdown.

### 🌟 Additional Features
- **Excuse of the Day** — Daily AI-generated excuse banner with localStorage caching
- **Favorites** — Star/bookmark your best excuses
- **Text-to-Speech** — Listen to excuses read aloud
- **Social Sharing** — Share directly to WhatsApp and Twitter/X
- **Dark/Light Theme** — Toggle between themes
- **Consistency Tracker** — Timeline of past excuses to avoid contradictions
- **Download Card** — Export excuses as shareable PNG cards

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A free [Groq API Key](https://console.groq.com/keys)

### Setup

```bash
# Clone the repo
git clone https://github.com/padmashri23/Excuse-Engine.git
cd Excuse-Engine

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open `http://localhost:5173` and enter your Groq API key when prompted.

### Environment Variable (Optional)

Create a `.env` file to skip the API key prompt:

```env
VITE_GROQ_API_KEY=your_groq_api_key_here
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite 7 | Build tool & dev server |
| Framer Motion | Animations & transitions |
| Lucide React | Icons |
| Groq API (LLaMA 3.3 70B) | AI excuse generation |
| html-to-image | PNG card export |
| localStorage | History, favorites, theme persistence |

---

## 📁 Project Structure

```
src/
├── App.jsx                    # Main app shell, navigation, generator flow
├── index.css                  # All styles (dark/light themes, components)
├── components/
│   ├── SituationPicker.jsx    # Situation selection grid
│   ├── BelievabilitySelector.jsx  # Risk level cards
│   ├── ExcuseResult.jsx       # Result display with actions
│   ├── ConsistencyTracker.jsx # History timeline
│   ├── ExcuseRoulette.jsx     # Animated roulette wheel
│   ├── ExcuseRater.jsx        # AI excuse rating
│   ├── ExcuseBattle.jsx       # Head-to-head battle mode
│   ├── BSDetector.jsx         # BS analysis tool
│   ├── StatsDashboard.jsx     # Visual analytics
│   └── ExcuseOfTheDay.jsx     # Daily excuse banner
└── utils/
    ├── gemini.js              # Groq API integration
    ├── prompts.js             # Prompt engineering & constants
    └── storage.js             # localStorage helpers
```

---

## 📝 License

MIT License — use it however you want. Just don't blame us if your excuse doesn't work. 😄
