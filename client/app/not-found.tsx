'use client'

import { useRouter } from 'next/navigation'

import { NotFoundPage } from '@/components/shared'

export default function NotFound() {
    const router = useRouter()

    return <NotFoundPage onBack={() => router.back()} />
}
