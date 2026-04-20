import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UrbanDelivery",
  description: "Sistema de gestão de entregas urbanas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <header className="glass-card-elevated sticky top-0 z-50" style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none' }}>
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--yale)' }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="#FAF0CA" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M8 5.5V10.5M5.5 7L8 5.5L10.5 7" stroke="#FAF0CA" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-lg font-semibold tracking-tight" style={{ color: 'var(--yale)' }}>
                UrbanDelivery
              </span>
            </Link>
            <nav className="flex items-center gap-1">
              <Link
                href="/customers"
                className="btn-ghost"
                style={{ fontSize: '0.8125rem' }}
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 4 }}>
                  <circle cx="7.5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M3 13.5C3 11 5 9.5 7.5 9.5S12 11 12 13.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                Clientes
              </Link>
              <Link
                href="/orders"
                className="btn-ghost"
                style={{ fontSize: '0.8125rem' }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 4 }}>
                  <path d="M8 2.5L2.5 5.5V10.5L8 13.5L13.5 10.5V5.5L8 2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                  <path d="M2.5 5.5L8 8.5L13.5 5.5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                  <path d="M8 13.5V8.5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                </svg>
                Encomendas
              </Link>
              <Link
                href="/couriers"
                className="btn-ghost"
                style={{ fontSize: '0.8125rem' }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 4 }}>
                  <path d="M3.5 12h9M8 3.5c-2.5 0-4.5 2-4.5 4.5v1L2.5 11h11L12.5 9v-1c0-2.5-2-4.5-4.5-4.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 3.5V2m4 1.5V2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                Estafetas
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-6xl mx-auto px-6 py-10 w-full">
          {children}
        </main>
        <footer className="py-6 text-center text-xs" style={{ color: 'var(--muted)' }}>
          <span>© {new Date().getFullYear()} UrbanDelivery</span>
          <span style={{ margin: '0 8px', opacity: 0.4 }}>·</span>
          <span>Sistema de Gestão</span>
        </footer>
      </body>
    </html>
  );
}
