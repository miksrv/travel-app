import type { Metadata } from 'next'

import { NotFoundPage } from '@/components/shared/not-found-page'

export const metadata: Metadata = {
    robots: {
        follow: false,
        index: false
    },
    title: 'Место не найдено | Геометки'
}

export default function NotFound() {
    return <NotFoundPage />
}
