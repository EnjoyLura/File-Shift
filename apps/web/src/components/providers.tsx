'use client';

import { ThemeProvider } from 'next-themes';
import { DesignHeader } from '@/components/layout/header';
import { DesignFooter } from '@/components/layout/footer';
import { ToastProvider } from '@/components/ui/toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <ToastProvider>
        <div className="flex min-h-screen flex-col">
          <DesignHeader />
          <main className="flex-1">{children}</main>
          <DesignFooter />
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}
