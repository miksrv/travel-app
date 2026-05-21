'use client'

import React from 'react'

import Image from 'next/image'
import Link from 'next/link'

import styles from '@/styles/not-found.module.sass'

interface NotFoundPageProps {
    onBack?: () => void
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onBack }) => (
    <div className={styles.page}>
        <p className={styles.code}>{'404'}</p>
        <h1 className={styles.title}>{'Место не найдено'}</h1>
        <p className={styles.description}>
            {'Похоже, вы забрели не туда. Возможно, это место было удалено, перемещено или никогда не существовало.'}
        </p>

        <div className={styles.image}>
            <Image
                src={'/images/404.png'}
                alt={'Страница не найдена'}
                width={340}
                height={300}
                priority
            />
        </div>

        <div className={styles.actions}>
            {onBack && (
                <button
                    className={styles.backButton}
                    onClick={onBack}
                >
                    {'← Назад'}
                </button>
            )}
            <Link
                href={'/'}
                className={styles.homeLink}
            >
                {'Вернуться на начальную страницу'}
            </Link>
        </div>
    </div>
)
