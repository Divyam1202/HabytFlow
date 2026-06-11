import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { TopNav } from '@/components/layout/top-nav'
import { ActivityTracker } from '@/components/activity-tracker'
import { HabitProvider } from '@/contexts/habit-context'
import { AuthProvider } from '@/contexts/auth-context'
import { GatekeeperModal } from '@/components/ui/gatekeeper-modal'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HabytFlow | Modern Habit Tracker',
  description: 'Track your daily habits on a monthly calendar view',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-white text-black dark:bg-black dark:text-white antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <HabitProvider>
              <TooltipProvider>
                <div className="min-h-screen flex flex-col">
                  <TopNav />
                  <ActivityTracker />
                  <main className="flex-1">
                    {children}
                  </main>
                  <GatekeeperModal />
                </div>
              </TooltipProvider>
            </HabitProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
