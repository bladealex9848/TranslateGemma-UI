// Ollama API service for TranslateGemma
// Connects directly to Ollama server for translation

const OLLAMA_HOST = process.env.NEXT_PUBLIC_OLLAMA_HOST || 'http://localhost:11434';

export interface TranslationRequest {
    text: string;
    sourceLang: string;
    sourceCode: string;
    targetLang: string;
    targetCode: string;
    model?: string;
}

export interface TranslationResponse {
    translatedText: string;
    model: string;
    totalDuration?: number;
    evalCount?: number;
}

export interface OllamaModel {
    name: string;
    size: number;
    modifiedAt: string;
}

/**
 * Build the TranslateGemma prompt
 */
function buildPrompt(req: TranslationRequest): string {
    return `You are a professional ${req.sourceLang} (${req.sourceCode}) to ${req.targetLang} (${req.targetCode}) translator. Your goal is to accurately convey the meaning and nuances of the original ${req.sourceLang} text while adhering to ${req.targetLang} grammar, vocabulary, and cultural sensitivities. Produce only the ${req.targetLang} translation, without any additional explanations or commentary. Please translate the following ${req.sourceLang} text into ${req.targetLang}:


${req.text}`;
}

/**
 * Check if Ollama server is available
 */
export async function checkOllamaStatus(): Promise<boolean> {
    try {
        const response = await fetch(`${OLLAMA_HOST}/api/tags`);
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Get available models from Ollama
 */
export async function getModels(): Promise<OllamaModel[]> {
    try {
        const response = await fetch(`${OLLAMA_HOST}/api/tags`);
        if (!response.ok) throw new Error('Failed to fetch models');
        const data = await response.json();
        return data.models || [];
    } catch (error) {
        console.error('Error fetching models:', error);
        return [];
    }
}

/**
 * Translate text using TranslateGemma (non-streaming)
 */
export async function translate(req: TranslationRequest): Promise<TranslationResponse> {
    const prompt = buildPrompt(req);
    const model = req.model || 'translategemma:latest';

    const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
            stream: false,
        }),
    });

    if (!response.ok) {
        throw new Error(`Translation failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
        translatedText: data.message?.content || '',
        model,
        totalDuration: data.total_duration,
        evalCount: data.eval_count,
    };
}

/**
 * Translate text with streaming response
 */
export async function translateStream(
    req: TranslationRequest,
    onToken: (token: string) => void,
    onComplete: (response: TranslationResponse) => void,
    onError: (error: Error) => void
): Promise<void> {
    const prompt = buildPrompt(req);
    const model = req.model || 'translategemma:latest';

    try {
        const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model,
                messages: [{ role: 'user', content: prompt }],
                stream: true,
            }),
        });

        if (!response.ok) {
            throw new Error(`Translation failed: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let fullText = '';
        let lastData: Record<string, unknown> = {};

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(Boolean);

            for (const line of lines) {
                try {
                    const json = JSON.parse(line);
                    if (json.message?.content) {
                        const token = json.message.content;
                        fullText += token;
                        onToken(token);
                    }
                    lastData = json;
                } catch {
                    // Ignore JSON parse errors for partial chunks
                }
            }
        }

        onComplete({
            translatedText: fullText,
            model,
            totalDuration: lastData.total_duration as number | undefined,
            evalCount: lastData.eval_count as number | undefined,
        });
    } catch (error) {
        onError(error instanceof Error ? error : new Error(String(error)));
    }
}
