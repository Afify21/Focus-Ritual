interface GeminiResponse {
    response: {
        text: () => string;
    };
}

interface Gemini {
    generateContent: (prompt: string) => Promise<GeminiResponse>;
}

declare global {
    interface Window {
        gemini: Gemini;
    }
}

export { }; 