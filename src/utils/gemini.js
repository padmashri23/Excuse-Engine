import { buildPrompt, buildRaterPrompt, buildCounterExcusePrompt, buildBattlePrompt, buildExcuseOfDayPrompt } from './prompts';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function callGroq(apiKey, prompt, temperature = 0.8) {
    const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            temperature,
            max_tokens: 1024,
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.error?.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
        throw new Error('No response from AI');
    }

    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    try {
        return JSON.parse(cleaned);
    } catch {
        throw new Error('Failed to parse AI response. Please try again.');
    }
}

export async function generateExcuse(apiKey, situation, believabilityLevel, customSituation = '', pastExcuses = [], audience = '', culturalTone = '') {
    const prompt = buildPrompt(situation, believabilityLevel, customSituation, pastExcuses, audience, culturalTone);
    const temperature = believabilityLevel === 'cinematic' ? 1.2 : believabilityLevel === 'risky' ? 0.9 : 0.6;
    return callGroq(apiKey, prompt, temperature);
}

export async function rateExcuse(apiKey, excuse) {
    const prompt = buildRaterPrompt(excuse);
    return callGroq(apiKey, prompt, 0.7);
}

export async function detectBS(apiKey, excuse) {
    const prompt = buildCounterExcusePrompt(excuse);
    return callGroq(apiKey, prompt, 0.7);
}

export async function generateBattle(apiKey, situation, level) {
    const prompt = buildBattlePrompt(situation, level);
    return callGroq(apiKey, prompt, 1.0);
}

export async function generateExcuseOfDay(apiKey) {
    const today = new Date();
    const seed = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    const prompt = buildExcuseOfDayPrompt(seed);
    return callGroq(apiKey, prompt, 0.9);
}
