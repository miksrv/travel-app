import { useTranslation } from 'next-i18next'
import Link from 'next/link'
import React, { useEffect } from 'react'
import useGeolocation from 'react-hook-geolocation'

import Button from '@/ui/button'
import Icon from '@/ui/icon'
import Popout from '@/ui/popout'

import { API } from '@/api/api'
import { openAuthDialog, setUserLocation } from '@/api/applicationSlice'
import { logout } from '@/api/authSlice'
import { useAppDispatch, useAppSelector } from '@/api/store'
import { ApiTypes } from '@/api/types'

import AppAuthChecker from '@/components/app-auth-checker'
import UserAvatar from '@/components/user-avatar'

import { concatClassNames as cn, round } from '@/functions/helpers'

import Notifications from './Notifications'
import Search from './Search'
import styles from './styles.module.sass'

interface HeaderProps {
    randomPlaceId?: string
    fullSize?: boolean
    onMenuClick?: () => void
}

const AppBar: React.FC<HeaderProps> = ({
    randomPlaceId,
    fullSize,
    onMenuClick
}) => {
    const { t } = useTranslation('common', { keyPrefix: 'components.appBar' })
    const dispatch = useAppDispatch()
    const geolocation = useGeolocation()

    const appState = useAppSelector((state) => state)

    const [updateLocation] = API.useLocationPutCoordinatesMutation()

    const { data: randomPlace } = API.usePlacesGetRandomQuery(undefined, {
        skip: !!randomPlaceId
    })

    const handleLoginClick = (event: React.MouseEvent) => {
        event.preventDefault()
        dispatch(openAuthDialog())
    }

    const handleLogout = (event: React.MouseEvent) => {
        event.preventDefault()
        dispatch(logout())
    }

    useEffect(() => {
        const updateLat = round(geolocation?.latitude, 3)
        const updateLng = round(geolocation?.longitude, 3)

        if (
            updateLat &&
            updateLng &&
            updateLat !== appState.application.userLocation?.lat &&
            updateLng !== appState.application.userLocation?.lon
        ) {
            const data: ApiTypes.LatLonCoordinate = {
                lat: updateLat,
                lon: updateLng
            }

            dispatch(setUserLocation(data))
            updateLocation(data)
        }
    }, [geolocation.latitude, geolocation.longitude])

    return (
        <header className={cn(styles.component, fullSize && styles.fullSize)}>
            <AppAuthChecker />
            <div className={styles.wrapper}>
                <button
                    className={styles.hamburgerButton}
                    onClick={onMenuClick}
                    aria-label={'Toggle Sidebar'}
                >
                    <Icon name={'Menu'} />
                </button>
                <div className={styles.logo}>{t('logoTitle')}</div>
                <Search />
                {(randomPlaceId || randomPlace?.id) && (
                    <Link
                        className={styles.iconButton}
                        href={`/places/${randomPlaceId ?? randomPlace?.id}`}
                        title={t('randomPlaceLinkTitle')}
                    >
                        <Icon name={'Question'} />
                    </Link>
                )}
                <div className={styles.rightSection}>
                    {appState.auth.isAuth && appState.auth?.user && (
                        <>
                            <Notifications />
                            <Popout
                                action={
                                    <UserAvatar
                                        size={'medium'}
                                        user={appState.auth.user}
                                        disableLink={true}
                                    />
                                }
                            >
                                <ul className={styles.userMenu}>
                                    <li>
                                        <Link
                                            href={`/users/${appState.auth.user?.id}`}
                                            title={t('userProfileTitle')}
                                        >
                                            {t('userProfileCaption')}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href={'/'}
                                            title={''}
                                            onClick={handleLogout}
                                        >
                                            {t('userLogout')}
                                        </Link>
                                    </li>
                                </ul>
                            </Popout>
                        </>
                    )}

                    {appState.auth.isAuth === false && (
                        <Button
                            link={'/login'}
                            title={t('userLoginTitle')}
                            mode={'secondary'}
                            onClick={handleLoginClick}
                        >
                            {t('userLoginCaption')}
                        </Button>
                    )}
                </div>
            </div>
        </header>
    )
}

export default AppBar
