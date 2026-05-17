/**
 * Herramienta de traducción (ruta `/traducir`).
 * Antes vivía en `/`; ahora `/` es la landing pública.
 */
import Header from '@/components/Header';
import TranslationPanel from '@/components/TranslationPanel';
import ModelSelector from '@/components/ModelSelector';
import ImageTranslation from '@/components/ImageTranslation';
import TranslationHistory from '@/components/TranslationHistory';
import SiteFooter from '@/components/layout/SiteFooter';

export const metadata = {
    title: 'Traductor — TranslateGemma',
    description: 'Traduce entre 55 idiomas con TranslateGemma, 100% local.',
};

export default function TraducirPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
            <Header />
            <TranslationHistory />

            <main className="flex-1 py-8">
                <div className="text-center mb-8 px-4">
                    <nav className="text-xs text-gray-400 mb-4">
                        <a href="/" className="hover:text-blue-500">
                            Inicio
                        </a>{' '}
                        / <span className="text-gray-600 dark:text-gray-300">Traductor</span>
                    </nav>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                        Traducción Privada con IA
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Traduce entre 55 idiomas usando TranslateGemma de Google,
                        ejecutándose 100% en infraestructura local.
                    </p>
                </div>

                <TranslationPanel />

                <div className="max-w-7xl mx-auto px-4 mt-8 grid gap-4 lg:grid-cols-2">
                    <details
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4"
                        open
                    >
                        <summary className="cursor-pointer font-semibold text-gray-900 dark:text-white">
                            ⚙️ Configuración de Modelo
                        </summary>
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <ModelSelector />
                        </div>
                    </details>

                    <ImageTranslation />
                </div>
            </main>

            <SiteFooter />
        </div>
    );
}
