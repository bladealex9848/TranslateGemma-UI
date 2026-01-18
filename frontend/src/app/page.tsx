import Header from '@/components/Header';
import TranslationPanel from '@/components/TranslationPanel';
import ModelSelector from '@/components/ModelSelector';
import ImageTranslation from '@/components/ImageTranslation';
import TranslationHistory from '@/components/TranslationHistory';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <Header />
      <TranslationHistory />

      <main className="py-8">
        {/* Hero Section */}
        <div className="text-center mb-8 px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Traducción Privada con IA
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Traduce entre 55 idiomas usando TranslateGemma de Google, ejecutándose 100% en tu infraestructura local.
          </p>
        </div>

        {/* Translation Panel */}
        <TranslationPanel />

        {/* Advanced Features */}
        <div className="max-w-7xl mx-auto px-4 mt-8 grid gap-4 lg:grid-cols-2">
          {/* Model Selector */}
          <details className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4" open>
            <summary className="cursor-pointer font-semibold text-gray-900 dark:text-white">
              ⚙️ Configuración de Modelo
            </summary>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <ModelSelector />
            </div>
          </details>

          {/* Image Translation */}
          <ImageTranslation />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>TranslateGemma-UI • Privacidad 100% Local • Powered by Ollama</p>
        <p className="mt-1">
          <a
            href="https://github.com/bladealex9848/TranslateGemma-UI"
            className="hover:text-blue-500 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          {' • '}
          <a
            href="/docs"
            className="hover:text-blue-500 transition-colors"
          >
            Documentación
          </a>
        </p>
      </footer>
    </div>
  );
}
