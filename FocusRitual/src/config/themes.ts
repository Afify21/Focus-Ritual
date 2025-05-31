export interface Theme {
    id: string;
    name: string;
    description: string;
    backgrounds: {
        focus: string | string[];  // Allow focus background to be a string or an array of strings
        break: string;  // path to break background
    };
    music: {
        focus: string;  // path to focus music
        break: string;  // path to break music
    };
    colors: { // New section for UI colors
        // Chat window
        chatWindowBg: string;
        chatHeaderBg: string;
        chatHeaderText: string;
        chatHeaderIcon: string;
        chatHeaderIconHoverBg: string;
        chatMessageListBg: string;
        // Chat Input Area
        chatInputAreaBg: string;
        chatInputBorder: string;
        chatInputBg: string;
        chatInputText: string;
        chatInputPlaceholderText: string;
        chatSendButtonBg: string;
        chatSendButtonText: string;
        chatSendButtonHoverBg: string;
        chatPromptButtonBg: string;
        chatPromptButtonText: string;
        chatPromptButtonHoverBg: string;
        // Messages
        userMessageBg: string;
        userMessageText: string;
        assistantMessageBg: string;
        assistantMessageText: string;
        assistantMessageCodeBg: string; // For code blocks from assistant
        assistantMessageCodeText: string;
        // Scrollbar (if you want to theme it, though Tailwind might not directly support all scrollbar styling)
        scrollbarThumb: string;
        scrollbarTrack: string;
        // Icons within chat messages if any specific
        messageTimestampText: string;
    };
}

