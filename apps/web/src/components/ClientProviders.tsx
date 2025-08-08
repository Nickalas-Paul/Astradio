'use client';

import { GenreProvider } from '../context/GenreContext';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { SubscriptionProvider } from '../context/SubscriptionContext';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <ThemeProvider>
          <GenreProvider>
            {children}
          </GenreProvider>
        </ThemeProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
} 