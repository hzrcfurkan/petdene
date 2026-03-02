import type React from "react"
import type { Metadata, Viewport } from "next"
import { Suspense } from "react"
import { Inter, Plus_Jakarta_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SessionProvider } from "@/components/providers/SessionProvider"
import { CurrencyProvider } from "@/components/providers/CurrencyProvider"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from "@/lib/react-query"
import { Toaster } from "sonner"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["500", "600", "700"],
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#155DFC" },
    { media: "(prefers-color-scheme: dark)", color: "#4D8AFF" },
  ],
}

export const metadata: Metadata = {
  title: "Petcare - Complete Professional Veterinary & Grooming Business Solution",
  description: "Complete Professional Veterinary & Grooming Business Solution",
  generator: "v0.app",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Petcare",
  },
  formatDetection: {
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${inter.variable} ${plusJakarta.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <SessionProvider>
            <CurrencyProvider>
            <QueryProvider>
              <Suspense fallback={
                <div className="flex items-center justify-center min-h-screen">
                  <div className="text-center space-y-2">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  </div>
                </div>
              }>
                {children}
              </Suspense>
            </QueryProvider>
            </CurrencyProvider>
          </SessionProvider>
          <Toaster position="bottom-center" richColors />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
