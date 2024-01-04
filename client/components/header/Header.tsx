import { useTranslation } from 'next-i18next'
import React, { useEffect, useState } from 'react'

import Breadcrumbs from '@/ui/breadcrumbs'

import { ImageHost } from '@/api/api'
import { API } from '@/api/api'
import { login, logout } from '@/api/authSlice'
import { useAppDispatch, useAppSelector } from '@/api/store'

import styles from './styles.module.sass'

interface HeaderProps {
    title?: string
    breadcrumb?: string
    fullSize?: boolean
    onMenuClick?: () => void
}

const HamburgerIcon = () => (
    <svg
        version={'1.1'}
        viewBox={'0 0 32 32'}
    >
        <path d='M4,10h24c1.104,0,2-0.896,2-2s-0.896-2-2-2H4C2.896,6,2,6.896,2,8S2.896,10,4,10z M28,14H4c-1.104,0-2,0.896-2,2  s0.896,2,2,2h24c1.104,0,2-0.896,2-2S29.104,14,28,14z M28,22H4c-1.104,0-2,0.896-2,2s0.896,2,2,2h24c1.104,0,2-0.896,2-2  S29.104,22,28,22z' />
    </svg>
)

const Header: React.FC<HeaderProps> = ({
    title,
    breadcrumb,
    fullSize,
    onMenuClick
}) => {
    const dispatch = useAppDispatch()
    const { t } = useTranslation()

    const [authGetMe, { data: meData, error }] = API.useAuthGetMeMutation()

    const authSlice = useAppSelector((state) => state.auth)

    useEffect(() => {
        if (meData?.auth) {
            dispatch(login(meData))
        } else {
            if (error) {
                dispatch(logout())
            }
        }
    }, [meData, error])

    useEffect(() => {
        if (authSlice.token) {
            authGetMe()
        }
    }, [])

    return (
        <header className={styles.component}>
            <button
                className={styles.hamburgerButton}
                onClick={onMenuClick}
                aria-label={'Toggle Sidebar'}
            >
                <HamburgerIcon />
            </button>
            <div>
                {title && <h1 className={styles.title}>{title}</h1>}
                <Breadcrumbs currentPage={breadcrumb} />
            </div>
        </header>
    )
}

export default Header
