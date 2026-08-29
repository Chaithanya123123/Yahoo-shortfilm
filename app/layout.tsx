import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Yahoo!',
  description: 'Yahoo! - The Web\'s Leading Portal (1999)',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
