import Link from 'next/link'
import React, { useEffect, useState } from 'react'

import Breadcrumbs from '@/ui/breadcrumbs'
import { BreadcrumbLink } from '@/ui/breadcrumbs/Breadcrumbs'
import Button from '@/ui/button'
import Icon from '@/ui/icon'

import { API } from '@/api/api'
import { login, logout } from '@/api/authSlice'
import { useAppDispatch, useAppSelector } from '@/api/store'

import Search from '@/components/header/Search'

import { concatClassNames as cn } from '@/functions/helpers'

import styles from './styles.module.sass'

interface HeaderProps {
    title?: string
    randomPlaceId?: string
    breadcrumb?: string
    links?: BreadcrumbLink[]
    fullSize?: boolean
    onMenuClick?: () => void
}

const Header: React.FC<HeaderProps> = ({
    title,
    randomPlaceId,
    links,
    breadcrumb,
    fullSize,
    onMenuClick
}) => {
    const dispatch = useAppDispatch()
    const authSlice = useAppSelector((state) => state.auth)
    const [authGetMe, { data: meData, error }] = API.useAuthGetMeMutation()
    const randomPlaceQuery = API.usePlacesGetRandomQuery(undefined, {
        skip: !!randomPlaceId
    })

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
                <div className={styles.rightSection}>
                    {(randomPlaceId || randomPlaceQuery?.data?.id) && (
                        <Button
                            link={`/places/${
                                randomPlaceId ?? randomPlaceQuery?.data?.id
                            }`}
                            title={'Перейти на случайное место'}
                            size={'m'}
                            icon={'Question'}
                            mode={'primary'}
                        />
                    )}
                    <Search />
                    <Link
                        href={'/login'}
                        title={'Авторизация на сайте'}
                        className={styles.user}
                    >
                        <Icon name={'UserCircle'} />
                    </Link>
                </div>
            </div>
        </header>
    )
}

export default Header
