// Main application state store using Zustand
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppState {
    // UI State
    theme: 'light' | 'dark' | 'system';
    sidebarOpen: boolean;

    // Translation State
    sourceText: string;
    translatedText: string;
    sourceLang: { name: string; code: string };
    targetLang: { name: string; code: string };
    isTranslating: boolean;

    // Model State
    selectedModel: string;
    ollamaConnected: boolean;

    // Actions
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
    toggleSidebar: () => void;
    setSourceText: (text: string) => void;
    setTranslatedText: (text: string) => void;
    setSourceLang: (lang: { name: string; code: string }) => void;
    setTargetLang: (lang: { name: string; code: string }) => void;
    swapLanguages: () => void;
    setIsTranslating: (value: boolean) => void;
    setSelectedModel: (model: string) => void;
    setOllamaConnected: (connected: boolean) => void;
    clearTranslation: () => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            // Initial State
            theme: 'system',
            sidebarOpen: false,
            sourceText: '',
            translatedText: '',
            sourceLang: { name: 'English', code: 'en' },
            targetLang: { name: 'Spanish', code: 'es' },
            isTranslating: false,
            selectedModel: 'translategemma:latest',
            ollamaConnected: false,

            // Actions
            setTheme: (theme) => set({ theme }),
            toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
            setSourceText: (sourceText) => set({ sourceText }),
            setTranslatedText: (translatedText) => set({ translatedText }),
            setSourceLang: (sourceLang) => set({ sourceLang }),
            setTargetLang: (targetLang) => set({ targetLang }),
            swapLanguages: () => {
                const { sourceLang, targetLang, sourceText, translatedText } = get();
                set({
                    sourceLang: targetLang,
                    targetLang: sourceLang,
                    sourceText: translatedText,
                    translatedText: sourceText,
                });
            },
            setIsTranslating: (isTranslating) => set({ isTranslating }),
            setSelectedModel: (selectedModel) => set({ selectedModel }),
            setOllamaConnected: (ollamaConnected) => set({ ollamaConnected }),
            clearTranslation: () => set({ sourceText: '', translatedText: '' }),
        }),
        {
            name: 'translategemma-storage',
            partialize: (state) => ({
                theme: state.theme,
                sourceLang: state.sourceLang,
                targetLang: state.targetLang,
                selectedModel: state.selectedModel,
            }),
        }
    )
);
