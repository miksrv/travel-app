import React from 'react'
import { cn, Icon } from 'simple-react-ui-kit'

import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'

import { openAuthDialog } from '@/app/applicationSlice'
import { useAppDispatch, useAppSelector } from '@/app/store'

import styles from './styles.module.sass'

export const BottomNav: React.FC = () => {
    const { t } = useTranslation('components.bottom-nav')
    const router = useRouter()
    const dispatch = useAppDispatch()
    const authSlice = useAppSelector((state) => state.auth)

    const isActive = (href: string) => router.pathname === href || router.pathname.startsWith(href + '/')

    const handleAddClick = (event: React.MouseEvent) => {
        if (!authSlice.isAuth) {
            event.preventDefault()
            dispatch(openAuthDialog())
        }
    }

    const profileHref = authSlice.isAuth && authSlice.user ? `/users/${authSlice.user.id}` : '/login'

    return (
        <nav className={styles.bottomNav}>
            <Link
                href={'/activity'}
                className={cn(styles.navItem, isActive('/activity') && styles.active)}
            >
                <Icon name={'Feed'} />
                <span>{t('nav-activity', { defaultValue: 'Лента' })}</span>
            </Link>

            <Link
                href={'/map'}
                className={cn(styles.navItem, isActive('/map') && styles.active)}
            >
                <Icon name={'Map'} />
                <span>{t('nav-map', { defaultValue: 'Карта' })}</span>
            </Link>

            <Link
                href={'/places/create'}
                className={styles.addItem}
                onClick={handleAddClick}
            >
                <Icon name={'PlusCircle'} />
            </Link>

            <Link
                href={'/places'}
                className={cn(styles.navItem, isActive('/places') && styles.active)}
            >
                <Icon name={'Point'} />
                <span>{t('nav-places', { defaultValue: 'Места' })}</span>
            </Link>

            <Link
                href={profileHref}
                className={cn(styles.navItem, isActive('/users') && styles.active)}
                onClick={
                    !authSlice.isAuth
                        ? (e) => {
                              e.preventDefault()
                              dispatch(openAuthDialog())
                          }
                        : undefined
                }
            >
                <Icon name={'User'} />
                <span>{t('nav-profile', { defaultValue: 'Профиль' })}</span>
            </Link>
        </nav>
    )
}
