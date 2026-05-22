import { DM_Serif_Display, DM_Sans } from "next/font/google"

import "./globals.css"
import { AppHeader } from "@/components/layout/app-header"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner"

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-heading",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        dmSans.variable,
        dmSerifDisplay.variable,
        "font-mono"
      )}
    >
      <head>
        <script
          async
          crossOrigin="anonymous"
          src="https://tweakcn.com/live-preview.min.js"
        />
      </head>
      <body>
        <ThemeProvider>
          <AppHeader />
          <Toaster />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
