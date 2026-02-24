export const SITUATIONS = [
    { id: 'late-work', label: 'Late to Work', emoji: '🏃', color: '#f97316' },
    { id: 'missed-deadline', label: 'Missed a Deadline', emoji: '📅', color: '#ef4444' },
    { id: 'skip-wedding', label: "Can't Attend Wedding", emoji: '💒', color: '#a855f7' },
    { id: 'forgot-anniversary', label: 'Forgot Anniversary', emoji: '💔', color: '#ec4899' },
    { id: 'skip-meeting', label: 'Skipping a Meeting', emoji: '💼', color: '#3b82f6' },
    { id: 'bail-plans', label: 'Bailing on Plans', emoji: '🏠', color: '#10b981' },
    { id: 'custom', label: 'Custom Situation', emoji: '✨', color: '#8b5cf6' },
];

export const BELIEVABILITY_LEVELS = [
    {
        id: 'safe',
        label: 'Safe',
        emoji: '😇',
        description: 'Boring but bulletproof. Your grandma would believe it.',
        color: '#22c55e',
        glow: 'rgba(34,197,94,0.3)',
    },
    {
        id: 'risky',
        label: 'Risky',
        emoji: '🤥',
        description: 'Creative & convincing. Might raise an eyebrow.',
        color: '#f59e0b',
        glow: 'rgba(245,158,11,0.3)',
    },
    {
        id: 'cinematic',
        label: 'Cinematic',
        emoji: '🎭',
        description: "Hollywood-level drama. You're basically a screenwriter now.",
        color: '#ef4444',
        glow: 'rgba(239,68,68,0.3)',
    },
];

export const AUDIENCES = [
    { id: 'boss', label: 'Boss / Manager', emoji: '👔' },
    { id: 'parent', label: 'Mom / Dad', emoji: '👪' },
    { id: 'friend', label: 'Friend', emoji: '🤝' },
    { id: 'partner', label: 'Partner / Spouse', emoji: '💑' },
    { id: 'teacher', label: 'Teacher / Professor', emoji: '📚' },
    { id: 'colleague', label: 'Colleague', emoji: '💼' },
];

export const CULTURAL_TONES = [
    { id: 'indian', label: 'Indian', emoji: '🇮🇳' },
    { id: 'british', label: 'British', emoji: '🇬🇧' },
    { id: 'american', label: 'American', emoji: '🇺🇸' },
    { id: 'australian', label: 'Australian', emoji: '🇦🇺' },
    { id: 'nigerian', label: 'Nigerian', emoji: '🇳🇬' },
    { id: 'japanese', label: 'Japanese', emoji: '🇯🇵' },
];

function getTimeContext() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
}

export function buildPrompt(situation, believabilityLevel, customSituation = '', pastExcuses = [], audience = '', culturalTone = '') {
    const levelInfo = BELIEVABILITY_LEVELS.find((l) => l.id === believabilityLevel);
    const sitInfo = SITUATIONS.find((s) => s.id === situation);
    const sitLabel = situation === 'custom' ? customSituation : sitInfo?.label;
    const timeContext = getTimeContext();

    let consistencyContext = '';
    if (pastExcuses.length > 0) {
        const recent = pastExcuses.slice(0, 5).map(
            (e) => `- ${e.situationLabel} (${new Date(e.createdAt).toLocaleDateString()}): "${e.excuse}"`
        );
        consistencyContext = `
IMPORTANT - CONSISTENCY CHECK:
The user has used these excuses recently. DO NOT contradict them. If there's a potential conflict, flag it in the "conflicts" field.
${recent.join('\n')}
`;
    }

    const toneGuide = {
        safe: "Keep it simple, realistic, and completely believable. Think 'everyday inconvenience' level. No drama, no creativity needed - just solid, boring truth-adjacent excuses.",
        risky: "Be creative and slightly dramatic but still plausible. Add specific details that make it convincing. Think 'unlikely but possible' scenarios. The excuse should be interesting enough to not be questioned further.",
        cinematic: "Go ALL OUT. Hollywood blockbuster level storytelling. The excuse should be so dramatic and detailed it's almost unbelievable but told with such confidence it might just work. Think action movie subplot. Be wildly creative and entertaining.",
    };

    const audienceInfo = audience ? AUDIENCES.find(a => a.id === audience) : null;
    const audienceContext = audienceInfo ? `\nAUDIENCE: This excuse is for ${audienceInfo.label}. Adjust formality, emotional tone, and detail level appropriately. For example, be more formal for a boss, more emotional for a parent, more casual for a friend.` : '';

    const culturalInfo = culturalTone ? CULTURAL_TONES.find(c => c.id === culturalTone) : null;
    const culturalContext = culturalInfo ? `\nCULTURAL TONE: Make this excuse feel natural for a ${culturalInfo.label} context. Use culturally relevant references, expressions, and communication style typical of ${culturalInfo.label} culture.` : '';

    const timeAwareness = `\nTIME CONTEXT: It is currently ${timeContext}. Make the excuse contextually appropriate for this time of day.`;

    return `You are the world's greatest excuse generator. Generate a complete excuse package for this situation.

SITUATION: ${sitLabel}
BELIEVABILITY LEVEL: ${levelInfo?.label} (${levelInfo?.emoji})
TONE: ${toneGuide[believabilityLevel]}
${audienceContext}${culturalContext}${timeAwareness}
${consistencyContext}

Respond ONLY with valid JSON (no markdown, no code fences) in this exact format:
{
  "excuse": "The main excuse (2-3 sentences, ready to say out loud)",
  "backupStory": "Detailed backup story with specific names, times, and details if someone asks for more info (3-4 sentences)",
  "fakeEvidence": ["List of 3 suggested fake evidence items - e.g. 'Screenshot a Google Maps traffic alert', 'Show a fake doctor's appointment confirmation'"],
  "followUpDefense": [
    {"question": "A likely follow-up question someone might ask", "answer": "Your prepared answer"},
    {"question": "Another likely follow-up question", "answer": "Your prepared answer"},
    {"question": "A third follow-up question", "answer": "Your prepared answer"}
  ],
  "deliveryTips": "How to deliver this excuse convincingly (tone of voice, body language, timing)",
  "riskRating": "A number from 1-10 on how risky this excuse is",
  "conflicts": "Any conflicts with past excuses, or 'none' if clear"
}`;
}

