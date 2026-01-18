// Supported languages for TranslateGemma
// Based on docs/translategemma/LANGUAGES.md

export interface Language {
    name: string;
    code: string;
    nativeName?: string;
}

export const LANGUAGES: Language[] = [
    // Major World Languages
    { name: 'English', code: 'en', nativeName: 'English' },
    { name: 'Spanish', code: 'es', nativeName: 'Español' },
    { name: 'French', code: 'fr', nativeName: 'Français' },
    { name: 'German', code: 'de', nativeName: 'Deutsch' },
    { name: 'Portuguese', code: 'pt', nativeName: 'Português' },
    { name: 'Italian', code: 'it', nativeName: 'Italiano' },
    { name: 'Dutch', code: 'nl', nativeName: 'Nederlands' },
    { name: 'Russian', code: 'ru', nativeName: 'Русский' },
    { name: 'Polish', code: 'pl', nativeName: 'Polski' },
    { name: 'Ukrainian', code: 'uk', nativeName: 'Українська' },

    // Asian Languages
    { name: 'Chinese (Simplified)', code: 'zh-Hans', nativeName: '简体中文' },
    { name: 'Chinese (Traditional)', code: 'zh-Hant', nativeName: '繁體中文' },
    { name: 'Japanese', code: 'ja', nativeName: '日本語' },
    { name: 'Korean', code: 'ko', nativeName: '한국어' },
    { name: 'Vietnamese', code: 'vi', nativeName: 'Tiếng Việt' },
    { name: 'Thai', code: 'th', nativeName: 'ไทย' },
    { name: 'Indonesian', code: 'id', nativeName: 'Bahasa Indonesia' },
    { name: 'Malay', code: 'ms', nativeName: 'Bahasa Melayu' },
    { name: 'Filipino', code: 'fil', nativeName: 'Filipino' },
    { name: 'Hindi', code: 'hi', nativeName: 'हिन्दी' },
    { name: 'Bengali', code: 'bn', nativeName: 'বাংলা' },
    { name: 'Tamil', code: 'ta', nativeName: 'தமிழ்' },
    { name: 'Telugu', code: 'te', nativeName: 'తెలుగు' },
    { name: 'Urdu', code: 'ur', nativeName: 'اردو' },

    // Middle Eastern Languages
    { name: 'Arabic', code: 'ar', nativeName: 'العربية' },
    { name: 'Hebrew', code: 'he', nativeName: 'עברית' },
    { name: 'Turkish', code: 'tr', nativeName: 'Türkçe' },
    { name: 'Persian', code: 'fa', nativeName: 'فارسی' },

    // European Languages
    { name: 'Greek', code: 'el', nativeName: 'Ελληνικά' },
    { name: 'Czech', code: 'cs', nativeName: 'Čeština' },
    { name: 'Romanian', code: 'ro', nativeName: 'Română' },
    { name: 'Hungarian', code: 'hu', nativeName: 'Magyar' },
    { name: 'Swedish', code: 'sv', nativeName: 'Svenska' },
    { name: 'Danish', code: 'da', nativeName: 'Dansk' },
    { name: 'Finnish', code: 'fi', nativeName: 'Suomi' },
    { name: 'Norwegian', code: 'no', nativeName: 'Norsk' },

    // African Languages
    { name: 'Swahili', code: 'sw', nativeName: 'Kiswahili' },
    { name: 'Amharic', code: 'am', nativeName: 'አማርኛ' },

    // Other Languages
    { name: 'Bulgarian', code: 'bg', nativeName: 'Български' },
    { name: 'Croatian', code: 'hr', nativeName: 'Hrvatski' },
    { name: 'Serbian', code: 'sr', nativeName: 'Српски' },
    { name: 'Slovak', code: 'sk', nativeName: 'Slovenčina' },
    { name: 'Slovenian', code: 'sl', nativeName: 'Slovenščina' },
    { name: 'Estonian', code: 'et', nativeName: 'Eesti' },
    { name: 'Latvian', code: 'lv', nativeName: 'Latviešu' },
    { name: 'Lithuanian', code: 'lt', nativeName: 'Lietuvių' },
    { name: 'Catalan', code: 'ca', nativeName: 'Català' },
    { name: 'Galician', code: 'gl', nativeName: 'Galego' },
    { name: 'Basque', code: 'eu', nativeName: 'Euskara' },
    { name: 'Welsh', code: 'cy', nativeName: 'Cymraeg' },
    { name: 'Irish', code: 'ga', nativeName: 'Gaeilge' },
    { name: 'Icelandic', code: 'is', nativeName: 'Íslenska' },
    { name: 'Maltese', code: 'mt', nativeName: 'Malti' },
];

export function getLanguageByCode(code: string): Language | undefined {
    return LANGUAGES.find((lang) => lang.code === code);
}

export function getLanguagesBySearch(query: string): Language[] {
    const lowerQuery = query.toLowerCase();
    return LANGUAGES.filter(
        (lang) =>
            lang.name.toLowerCase().includes(lowerQuery) ||
            lang.code.toLowerCase().includes(lowerQuery) ||
            lang.nativeName?.toLowerCase().includes(lowerQuery)
    );
}
