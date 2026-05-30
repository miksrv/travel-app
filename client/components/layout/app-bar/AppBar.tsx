import React, { useCallback, useEffect, useRef, useState } from 'react'
import useGeolocation from 'react-hook-geolocation'
import { Button, cn, Icon, Popout } from 'simple-react-ui-kit'

import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'

import { API, ApiType } from '@/api'
import { openAuthDialog, setUserLocation } from '@/app/applicationSlice'
import { logout } from '@/app/authSlice'
import { useAppDispatch, useAppSelector } from '@/app/store'
import { round } from '@/utils/helpers'

import { AppAuthChecker } from './AppAuthChecker'
import { NotificationList } from './NotificationList'
import { Search } from './Search'
import { UserMenu } from './UserMenu'

import styles from './styles.module.sass'

type NavItem = {
    label: string
    href: string
}

interface AppBarProps {
    fullSize?: boolean
    transparent?: boolean
}

export const AppBar: React.FC<AppBarProps> = ({ fullSize, transparent }) => {
    const { t } = useTranslation('components.app-bar')
    const dispatch = useAppDispatch()
    const router = useRouter()
    const geolocation = useGeolocation()

    const appAuth = useAppSelector((state) => state.auth)
    const userLocation = useAppSelector((state) => state.application.userLocation)

    const [updateLocation] = API.useLocationPutCoordinatesMutation()
    const [visibleCount, setVisibleCount] = useState<number>(99)
    const [scrolled, setScrolled] = useState<boolean>(false)
    const navRef = useRef<HTMLDivElement>(null)
    const itemWidthsRef = useRef<number[]>([])

    const navItems: NavItem[] = [
        { label: t('nav-activity', { defaultValue: 'Лента' }), href: '/activity' },
        { label: t('nav-map', { defaultValue: 'Карта' }), href: '/map' },
        { label: t('nav-places', { defaultValue: 'Места' }), href: '/places' },
        { label: t('nav-users', { defaultValue: 'Пользователи' }), href: '/users' },
        { label: t('nav-achievements', { defaultValue: 'Достижения' }), href: '/achievements' }
    ]

    const handleLoginClick = (event: React.MouseEvent) => {
        event.preventDefault()
        dispatch(openAuthDialog())
    }

    const handleLogout = () => {
        dispatch(logout())
    }

    useEffect(() => {
        const updateLat = round(geolocation.latitude, 3)
        const updateLng = round(geolocation.longitude, 3)
        if (updateLat && updateLng && updateLat !== userLocation?.lat && updateLng !== userLocation?.lon) {
            const data: ApiType.Coordinates = { lat: updateLat, lon: updateLng }
            dispatch(setUserLocation(data))
            void updateLocation(data)
        }
    }, [geolocation.latitude, geolocation.longitude])

    const updateVisibleCount = useCallback(() => {
        if (!navRef.current) {
            return
        }
        const containerWidth = navRef.current.offsetWidth
        const overflowBtnWidth = 40
        let used = 0
        let count = 0
        const widths = itemWidthsRef.current
        for (let i = 0; i < widths.length; i++) {
            const remaining = containerWidth - used
            const needsOverflow = i < widths.length - 1
            if (remaining >= widths[i] + (needsOverflow ? overflowBtnWidth : 0)) {
                used += widths[i]
                count++
            } else {
                break
            }
        }
        setVisibleCount(count || 1)
    }, [])

    useEffect(() => {
        const nav = navRef.current
        if (!nav) {
            return
        }
        const ro = new ResizeObserver(updateVisibleCount)
        ro.observe(nav)
        return () => ro.disconnect()
    }, [updateVisibleCount])

    // measure item widths after first render
    useEffect(() => {
        if (!navRef.current) {
            return
        }
        const items = navRef.current.querySelectorAll('[data-nav-item]')
        itemWidthsRef.current = Array.from(items).map((el) => (el as HTMLElement).offsetWidth + 4)
        updateVisibleCount()
    }, [])

    useEffect(() => {
        if (!transparent) {
            return
        }
        const handleScroll = () => setScrolled(window.scrollY > 10)
        handleScroll()
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [transparent])

    const visibleItems = navItems.slice(0, visibleCount)
    const overflowItems = navItems.slice(visibleCount)
    const isActive = (href: string) => router.pathname === href || router.pathname.startsWith(href + '/')

    return (
        <header
            className={cn(
                styles.appBar,
                fullSize && styles.fullSize,
                transparent && !scrolled && styles.appBarTransparent
            )}
        >
            <AppAuthChecker />
            <div className={styles.wrapper}>
                <Link
                    href={'/'}
                    title={'Geometki'}
                    className={styles.logo}
                />

                <nav
                    ref={navRef}
                    className={styles.nav}
                >
                    {visibleItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            data-nav-item
                            className={cn(styles.navItem, isActive(item.href) && styles.navItemActive)}
                        >
                            {item.label}
                        </Link>
                    ))}
                    {overflowItems.length > 0 && (
                        <Popout
                            trigger={
                                <button className={styles.overflowBtn}>
                                    <Icon name={'VerticalDots'} />
                                </button>
                            }
                        >
                            <ul className={'contextListMenu'}>
                                {overflowItems.map((item) => (
                                    <li key={item.href}>
                                        <Link href={item.href}>{item.label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </Popout>
                    )}
                </nav>

                <div className={styles.rightSection}>
                    <Search />

                    {appAuth.isAuth === true && <NotificationList />}

                    {appAuth.isAuth === true && appAuth.user && (
                        <UserMenu
                            t={t}
                            user={appAuth.user}
                            onLogout={handleLogout}
                        />
                    )}

                    {appAuth.isAuth !== true && (
                        <Button
                            mode={'secondary'}
                            title={t('authorization-on-site_title', { defaultValue: 'Авторизация на сайте' })}
                            label={t('sign-in_button', { defaultValue: 'Войти' })}
                            className={styles.loginButton}
                            onClick={handleLoginClick}
                        />
                    )}

                    <Button
                        mode={'primary'}
                        link={'/places/create'}
                        label={t('add-place_button', { defaultValue: '+ Добавить' })}
                        className={styles.addButton}
                    />
                </div>
            </div>
        </header>
    )
}
