import type { Metadata } from 'next';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { CartProvider } from '@/context/CartContext';
import { AtelierProvider } from '@/context/AtelierContext';
import { CustomerAuthProvider } from '@/context/CustomerAuthContext';
import { CustomerAuthModal } from '@/components/auth/CustomerAuthModal';
import { CraftsmanChatWidget } from '@/components/chat/CraftsmanChatWidget';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://sisodiaatelier.com'),
  title: 'SISODIA ATELIER ✧ | Heirloom Solid Wood & Wooden Tiles',
  description:
    'Ultra-luxury solid wood handicrafts and palatial architectural woodwork by SISODIA ATELIER ✧. 100% monolithic heartwood, 7.2% desert-kiln equilibrium, and 100% DDP delivered duty paid global delivery to USA, UK, Europe, Australia, Dubai, Netherlands, Germany, Canada, France, Mexico, UAE.',
  keywords: [
    'SISODIA ATELIER ✧',
    'luxury solid wood furniture',
    'heirloom handicrafts',
    'Burma teak dining table',
    'Vijaysar ayurvedic bowl',
    'desert sheesham woodcraft',
    'Nagina solid wooden tiles',
    'Nagina carved architectural woodwork',
    'DDP export furniture',
  ],
  icons: {
    icon: '/logo.jpeg?v=3',
    shortcut: '/logo.jpeg?v=3',
    apple: '/logo.jpeg?v=3',
  },
  openGraph: {
    title: 'SISODIA ATELIER ✧ | Heirloom Solid Wood & Wooden Tiles',
    description: 'Three centuries of living timber. Zero plywood. Hand-carved in Nagina, India by SISODIA ATELIER ✧.',
    images: ['/logo.jpeg?v=3'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/jpeg" href="/logo.jpeg?v=3" />
        <link rel="apple-touch-icon" href="/logo.jpeg?v=3" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Jost:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="bg-[#FAF7F2] text-[#1C1917] antialiased selection:bg-[#1E392A] selection:text-[#FAF7F2] font-sans"
        suppressHydrationWarning
      >
        <CurrencyProvider>
          <AtelierProvider>
            <CustomerAuthProvider>
              <CartProvider>
                {children}
                <CustomerAuthModal />
                <CraftsmanChatWidget />
              </CartProvider>
            </CustomerAuthProvider>
          </AtelierProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}
