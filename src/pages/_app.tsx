import type { AppProps } from 'next/app'
import localFont from 'next/font/local'
import '../styles/globals.css'

const geistSans = localFont({
  src: '../fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})

const geistMono = localFont({
  src: '../fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <Component {...pageProps} />
    </main>
  )
}
