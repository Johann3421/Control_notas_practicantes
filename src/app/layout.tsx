import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Toaster } from "sonner"
import { ThemeProvider } from "@/components/ui/ThemeProvider"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains",
  display: "swap",
})

export const metadata: Metadata = {
  title: "DevTrack — Mide el crecimiento. Acelera el talento.",
  description: "Plataforma de seguimiento de practicantes de desarrollo de software",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-base-950 text-text-primary antialiased`}
      >
        <ThemeProvider>
          {children}
          <Toaster
            toastOptions={{
              style: {
                background: "var(--color-base-800)",
                border: "1px solid var(--color-base-600)",
                color: "var(--color-text-primary)",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
