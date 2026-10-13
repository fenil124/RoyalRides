import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Great_Vibes } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const sansFont = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

const scriptFont = Great_Vibes({
  variable: '--font-script',
  subsets: ['latin'],
  weight: ['400'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'RoyalRides Travels | Premium Chauffeur-Driven Car Rental & Outstation Cabs',
  description:
    'Experience comfortable rides for every journey. Premium chauffeur-driven car rental for airport transfers, outstation travel, and corporate trips between Surat, Mumbai, Pune, Ahmedabad. Fleet features Innova, Ertiga, Swift Dzire, and Urbania Traveller.',
  keywords: [
    'Chauffeur car rental',
    'Surat to Mumbai Airport cab',
    'Innova rental Surat',
    'Ertiga cab service',
    'Urbania luxury van hire',
    'RoyalRides Travels',
  ],
  openGraph: {
    title: 'RoyalRides Travels | Premium Chauffeur-Driven Car Rental',
    description: 'Comfortable rides for every journey. Airport transfers, outstation trips, and city travel.',
    images: ['/images/hero-bg.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${sansFont.variable} ${scriptFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
