import './globals.css'

export const metadata = {
  title: 'China TCM Massage',
  description: 'Modern wellness website for a traditional Chinese massage studio.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  )
}
