import { Inter, Instrument_Sans } from "next/font/google"; // Switch to more distinct font
import type { Metadata } from 'next';
import './globals.css';
import Layout from '@/components/layout/Layout';
import { Providers } from './providers'; // We will create this for Smooth Scroll

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
// Instrument Sans is a modern, geometric sans-serif that looks very "tech/premium"
const instrument = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument'
});

export const metadata: Metadata = {
  title: 'OWLS - Future Tech Store',
  description: 'Premium Technology & Lifestyle',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`dark ${inter.variable} ${instrument.variable}`}>
      <body className={inter.className}>
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}
