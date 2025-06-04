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
            chatWindowBg: 'bg-white/90 dark:bg-slate-800/90',
            chatHeaderBg: 'bg-slate-700/90 dark:bg-slate-900/90',
            chatHeaderText: 'text-white',
            chatHeaderIcon: 'text-slate-300',
            chatHeaderIconHoverBg: 'hover:bg-slate-600/95 dark:hover:bg-slate-700/95',
            chatMessageListBg: 'bg-slate-50/80 dark:bg-slate-700/80',
            chatInputAreaBg: 'bg-slate-100/90 dark:bg-slate-800/90',
            chatInputBorder: 'border-slate-300 dark:border-slate-600',
            chatInputBg: 'bg-white/95 dark:bg-slate-700/95',
            chatInputText: 'text-slate-900 dark:text-slate-50',
            chatInputPlaceholderText: 'placeholder-slate-400 dark:placeholder-slate-500',
            chatSendButtonBg: 'bg-blue-600/90',
            chatSendButtonText: 'text-white',
            chatSendButtonHoverBg: 'hover:bg-blue-700/95',
            chatPromptButtonBg: 'bg-slate-200/80 dark:bg-slate-700/80',
            chatPromptButtonText: 'text-slate-700 dark:text-slate-200',
            chatPromptButtonHoverBg: 'hover:bg-slate-300/90 dark:hover:bg-slate-600/90',
            userMessageBg: 'bg-blue-600/90 dark:bg-blue-700/90',
            userMessageText: 'text-white',
            assistantMessageBg: 'bg-white/90 dark:bg-slate-600/90',
            assistantMessageText: 'text-slate-800 dark:text-slate-100',
            assistantMessageCodeBg: 'bg-slate-100/90 dark:bg-slate-700/90',
            assistantMessageCodeText: 'text-slate-800 dark:text-slate-50',
            scrollbarThumb: 'dark:scrollbar-thumb-slate-500/90 scrollbar-thumb-slate-400/90',
            scrollbarTrack: 'dark:scrollbar-track-slate-700/80 scrollbar-track-slate-300/80',
            messageTimestampText: 'opacity-70',
        }
    },
    {
        id: 'harry-potter',
        name: 'Wizard Academy',
        description: 'Immerse yourself in the magical world of Wizards',
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
        colors: {
            chatWindowBg: 'bg-[#F5ECCE]/90 dark:bg-[#1E222A]/90',
            chatHeaderBg: 'bg-[#7F0909]/90 dark:bg-[#5D0A0A]/90',
            chatHeaderText: 'text-[#FFD700]',
            chatHeaderIcon: 'text-[#FFD700]',
            chatHeaderIconHoverBg: 'hover:bg-[#A00C0C]/95 dark:hover:bg-[#4B0808]/95',
            chatMessageListBg: 'bg-[#E8D9B5]/80 dark:bg-[#2A2F37]/80',
            chatInputAreaBg: 'bg-[#F5ECCE]/90 dark:bg-[#1E222A]/90',
            chatInputBorder: 'border-[#B8860B] dark:border-[#DAA520]',
            chatInputBg: 'bg-[#FFF8DC]/95 dark:bg-[#3A3F47]/95',
            chatInputText: 'text-[#3A1F04] dark:text-[#EAEAEA]',
            chatInputPlaceholderText: 'placeholder-[#7A5C35] dark:placeholder-[#A0A0A0]',
            chatSendButtonBg: 'bg-[#3A1F04]/90 dark:bg-[#AE8625]/90',
            chatSendButtonText: 'text-[#FFD700]',
            chatSendButtonHoverBg: 'hover:bg-[#5C3A12]/95 dark:hover:bg-[#D4AF37]/95',
            chatPromptButtonBg: 'bg-[#B8860B]/80 dark:bg-[#DAA520]/80',
            chatPromptButtonText: 'text-[#3A1F04] dark:text-[#FFD700]',
            chatPromptButtonHoverBg: 'hover:bg-[#B8860B]/90 dark:hover:bg-[#DAA520]/90',
            userMessageBg: 'bg-[#0D6217]/90 dark:bg-[#1A472A]/90',
            userMessageText: 'text-[#EAEAEA]',
            assistantMessageBg: 'bg-[#0E1A40]/90 dark:bg-[#27374D]/90',
            assistantMessageText: 'text-[#EAEAEA]',
            assistantMessageCodeBg: 'bg-[#D3D3D3]/90 dark:bg-[#4A4F57]/90',
            assistantMessageCodeText: 'text-[#1E1E1E] dark:text-[#F0F0F0]',
            scrollbarThumb: 'scrollbar-thumb-[#B8860B]/90 dark:scrollbar-thumb-[#DAA520]/90',
            scrollbarTrack: 'scrollbar-track-[#F5ECCE]/80 dark:scrollbar-track-[#1E222A]/80',
            messageTimestampText: 'opacity-70',
        }
    },
    {
        id: 'attack-on-titans',
        name: 'Titan Slayer',
        description: 'Enter the world of the Survey Corps',
        backgrounds: {
            focus: [
                'https://res.cloudinary.com/dmouna8ru/video/upload/v1748656336/mylivewallpapers-com-Attack-on-Titans-QHD_fqhx3q.mp4',
                'https://res.cloudinary.com/dmouna8ru/video/upload/v1748656343/mylivewallpapers-com-Face-Off-Attack-on-Titans-4K_yhugus.mp4'
            ],
            break: 'https://res.cloudinary.com/dmouna8ru/video/upload/v1748656323/mylivewallpapers-com-See-You-Later-Eren-4K_jxifpf.mp4'
        },
        music: {
            focus: '',
            break: '',
        },
        colors: {
            chatWindowBg: 'bg-[#222831]/90 dark:bg-[#1a202c]/90',
            chatHeaderBg: 'bg-[#393E46]/90 dark:bg-[#2d3748]/90',
            chatHeaderText: 'text-[#00ADB5]',
            chatHeaderIcon: 'text-[#EEEEEE]',
            chatHeaderIconHoverBg: 'hover:bg-[#505761]/95 dark:hover:bg-[#4a5568]/95',
            chatMessageListBg: 'bg-[#393E46]/80 dark:bg-[#2d3748]/80',
            chatInputAreaBg: 'bg-[#222831]/90 dark:bg-[#1a202c]/90',
            chatInputBorder: 'border-[#00ADB5]',
            chatInputBg: 'bg-[#EEEEEE]/95 dark:bg-[#2d3748]/95',
            chatInputText: 'text-[#222831] dark:text-[#EEEEEE]',
            chatInputPlaceholderText: 'placeholder-[#505761] dark:placeholder-[#a0aec0]',
            chatSendButtonBg: 'bg-[#00ADB5]/90',
            chatSendButtonText: 'text-[#222831]',
            chatSendButtonHoverBg: 'hover:bg-[#00FFFF]/95',
            chatPromptButtonBg: 'bg-[#00ADB5]/80 dark:bg-[#00ADB5]/80',
            chatPromptButtonText: 'text-[#EEEEEE]',
            chatPromptButtonHoverBg: 'hover:bg-[#00ADB5]/90 dark:hover:bg-[#00ADB5]/90',
            userMessageBg: 'bg-[#FF2E63]/90',
            userMessageText: 'text-[#EEEEEE]',
            assistantMessageBg: 'bg-[#FFD369]/90',
            assistantMessageText: 'text-[#222831]',
            assistantMessageCodeBg: 'bg-[#EEEEEE]/90 dark:bg-[#4A4F57]/90',
            assistantMessageCodeText: 'text-[#222831] dark:text-[#F0F0F0]',
            scrollbarThumb: 'scrollbar-thumb-[#00ADB5]/90 dark:scrollbar-thumb-[#00ADB5]/90',
            scrollbarTrack: 'scrollbar-track-[#222831]/80 dark:scrollbar-track-[#1a202c]/80',
            messageTimestampText: 'opacity-70',
        }
    },
    {
        id: 'peaky-blinders',
        name: 'Birmingham Gangster',
        description: 'Enter the world of gangsters in Birmingham',
        backgrounds: {
            focus: 'https://res.cloudinary.com/dmouna8ru/video/upload/v1748705447/backgroundshelby2_ud1p1z.mov',
            break: 'https://res.cloudinary.com/dmouna8ru/video/upload/v1748705451/shelbyback1_ndljjh.mov'
        },
        music: {
            focus: 'https://res.cloudinary.com/dmouna8ru/video/upload/v1748703611/shelby_le0zot.mov',
            break: ''
        },
        colors: {
            chatWindowBg: 'bg-[#1A1A1A]/90 dark:bg-[#0A0A0A]/90',
            chatHeaderBg: 'bg-[#2C2C2C]/90 dark:bg-[#1C1C1C]/90',
            chatHeaderText: 'text-[#C4A777]',
            chatHeaderIcon: 'text-[#C4A777]',
            chatHeaderIconHoverBg: 'hover:bg-[#3C3C3C]/95 dark:hover:bg-[#2C2C2C]/95',
            chatMessageListBg: 'bg-[#2C2C2C]/80 dark:bg-[#1C1C1C]/80',
            chatInputAreaBg: 'bg-[#1A1A1A]/90 dark:bg-[#0A0A0A]/90',
            chatInputBorder: 'border-[#C4A777]',
            chatInputBg: 'bg-[#2C2C2C]/95 dark:bg-[#1C1C1C]/95',
            chatInputText: 'text-[#FFFFFF] dark:text-[#FFFFFF]',
            chatInputPlaceholderText: 'placeholder-[#808080] dark:placeholder-[#808080]',
            chatSendButtonBg: 'bg-[#C4A777]/90',
            chatSendButtonText: 'text-[#000000]',
            chatSendButtonHoverBg: 'hover:bg-[#D4B787]/95',
            chatPromptButtonBg: 'bg-[#C4A777]/80 dark:bg-[#C4A777]/80',
            chatPromptButtonText: 'text-[#FFFFFF]',
            chatPromptButtonHoverBg: 'hover:bg-[#C4A777]/90 dark:hover:bg-[#C4A777]/90',
            userMessageBg: 'bg-[#C4A777]/90 dark:bg-[#C4A777]/90',
            userMessageText: 'text-[#000000]',
            assistantMessageBg: 'bg-[#2C2C2C]/90 dark:bg-[#1C1C1C]/90',
            assistantMessageText: 'text-[#FFFFFF]',
            assistantMessageCodeBg: 'bg-[#3C3C3C]/90 dark:bg-[#2C2C2C]/90',
            assistantMessageCodeText: 'text-[#FFFFFF] dark:text-[#FFFFFF]',
            scrollbarThumb: 'scrollbar-thumb-[#C4A777]/90 dark:scrollbar-thumb-[#C4A777]/90',
            scrollbarTrack: 'scrollbar-track-[#1A1A1A]/80 dark:scrollbar-track-[#0A0A0A]/80',
            messageTimestampText: 'opacity-70',
        }
    }
    // Add more themes here as needed
]; 