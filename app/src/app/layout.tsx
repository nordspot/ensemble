import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ensemble — Where expertise comes together',
  description:
    'The professional congress platform for conferences of any discipline.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
