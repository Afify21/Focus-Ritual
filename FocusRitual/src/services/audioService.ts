const API_URL = 'http://localhost:5002/api/audio';

export interface Audio {
    _id: string;
    name: string;
    category: string;
    filePath: string;
    duration: number;
}

export const audioService = {
    async getAllAudio(): Promise<Audio[]> {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch audio files');
        return response.json();
    },

    async getAudioByCategory(category: string): Promise<Audio[]> {
        const response = await fetch(`${API_URL}/category/${category}`);
        if (!response.ok) throw new Error('Failed to fetch audio files by category');
        return response.json();
    },

    async getAudioById(id: string): Promise<Audio> {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Failed to fetch audio file');
        return response.json();
    },

    getAudioStreamUrl(id: string): string {
        return `${API_URL}/stream/${id}`;
    }
}; 