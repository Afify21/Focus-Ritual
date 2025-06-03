interface HueLight {
    id: string;
    name: string;
    state: {
        on: boolean;
        brightness: number;
        hue: number;
        saturation: number;
        colorTemp?: number;
        effect?: 'none' | 'colorloop';
        transitionTime?: number;
    };
}

interface HueScene {
    id: string;
    name: string;
    lights: string[];
    states: { [lightId: string]: Partial<HueLight['state']> };
}

interface MoodPreset {
    name: string;
    lights: { [lightId: string]: Partial<HueLight['state']> };
    transitionTime: number;
}

class HueService {
    private bridgeIp: string;
    private username: string;
    private baseUrl: string;
    private scenes: HueScene[] = [];
    private moodPresets: { [key: string]: MoodPreset } = {
        calm: {
            name: 'Calm',
            lights: {
                '1': { brightness: 50, hue: 46920, saturation: 100, transitionTime: 30 },
                '2': { brightness: 30, hue: 46920, saturation: 80, transitionTime: 30 }
            },
            transitionTime: 30
        },
        focused: {
            name: 'Focused',
            lights: {
                '1': { brightness: 80, hue: 10000, saturation: 100, transitionTime: 20 },
                '2': { brightness: 60, hue: 10000, saturation: 80, transitionTime: 20 }
            },
            transitionTime: 20
        },
        energetic: {
            name: 'Energetic',
            lights: {
                '1': { brightness: 100, hue: 10000, saturation: 100, transitionTime: 10 },
                '2': { brightness: 80, hue: 10000, saturation: 100, transitionTime: 10 }
            },
            transitionTime: 10
        },
        excited: {
            name: 'Excited',
            lights: {
                '1': { brightness: 100, hue: 10000, saturation: 100, effect: 'colorloop', transitionTime: 5 },
                '2': { brightness: 100, hue: 10000, saturation: 100, effect: 'colorloop', transitionTime: 5 }
            },
            transitionTime: 5
        }
    };

    constructor(bridgeIp: string, username: string) {
        this.bridgeIp = bridgeIp;
        this.username = username;
        this.baseUrl = `http://${bridgeIp}/api/${username}`;
    }

    async discoverBridge(): Promise<string> {
        try {
            const response = await fetch('https://discovery.meethue.com/');
            const bridges = await response.json();
            if (bridges.length > 0) {
                return bridges[0].internalipaddress;
            }
            throw new Error('No Hue bridge found');
        } catch (error) {
            console.error('Error discovering Hue bridge:', error);
            throw error;
        }
    }

    async createUser(deviceName: string): Promise<string> {
        try {
            const response = await fetch(`http://${this.bridgeIp}/api`, {
                method: 'POST',
                body: JSON.stringify({ devicetype: deviceName }),
            });
            const data = await response.json();
            if (data[0].error) {
                throw new Error(data[0].error.description);
            }
            return data[0].success.username;
        } catch (error) {
            console.error('Error creating Hue user:', error);
            throw error;
        }
    }

    async getLights(): Promise<HueLight[]> {
        try {
            const response = await fetch(`${this.baseUrl}/lights`);
            const data = await response.json();
            return Object.entries(data).map(([id, light]: [string, any]) => ({
                id,
                name: light.name,
                state: light.state,
            }));
        } catch (error) {
            console.error('Error getting lights:', error);
            throw error;
        }
    }

    async setLightState(lightId: string, state: Partial<HueLight['state']>): Promise<void> {
        try {
            await fetch(`${this.baseUrl}/lights/${lightId}/state`, {
                method: 'PUT',
                body: JSON.stringify(state),
            });
        } catch (error) {
            console.error('Error setting light state:', error);
            throw error;
        }
    }

    async setMood(mood: string, intensity: number = 1): Promise<void> {
        const preset = this.moodPresets[mood.toLowerCase()];
        if (!preset) {
            throw new Error(`Mood preset '${mood}' not found`);
        }

        try {
            const lights = await this.getLights();
            const promises = lights.map(light => {
                const lightPreset = preset.lights[light.id];
                if (!lightPreset) return Promise.resolve();

                // Adjust brightness based on intensity
                const adjustedState = {
                    ...lightPreset,
                    brightness: Math.round(lightPreset.brightness! * intensity),
                };

                return this.setLightState(light.id, adjustedState);
            });

            await Promise.all(promises);
        } catch (error) {
            console.error('Error setting mood:', error);
            throw error;
        }
    }

    async createScene(name: string, states: { [lightId: string]: Partial<HueLight['state']> }): Promise<string> {
        try {
            const response = await fetch(`${this.baseUrl}/scenes`, {
                method: 'POST',
                body: JSON.stringify({
                    name,
                    lights: Object.keys(states),
                    states,
                }),
            });
            const data = await response.json();
            return data[0].success.id;
        } catch (error) {
            console.error('Error creating scene:', error);
            throw error;
        }
    }

    async getScenes(): Promise<HueScene[]> {
        try {
            const response = await fetch(`${this.baseUrl}/scenes`);
            const data = await response.json();
            this.scenes = Object.entries(data).map(([id, scene]: [string, any]) => ({
                id,
                name: scene.name,
                lights: scene.lights,
                states: scene.states,
            }));
            return this.scenes;
        } catch (error) {
            console.error('Error getting scenes:', error);
            throw error;
        }
    }

    async activateScene(sceneId: string): Promise<void> {
        try {
            const scene = this.scenes.find(s => s.id === sceneId);
            if (!scene) {
                throw new Error(`Scene '${sceneId}' not found`);
            }

            const promises = Object.entries(scene.states).map(([lightId, state]) =>
                this.setLightState(lightId, state)
            );

            await Promise.all(promises);
        } catch (error) {
            console.error('Error activating scene:', error);
            throw error;
        }
    }

    async setFocusMode(intensity: number = 1): Promise<void> {
        await this.setMood('focused', intensity);
    }

    async setBreakMode(intensity: number = 0.7): Promise<void> {
        await this.setMood('calm', intensity);
    }

    async setRelaxMode(intensity: number = 0.5): Promise<void> {
        await this.setMood('calm', intensity);
    }

    async setEnergeticMode(intensity: number = 1): Promise<void> {
        await this.setMood('energetic', intensity);
    }

    async setExcitedMode(intensity: number = 1): Promise<void> {
        await this.setMood('excited', intensity);
    }

    async createCustomMoodPreset(name: string, lights: { [lightId: string]: Partial<HueLight['state']> }, transitionTime: number = 20): Promise<void> {
        this.moodPresets[name.toLowerCase()] = {
            name,
            lights,
            transitionTime,
        };
    }

    async deleteMoodPreset(name: string): Promise<void> {
        delete this.moodPresets[name.toLowerCase()];
    }

    getAvailableMoodPresets(): string[] {
        return Object.keys(this.moodPresets);
    }
}

export default HueService; 