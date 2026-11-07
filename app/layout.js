import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Self-hosted at build time, so pages don't depend on Google Fonts at runtime.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata = {
    title: 'Jibli.tn - Transport d\'objets entre Tunisiens',
    description: 'La plateforme de crowd-shipping qui connecte la diaspora tunisienne avec la Tunisie pour le transport d\'objets.',
};

export default function RootLayout({ children }) {
    return (
        <html lang="fr" className={`scroll-smooth ${inter.variable}`}>
            <body className="min-h-screen bg-neutral-50 font-inter flex flex-col justify-between antialiased">
                <Navbar />
                <main className="flex-grow">
                    {children}
                </main>
                <Footer />
            </body>
        </html>
    );
}
