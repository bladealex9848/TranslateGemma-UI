import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'TranslateGemma UI - Traducción Privada con IA',
  description:
    'Interfaz moderna para traducción multilingüe con TranslateGemma de Google, ejecutándose 100% localmente con Ollama.',
  keywords: ['traducción', 'IA', 'TranslateGemma', 'Ollama', 'privacidad', 'local'],
  authors: [{ name: 'Alexander Oviedo Fadul' }],
  openGraph: {
    title: 'TranslateGemma UI',
    description: 'Traducción privada con IA - 55 idiomas, 100% local',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
