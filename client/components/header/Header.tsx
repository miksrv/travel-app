import Breadcrumbs from '@/ui/breadcrumbs'
import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'

import { ImageHost } from '@/api/api'
import { API } from '@/api/api'
import { login, logout } from '@/api/authSlice'
import { useAppDispatch, useAppSelector } from '@/api/store'

import burgerMenu from './burger-menu.svg'
import styles from './styles.module.sass'

interface HeaderProps {
    title?: string
    breadcrumb?: string
    fullSize?: boolean
    onMenuClick?: (event: React.KeyboardEvent | React.MouseEvent) => void
}

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

    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
        null
    )

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget)
    }

    const handleCloseUserMenu = () => {
        setAnchorElUser(null)
    }

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
            {title && <h1 className={styles.title}>{title}</h1>}
            <Breadcrumbs currentPage={breadcrumb} />
        </header>
    )
}

export default Header
