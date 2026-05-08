import type {Metadata} from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/Footer';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/ThemeProvider';
import { CartProvider } from '@/context/CartContext';
import { FirebaseClientProvider } from '@/firebase';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'PGK Gifts | Premium Personalized Gifts & Studio',
  description: 'Shop premium personalized gifts, custom lamps, toys and frames at PGK Gifts. Fast delivery and high-quality craftsmanship.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-primary selection:text-primary-foreground">
        <Script id="razorpay-checkout" src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <CartProvider>
              <Navbar />
              <main className="min-h-screen">
                {children}
              </main>
              <CartDrawer />
              <FloatingWhatsApp />
              <Footer />
              <Toaster />
            </CartProvider>
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}