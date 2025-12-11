import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
    title: 'Bulan2 Modern',
    description: 'Modern application built with Next.js and Go',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="id">
            <body>{children}</body>
        </html>
    )
}
