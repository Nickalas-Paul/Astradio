import type { Metadata } from 'next';
import './globals.css';
import { GenreProvider } from '../context/GenreContext';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { SubscriptionProvider } from '../context/SubscriptionContext';

export const metadata: Metadata = {
  title: 'Astradio - Astrological Music Generation',
  description: 'Transform your astrological chart into unique musical compositions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <SubscriptionProvider>
            <ThemeProvider>
              <GenreProvider>
                <div className="main-container">
                  {children}
                </div>
              </GenreProvider>
            </ThemeProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </body>
    </html>
  );
} 