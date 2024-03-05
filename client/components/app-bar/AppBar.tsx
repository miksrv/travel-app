import { useTranslation } from 'next-i18next'
import Image from 'next/image'
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

import logo from '@/public/images/geometki.png'

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

    const appAuth = useAppSelector((state) => state.auth)
    const useLocation = useAppSelector(
        (state) => state.application.userLocation
    )

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
            updateLat !== useLocation?.lat &&
            updateLng !== useLocation?.lon
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
        <header className={cn(styles.appBar, fullSize && styles.fullSize)}>
            <AppAuthChecker />
            <div className={styles.wrapper}>
                <button
                    className={styles.hamburgerButton}
                    onClick={onMenuClick}
                    aria-label={'Toggle Sidebar'}
                >
                    <Icon name={'Menu'} />
                </button>

                <Link
                    href={'/'}
                    title={''}
                    className={styles.logo}
                >
                    <Image
                        src={logo}
                        alt={''}
                        width={138}
                        height={28}
                    />
                </Link>

                <Search />

                <div className={styles.rightSection}>
                    {(randomPlaceId || randomPlace?.id) && (
                        <Link
                            href={`/places/${randomPlaceId ?? randomPlace?.id}`}
                            title={t('randomPlaceLinkTitle')}
                        >
                            <Icon name={'RandomLocation'} />
                        </Link>
                    )}

                    {appAuth.isAuth && appAuth.user?.id && (
                        <>
                            <Notifications />
                            <Popout
                                action={
                                    <UserAvatar
                                        size={'medium'}
                                        user={appAuth.user}
                                        disableLink={true}
                                        hideOnlineIcon={true}
                                    />
                                }
                            >
                                <ul className={styles.userMenu}>
                                    <li>
                                        <Link
                                            href={`/users/${appAuth.user?.id}`}
                                            title={t('userProfileTitle')}
                                        >
                                            {t('userProfileCaption')}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href={'/users/settings'}
                                            title={t('userSettingsTitle')}
                                        >
                                            {t('userSettingsCaption')}
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

                    {appAuth.isAuth === false && (
                        <Button
                            title={t('userLoginTitle')}
                            mode={'secondary'}
                            className={styles.loginButton}
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
