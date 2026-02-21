import { buildPrompt } from './prompts';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function generateExcuse(apiKey, situation, believabilityLevel, customSituation = '', pastExcuses = []) {
    const prompt = buildPrompt(situation, believabilityLevel, customSituation, pastExcuses);

    const temperature = believabilityLevel === 'cinematic' ? 1.2 : believabilityLevel === 'risky' ? 0.9 : 0.6;

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

    // Parse JSON from response (handle potential markdown fences)
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    try {
        return JSON.parse(cleaned);
    } catch {
        throw new Error('Failed to parse AI response. Please try again.');
    }
}
