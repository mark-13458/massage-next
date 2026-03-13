import './globals.css'
import { defaultSiteMetadata } from '../lib/seo'

export const metadata = defaultSiteMetadata

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  )
}
