import type { Metadata } from 'next';
import './globals.css';
import { Header } from '../components/Header';

export const metadata: Metadata = {
  title: 'InvoicePro',
  description: 'Aplikasi invoice profesional untuk freelancer dan tim',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