export const themes: Theme[] = [
    {
        id: 'default',
        name: 'Default',
        description: 'Default theme',
        backgrounds: {
            focus: '/themes/default/backgrounds/focus.jpg',
            break: '/themes/default/backgrounds/break.jpg'
        },
        music: {
            focus: '',
            break: ''
        },
        colors: {
            chatWindowBg: 'bg-white dark:bg-slate-800',
            chatHeaderBg: 'bg-slate-700 dark:bg-slate-900',
            chatHeaderText: 'text-white',
            chatHeaderIcon: 'text-slate-300',
            chatHeaderIconHoverBg: 'hover:bg-slate-600 dark:hover:bg-slate-700',
            chatMessageListBg: 'bg-slate-50 dark:bg-slate-700/50',
            chatInputAreaBg: 'bg-slate-100 dark:bg-slate-800',
            chatInputBorder: 'border-slate-300 dark:border-slate-600',
            chatInputBg: 'bg-white dark:bg-slate-700',
            chatInputText: 'text-slate-900 dark:text-slate-50',
            chatInputPlaceholderText: 'placeholder-slate-400 dark:placeholder-slate-500',
            chatSendButtonBg: 'bg-blue-600',
            chatSendButtonText: 'text-white',
            chatSendButtonHoverBg: 'hover:bg-blue-700',
            chatPromptButtonBg: 'bg-slate-200 dark:bg-slate-700',
            chatPromptButtonText: 'text-slate-700 dark:text-slate-200',
            chatPromptButtonHoverBg: 'hover:bg-slate-300 dark:hover:bg-slate-600',
            userMessageBg: 'bg-blue-600 dark:bg-blue-700',
            userMessageText: 'text-white',
            assistantMessageBg: 'bg-white dark:bg-slate-600',
            assistantMessageText: 'text-slate-800 dark:text-slate-100',
            assistantMessageCodeBg: 'bg-slate-100 dark:bg-slate-700',
            assistantMessageCodeText: 'text-slate-800 dark:text-slate-50',
            scrollbarThumb: 'dark:scrollbar-thumb-slate-500 scrollbar-thumb-slate-400',
            scrollbarTrack: 'dark:scrollbar-track-slate-700 scrollbar-track-slate-300',
            messageTimestampText: 'opacity-70', // General, can be overridden if needed by specific message colors
        }
    },
    {
        id: 'harry-potter',
        name: 'Harry Potter',
        description: 'Immerse yourself in the magical world of Hogwarts',
        backgrounds: {
            focus: [
                'https://res.cloudinary.com/dmouna8ru/video/upload/v1748661256/background1_luqfku.mp4',
                'https://res.cloudinary.com/dmouna8ru/video/upload/v1748661258/background2_ecc2xj.mp4'
            ],
            break: 'https://res.cloudinary.com/dmouna8ru/image/upload/v1748655258/ariel-j-night-hog-lib_cnunj1.jpg'
        },
        music: {
            focus: 'https://res.cloudinary.com/dmouna8ru/video/upload/v1748653360/Harry_study_music_trwccg.m4a',
            break: 'https://res.cloudinary.com/dmouna8ru/video/upload/v1748653127/sound1_d8ibyu.mov'
        },
        colors: { // Harry Potter theme colors for chat (example)
            chatWindowBg: 'bg-[#F5ECCE] dark:bg-[#1E222A]', // Parchment light / Dark common room
            chatHeaderBg: 'bg-[#7F0909] dark:bg-[#5D0A0A]', // Gryffindor red
            chatHeaderText: 'text-[#FFD700]', // Gold text
            chatHeaderIcon: 'text-[#FFD700]/80',
            chatHeaderIconHoverBg: 'hover:bg-[#A00C0C] dark:hover:bg-[#4B0808]',
            chatMessageListBg: 'bg-[#E8D9B5] dark:bg-[#2A2F37]', // Lighter parchment / Slightly lighter common room
            chatInputAreaBg: 'bg-[#F5ECCE] dark:bg-[#1E222A]',
            chatInputBorder: 'border-[#B8860B] dark:border-[#DAA520]', // DarkGoldenRod / Goldenrod
            chatInputBg: 'bg-[#FFF8DC] dark:bg-[#3A3F47]', // Cornsilk / Darker grey
            chatInputText: 'text-[#3A1F04] dark:text-[#EAEAEA]', // Dark brown / Light grey
            chatInputPlaceholderText: 'placeholder-[#7A5C35] dark:placeholder-[#A0A0A0]',
            chatSendButtonBg: 'bg-[#3A1F04] dark:bg-[#AE8625]', // Dark brown / Brass
            chatSendButtonText: 'text-[#FFD700]',
            chatSendButtonHoverBg: 'hover:bg-[#5C3A12] dark:hover:bg-[#D4AF37]',
            chatPromptButtonBg: 'bg-[#B8860B]/30 dark:bg-[#DAA520]/30',
            chatPromptButtonText: 'text-[#3A1F04] dark:text-[#FFD700]',
            chatPromptButtonHoverBg: 'hover:bg-[#B8860B]/50 dark:hover:bg-[#DAA520]/50',
            userMessageBg: 'bg-[#0D6217] dark:bg-[#1A472A]', // Slytherin green
            userMessageText: 'text-[#EAEAEA]',
            assistantMessageBg: 'bg-[#0E1A40] dark:bg-[#27374D]', // Ravenclaw blue
            assistantMessageText: 'text-[#EAEAEA]',
            assistantMessageCodeBg: 'bg-[#D3D3D3] dark:bg-[#4A4F57]', // LightGrey / DarkerGrey for code
            assistantMessageCodeText: 'text-[#1E1E1E] dark:text-[#F0F0F0]',
            scrollbarThumb: 'scrollbar-thumb-[#B8860B] dark:scrollbar-thumb-[#DAA520]',
            scrollbarTrack: 'scrollbar-track-[#F5ECCE] dark:scrollbar-track-[#1E222A]',
            messageTimestampText: 'opacity-70',
        }
    },
    {
        id: 'attack-on-titans',
        name: 'Attack on Titans',
        description: 'Enter the world of the Survey Corps',
        backgrounds: {
            focus: [
                'https://res.cloudinary.com/dmouna8ru/video/upload/v1748656336/mylivewallpapers-com-Attack-on-Titans-QHD_fqhx3q.mp4',
                'https://res.cloudinary.com/dmouna8ru/video/upload/v1748656343/mylivewallpapers-com-Face-Off-Attack-on-Titans-4K_yhugus.mp4'
            ] as any, // Use 'any' for now as the interface expects a single string
            break: 'https://res.cloudinary.com/dmouna8ru/video/upload/v1748656323/mylivewallpapers-com-See-You-Later-Eren-4K_jxifpf.mp4'
        },
        music: {
            focus: '',
            break: '',
        },
        colors: { // Example colors, adjust as needed
            chatWindowBg: 'bg-[#222831] dark:bg-[#1a202c]',
            chatHeaderBg: 'bg-[#393E46] dark:bg-[#2d3748]',
            chatHeaderText: 'text-[#00ADB5]',
            chatHeaderIcon: 'text-[#EEEEEE]',
            chatHeaderIconHoverBg: 'hover:bg-[#505761] dark:hover:bg-[#4a5568]',
            chatMessageListBg: 'bg-[#393E46]/50 dark:bg-[#2d3748]/50',
            chatInputAreaBg: 'bg-[#222831] dark:bg-[#1a202c]',
            chatInputBorder: 'border-[#00ADB5]',
            chatInputBg: 'bg-[#EEEEEE] dark:bg-[#2d3748]',
            chatInputText: 'text-[#222831] dark:text-[#EEEEEE]',
            chatInputPlaceholderText: 'placeholder-[#505761] dark:placeholder-[#a0aec0]',
            chatSendButtonBg: 'bg-[#00ADB5]',
            chatSendButtonText: 'text-[#222831]',
            chatSendButtonHoverBg: 'hover:bg-[#00FFFF]',
            chatPromptButtonBg: 'bg-[#00ADB5]/30 dark:bg-[#00ADB5]/20',
            chatPromptButtonText: 'text-[#EEEEEE]',
            chatPromptButtonHoverBg: 'hover:bg-[#00ADB5]/50 dark:hover:bg-[#00ADB5]/40',
            userMessageBg: 'bg-[#FF2E63]',
            userMessageText: 'text-[#EEEEEE]',
            assistantMessageBg: 'bg-[#FFD369]',
            assistantMessageText: 'text-[#222831]',
            assistantMessageCodeBg: 'bg-[#EEEEEE] dark:bg-[#4A4F57]',
            assistantMessageCodeText: 'text-[#222831] dark:text-[#F0F0F0]',
            scrollbarThumb: 'scrollbar-thumb-[#00ADB5] dark:scrollbar-thumb-[#00ADB5]',
            scrollbarTrack: 'scrollbar-track-[#222831] dark:scrollbar-track-[#1a202c]',
            messageTimestampText: 'opacity-70',
        }
    }
    // Add more themes here as needed
]; 