/**
 * Landing pública de TranslateGemma (ruta `/`).
 *
 * Estructura de rutas:
 *   /          → esta landing (pública)
 *   /traducir  → la herramienta de traducción
 *   /admin     → panel de administración (login + RBAC)
 *
 * El traductor sigue 100% usable; aquí sólo presentamos el proyecto
 * con CTAs claros.
 */
import {
    ShieldCheckIcon,
    BoltIcon,
    GlobeAltIcon,
    LockClosedIcon,
    PhotoIcon,
    ArrowRightIcon,
} from '@heroicons/react/24/outline';
import MarketingHeader from '@/components/layout/MarketingHeader';
import SiteFooter from '@/components/layout/SiteFooter';

export const metadata = {
    title: 'TranslateGemma — Traducción privada con IA',
    description:
        'Traduce entre 55 idiomas con TranslateGemma de Google, 100% en infraestructura propia. En alianza con Cédula 360.',
};

const FEATURES = [
    {
        icon: LockClosedIcon,
        title: 'Privacidad total',
        desc: 'El modelo corre en infraestructura propia con Ollama. Tu texto nunca sale a servicios de terceros.',
    },
    {
        icon: GlobeAltIcon,
        title: '55 idiomas',
        desc: 'Traducción bidireccional de alta calidad con el modelo TranslateGemma de Google.',
    },
    {
        icon: BoltIcon,
        title: 'Streaming en vivo',
        desc: 'La traducción aparece token a token, sin esperas. Atajo Ctrl/Cmd + Enter.',
    },
    {
        icon: PhotoIcon,
        title: 'Traducción de imágenes',
        desc: 'Sube una imagen y extrae + traduce el texto que contiene.',
    },
    {
        icon: ShieldCheckIcon,
        title: 'Acceso seguro',
        desc: 'Login propio o "Continuar con Cédula 360" (con su 2FA). Historial por usuario.',
    },
    {
        icon: ShieldCheckIcon,
        title: 'Roles (RBAC)',
        desc: 'Panel de administración con perfil, sesiones y gestión de usuarios para administradores.',
    },
];

export default function LandingPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
            <MarketingHeader />

            <main className="flex-1">
                {/* Hero */}
                <section className="relative overflow-hidden">
                    <div
                        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.12),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.18),transparent_55%)]"
                        aria-hidden
                    />
                    <div className="max-w-5xl mx-auto px-4 py-20 sm:py-28 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium mb-6">
                            <ShieldCheckIcon className="h-3.5 w-3.5" />
                            En alianza con Cédula 360
                        </span>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                            Traducción privada{' '}
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                con IA
                            </span>
                        </h1>
                        <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                            TranslateGemma traduce entre 55 idiomas usando el
                            modelo de Google ejecutado 100 % en infraestructura
                            propia con Ollama. Sin enviar tus datos a terceros.
                        </p>
                        <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
                            <a
                                href="/traducir"
                                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
                            >
                                Usar el traductor
                                <ArrowRightIcon className="h-5 w-5" />
                            </a>
                            <a
                                href="/admin"
                                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border-2 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-xl hover:border-blue-500 dark:hover:border-blue-400 hover:bg-white dark:hover:bg-gray-800 transition-all"
                            >
                                Administración
                            </a>
                        </div>
                        <p className="mt-5 text-xs text-gray-500 dark:text-gray-400">
                            Inicia sesión con tu cuenta o{' '}
                            <span className="font-medium text-emerald-700 dark:text-emerald-400">
                                Continuar con Cédula 360
                            </span>{' '}
                            (incluido 2FA).
                        </p>
                    </div>
                </section>

                {/* Features */}
                <section className="max-w-7xl mx-auto px-4 pb-20">
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {FEATURES.map((f) => (
                            <div
                                key={f.title}
                                className="bg-white dark:bg-gray-800/60 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow"
                            >
                                <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                                    <f.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5">
                                    {f.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {f.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* How it works */}
                <section className="bg-white/70 dark:bg-gray-900/40 border-y border-gray-200 dark:border-gray-800">
                    <div className="max-w-5xl mx-auto px-4 py-16">
                        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
                            Cómo funciona
                        </h2>
                        <div className="grid gap-8 sm:grid-cols-3 text-center">
                            {[
                                ['1', 'Escribe o pega', 'Tu texto y el par de idiomas (o sube una imagen).'],
                                ['2', 'IA local traduce', 'TranslateGemma procesa todo en el servidor, en streaming.'],
                                ['3', 'Copia o guarda', 'Copia el resultado; si inicias sesión, queda en tu historial.'],
                            ].map(([n, t, d]) => (
                                <div key={n}>
                                    <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg mb-4">
                                        {n}
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5">
                                        {t}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {d}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-12">
                            <a
                                href="/traducir"
                                className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
                            >
                                Empezar a traducir
                                <ArrowRightIcon className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            <SiteFooter />
        </div>
    );
}
