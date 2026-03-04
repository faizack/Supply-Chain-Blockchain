import type { Metadata } from 'next'
import './globals.css'
import NetworkHelper from '@/components/NetworkHelper'
import NotificationContainer from '@/components/Notification'

export const metadata: Metadata = {
  title: 'Supply Chain Manager',
  description: 'Blockchain-based Supply Chain Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <NetworkHelper />
        <NotificationContainer />
        {children}
      </body>
    </html>
  )
}

