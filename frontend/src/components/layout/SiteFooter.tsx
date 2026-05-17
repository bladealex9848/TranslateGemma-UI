/**
 * Pie de página común a todas las vistas (landing, traductor, admin).
 * Incluye la alianza con Cédula 360 y datos de contacto.
 */
export default function SiteFooter() {
    return (
        <footer className="border-t border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-950/60">
            <div className="max-w-7xl mx-auto px-4 py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">T</span>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">
                            TranslateGemma
                        </span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                        Traducción privada con IA. 55 idiomas, ejecutado en
                        infraestructura propia con Ollama y TranslateGemma de
                        Google.
                    </p>
                </div>

                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                        Producto
                    </h3>
                    <ul className="space-y-2 text-gray-500 dark:text-gray-400">
                        <li>
                            <a href="/traducir" className="hover:text-blue-500 transition-colors">
                                Usar el traductor
                            </a>
                        </li>
                        <li>
                            <a href="/admin" className="hover:text-blue-500 transition-colors">
                                Administración
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://github.com/bladealex9848/TranslateGemma-UI"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-500 transition-colors"
                            >
                                Código fuente
                            </a>
                        </li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                        Contacto
                    </h3>
                    <ul className="space-y-2 text-gray-500 dark:text-gray-400">
                        <li>
                            <a
                                href="mailto:info@cedula360.tech"
                                className="hover:text-blue-500 transition-colors"
                            >
                                info@cedula360.tech
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://cedula360.tech"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-500 transition-colors"
                            >
                                cedula360.tech
                            </a>
                        </li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                        Alianza
                    </h3>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-medium text-xs">
                        En alianza con{' '}
                        <a
                            href="https://cedula360.tech"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                        >
                            Cédula 360
                        </a>
                    </span>
                    <p className="mt-3 text-xs text-gray-400">
                        Inicia sesión con tus credenciales de Cédula 360
                        (incluido su 2FA).
                    </p>
                </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 py-4 text-center text-xs text-gray-400">
                    © {new Date().getFullYear()} TranslateGemma · Privacidad
                    100% local · Powered by Ollama · en alianza con Cédula 360
                </div>
            </div>
        </footer>
    );
}