export function buildRaterPrompt(excuse) {
    return `You are an expert excuse analyst. Rate the following excuse for believability and provide detailed feedback.

EXCUSE: "${excuse}"

Respond ONLY with valid JSON (no markdown, no code fences):
{
  "score": 7,
  "verdict": "One-line verdict like 'Solid but needs more detail'",
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "improvementTips": "How to make this excuse more believable (2-3 sentences)",
  "wouldBelieve": "Who would believe this and who wouldn't (1-2 sentences)",
  "redFlags": ["Any red flags a skeptic would notice"]
}`;
}

export function buildCounterExcusePrompt(excuse) {
    return `You are a professional lie detector and excuse analyst. Someone gave the following excuse. Analyze it for BS indicators.

EXCUSE GIVEN: "${excuse}"

Respond ONLY with valid JSON (no markdown, no code fences):
{
  "bsScore": 7,
  "verdict": "Short verdict like 'Highly Suspicious' or 'Probably Legit'",
  "redFlags": ["Red flag 1", "Red flag 2", "Red flag 3"],
  "greenFlags": ["Thing that makes it sound legit 1"],
  "crossExamQuestions": ["Question to catch them in the lie 1", "Question 2", "Question 3"],
  "probabilityReal": "Percentage chance this is actually true (e.g. '35%')",
  "advice": "What you should do about this excuse (1-2 sentences)"
}`;
}

export function buildBattlePrompt(situation, level) {
    const levelInfo = BELIEVABILITY_LEVELS.find((l) => l.id === level);
    const sitInfo = SITUATIONS.find((s) => s.id === situation);

    return `You are hosting an Excuse Battle. Generate TWO competing excuses for the same situation, then judge which is better.

SITUATION: ${sitInfo?.label}
BELIEVABILITY LEVEL: ${levelInfo?.label}

Respond ONLY with valid JSON (no markdown, no code fences):
{
  "excuseA": {
    "excuse": "First excuse (2-3 sentences)",
    "strategy": "Brief description of the strategy used",
    "riskRating": 5
  },
  "excuseB": {
    "excuse": "Second excuse (2-3 sentences)",
    "strategy": "Brief description of the strategy used",
    "riskRating": 5
  },
  "winner": "A or B",
  "judgeReasoning": "Why the winner is better (2-3 sentences)",
  "audienceReaction": "How people would react to each excuse"
}`;
}

export function buildExcuseOfDayPrompt(seed) {
    return `Generate a fun, creative, universally relatable excuse. Use this seed for randomness: ${seed}. Make it humorous and shareable.

Respond ONLY with valid JSON (no markdown, no code fences):
{
  "excuse": "The excuse of the day (2-3 sentences, humorous and creative)",
  "situation": "What situation this excuse is for",
  "rating": "A fun rating like 'Chef's Kiss' or 'Use At Your Own Risk'",
  "emoji": "A single relevant emoji"
}`;
}
