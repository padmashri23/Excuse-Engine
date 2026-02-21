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

export function buildPrompt(situation, believabilityLevel, customSituation = '', pastExcuses = []) {
    const levelInfo = BELIEVABILITY_LEVELS.find((l) => l.id === believabilityLevel);
    const sitInfo = SITUATIONS.find((s) => s.id === situation);
    const sitLabel = situation === 'custom' ? customSituation : sitInfo?.label;

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
        safe: "Keep it simple, realistic, and completely believable. Think 'everyday inconvenience' level. No drama, no creativity needed — just solid, boring truth-adjacent excuses.",
        risky: "Be creative and slightly dramatic but still plausible. Add specific details that make it convincing. Think 'unlikely but possible' scenarios. The excuse should be interesting enough to not be questioned further.",
        cinematic: "Go ALL OUT. Hollywood blockbuster level storytelling. The excuse should be so dramatic and detailed it's almost unbelievable but told with such confidence it might just work. Think action movie subplot. Be wildly creative and entertaining.",
    };

    return `You are the world's greatest excuse generator. Generate a complete excuse package for this situation.

SITUATION: ${sitLabel}
BELIEVABILITY LEVEL: ${levelInfo?.label} (${levelInfo?.emoji})
TONE: ${toneGuide[believabilityLevel]}

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
