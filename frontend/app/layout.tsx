import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Competitor Intelligence Platform',
  description: 'AI-powered competitive market analysis and strategic insights',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
