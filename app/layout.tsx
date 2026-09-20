import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'PixEdit - Professional Photo Editor',
  description: 'Professional photo editing web application featuring instant filters, background tools, image resizing, and AI auto-enhancement.',
  openGraph: {
    title: 'PixEdit - Professional Photo Editor',
    description: 'Professional photo editing web application featuring instant filters, background tools, image resizing, and AI auto-enhancement.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PixEdit - Professional Photo Editor',
    description: 'Professional photo editing web application featuring instant filters, background tools, image resizing, and AI auto-enhancement.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
