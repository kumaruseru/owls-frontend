import { Inter, Instrument_Sans } from "next/font/google";
import type { Metadata } from 'next';
import './globals.css';
import Layout from '@/components/layout/Layout';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
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
    <html lang="vi" className={`dark ${inter.variable} ${instrument.variable}`} suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}
