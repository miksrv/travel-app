'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import styles from '@/styles/not-found.module.sass'

export default function NotFound() {
    const router = useRouter()

    return (
        <div className={styles.page}>
            <p className={styles.code}>{'404'}</p>
            <h1 className={styles.title}>{'Место не найдено'}</h1>
            <p className={styles.description}>
                {
                    'Похоже, вы забрели не туда. Возможно, это место было удалено, перемещено или никогда не существовало.'
                }
            </p>

            <div className={styles.image}>
                <Image
                    src={'/images/404.png'}
                    alt={'Страница не найдена'}
                    width={340}
                    height={300}
                    priority
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
            </div>

            <div className={styles.actions}>
                <button
                    className={styles.backButton}
                    onClick={() => router.back()}
                >
                    {'← Назад'}
                </button>
                <Link
                    href={'/'}
                    className={styles.homeLink}
                >
                    {'Вернуться на начальную страницу'}
                </Link>
            </div>
        </div>
    )
}
