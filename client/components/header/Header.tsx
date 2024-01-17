import Link from 'next/link'
import React, { useEffect } from 'react'

import Icon from '@/ui/icon'

import { API } from '@/api/api'
import { openAuthDialog } from '@/api/applicationSlice'
import { login, logout } from '@/api/authSlice'
import { useAppDispatch, useAppSelector } from '@/api/store'

import Search from '@/components/header/Search'

import { concatClassNames as cn } from '@/functions/helpers'

import styles from './styles.module.sass'

interface HeaderProps {
    randomPlaceId?: string
    fullSize?: boolean
    onMenuClick?: () => void
}

const Header: React.FC<HeaderProps> = (props) => {
    const { randomPlaceId, fullSize, onMenuClick } = props

    const dispatch = useAppDispatch()
    const authSlice = useAppSelector((state) => state.auth)

    const [authGetMe, { data: meData, error }] = API.useAuthGetMeMutation()
    const randomPlaceQuery = API.usePlacesGetRandomQuery(undefined, {
        skip: !!randomPlaceId
    })

    const handleLoginClick = (event: React.MouseEvent) => {
        event.preventDefault()
        dispatch(openAuthDialog())
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
        <header className={cn(styles.component, fullSize && styles.fullSize)}>
            <div className={styles.wrapper}>
                <button
                    className={styles.hamburgerButton}
                    onClick={onMenuClick}
                    aria-label={'Toggle Sidebar'}
                >
                    <Icon name={'Menu'} />
                </button>
                <Search />
                {(randomPlaceId || randomPlaceQuery?.data?.id) && (
                    <Link
                        href={`/places/${
                            randomPlaceId ?? randomPlaceQuery?.data?.id
                        }`}
                        title={'Перейти на случайное место'}
                    >
                        <Icon name={'Question'} />
                    </Link>
                )}
                <div className={styles.rightSection}>
                    {authSlice.isAuth ? (
                        <div>{authSlice?.user?.name}</div>
                    ) : (
                        <Link
                            href={'/login'}
                            title={'Авторизация на сайте'}
                            onClick={handleLoginClick}
                        >
                            {'Войти'}
                        </Link>
                    )}
                </div>
            </div>
        </header>
    )
}

export default Header
