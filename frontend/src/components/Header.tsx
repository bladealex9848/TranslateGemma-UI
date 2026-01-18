'use client';

import { useEffect, useState } from 'react';
import { Cog6ToothIcon, MoonIcon, SunIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { useAppStore } from '@/stores/appStore';
import { checkOllamaStatus } from '@/services/ollama';
import { UserMenu } from './AuthModal';

export default function Header() {
    const { theme, setTheme, ollamaConnected, setOllamaConnected, toggleSidebar } = useAppStore();
    const [mounted, setMounted] = useState(false);

    // Check Ollama status periodically
    useEffect(() => {
        setMounted(true);

        const checkStatus = async () => {
            const connected = await checkOllamaStatus();
            setOllamaConnected(connected);
        };

        checkStatus();
        const interval = setInterval(checkStatus, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, [setOllamaConnected]);

    // Apply theme
    useEffect(() => {
        if (!mounted) return;

        const isDark =
            theme === 'dark' ||
            (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

        document.documentElement.classList.toggle('dark', isDark);
    }, [theme, mounted]);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                {/* Left: Logo & Menu */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    >
                        <Bars3Icon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-lg">T</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-900 dark:text-white">TranslateGemma</h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Traducción privada con IA</p>
                        </div>
                    </div>
                </div>

                {/* Right: Status & Actions */}
                <div className="flex items-center gap-3">
                    {/* Ollama Status */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
                        <div
                            className={`w-2 h-2 rounded-full ${ollamaConnected ? 'bg-green-500' : 'bg-red-500'
                                }`}
                        />
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                            {ollamaConnected ? 'Ollama OK' : 'Desconectado'}
                        </span>
                    </div>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        {mounted && theme === 'dark' ? (
                            <SunIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        ) : (
                            <MoonIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        )}
                    </button>

                    {/* User Menu */}
                    <UserMenu />

                    {/* Settings */}
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <Cog6ToothIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    </button>
                </div>
            </div>
        </header>
    );
}
