import React, { useEffect } from 'react'

import Breadcrumbs from '@/ui/breadcrumbs'
import { BreadcrumbLink } from '@/ui/breadcrumbs/Breadcrumbs'
import Icon from '@/ui/icon'

import { API } from '@/api/api'
import { login, logout } from '@/api/authSlice'
import { useAppDispatch, useAppSelector } from '@/api/store'

import { concatClassNames as cn } from '@/functions/helpers'

import styles from './styles.module.sass'

interface HeaderProps {
    title?: string
    breadcrumb?: string
    links?: BreadcrumbLink[]
    fullSize?: boolean
    onMenuClick?: () => void
}

const Header: React.FC<HeaderProps> = ({
    title,
    links,
    breadcrumb,
    fullSize,
    onMenuClick
}) => {
    const dispatch = useAppDispatch()
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
        <header className={cn(styles.component, fullSize && styles.fullSize)}>
            <div className={styles.wrapper}>
                <button
                    className={styles.hamburgerButton}
                    onClick={onMenuClick}
                    aria-label={'Toggle Sidebar'}
                >
                    <Icon name={'Menu'} />
                </button>
                <div>
                    {title && <h1 className={styles.title}>{title}</h1>}
                    <Breadcrumbs
                        currentPage={breadcrumb}
                        links={links}
                    />
                </div>
            </div>
        </header>
    )
}

export default Header
