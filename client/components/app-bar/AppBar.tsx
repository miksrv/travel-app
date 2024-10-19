import React, { useEffect } from 'react'
import useGeolocation from 'react-hook-geolocation'
import { useTranslation } from 'next-i18next'
import { Button, cn, Icon } from 'simple-react-ui-kit'

import Notifications from './Notifications'
import Search from './Search'
import styles from './styles.module.sass'

import { API } from '@/api/api'
import { openAuthDialog, setUserLocation } from '@/api/applicationSlice'
import { logout } from '@/api/authSlice'
import { useAppDispatch, useAppSelector } from '@/api/store'
import { ApiTypes } from '@/api/types'
import AppAuthChecker from '@/components/app-auth-checker'
import Logo from '@/components/app-bar/Logo'
import UserMenu from '@/components/app-bar/UserMenu'
import { round } from '@/functions/helpers'

interface HeaderProps {
    fullSize?: boolean
    onMenuClick?: () => void
}

const AppBar: React.FC<HeaderProps> = ({ fullSize, onMenuClick }) => {
    const dispatch = useAppDispatch()
    const geolocation = useGeolocation()
    const { t } = useTranslation()

    const appAuth = useAppSelector((state) => state.auth)
    const userLocation = useAppSelector((state) => state.application.userLocation)

    const [updateLocation] = API.useLocationPutCoordinatesMutation()

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

                <Logo />

                <Search />

                <div className={styles.rightSection}>
                    {appAuth.isAuth && <Notifications />}

                    {appAuth.user && (
                        <UserMenu
                            t={t}
                            user={appAuth.user}
                            onLogout={handleLogout}
                        />
                    )}

                    {appAuth.isAuth === false && (
                        <Button
                            title={t('authorization-on-site')}
                            mode={'secondary'}
                            className={styles.loginButton}
                            onClick={handleLoginClick}
                            label={t('sign-in')}
                        />
                    )}
                </div>
            </div>
        </header>
    )
}

export default AppBar
