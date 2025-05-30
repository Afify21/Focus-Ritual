export interface Theme {
    id: string;
    name: string;
    description: string;
    backgrounds: {
        focus: string;  // path to focus background (mp4/gif/image)
        break: string;  // path to break background
    };
    music: {
        focus: string;  // path to focus music
        break: string;  // path to break music
    };
}

export const themes: Theme[] = [
    {
        id: 'default',
        name: 'Default',
        description: 'Default theme without music',
        backgrounds: {
            focus: '/themes/default/backgrounds/focus.jpg',
            break: '/themes/default/backgrounds/break.jpg'
        },
        music: {
            focus: '',
            break: ''
        }
    },
    {
        id: 'harry-potter',
        name: 'Harry Potter',
        description: 'Immerse yourself in the magical world of Hogwarts',
        backgrounds: {
            focus: '/themes/harry-potter/backgrounds/start.mp4',
            break: '/themes/harry-potter/backgrounds/ariel-j-night-hog-lib.jpg'
        },
        music: {
            focus: '/themes/harry-potter/music/focus.mp3',
            break: '/themes/harry-potter/music/break.mp3'
        }
    }
    // Add more themes here as needed
]; 