import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Attendance Admin Dashboard',
  description: 'View and manage employee attendance records',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}