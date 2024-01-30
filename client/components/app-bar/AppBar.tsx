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

import UserAvatar from '@/components/user-avatar'

import { concatClassNames as cn, round } from '@/functions/helpers'

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
    const dispatch = useAppDispatch()
    const geolocation = useGeolocation()

    const authorization = useAppSelector((state) => state.auth)
    const location = useAppSelector((state) => state.application.userLocation)

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
            updateLat !== location?.lat &&
            updateLng !== location?.lon
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
            <div className={styles.wrapper}>
                <button
                    className={styles.hamburgerButton}
                    onClick={onMenuClick}
                    aria-label={'Toggle Sidebar'}
                >
                    <Icon name={'Menu'} />
                </button>
                <Search />
                {(randomPlaceId || randomPlace?.id) && (
                    <Link
                        href={`/places/${randomPlaceId ?? randomPlace?.id}`}
                        title={'Перейти на случайное место'}
                    >
                        <Icon name={'Question'} />
                    </Link>
                )}
                <div className={styles.rightSection}>
                    {authorization.isAuth && authorization?.user ? (
                        <Popout
                            action={
                                <UserAvatar
                                    size={'medium'}
                                    user={authorization?.user}
                                    disableLink={true}
                                />
                            }
                        >
                            <ul className={styles.userMenu}>
                                <li>
                                    <Link
                                        href={`/users/${authorization?.user?.id}`}
                                        title={''}
                                    >
                                        {'Профиль'}
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href={'/'}
                                        title={''}
                                        onClick={handleLogout}
                                    >
                                        {'Выход'}
                                    </Link>
                                </li>
                            </ul>
                        </Popout>
                    ) : (
                        <Button
                            link={'/login'}
                            title={'Авторизация на сайте'}
                            mode={'secondary'}
                            onClick={handleLoginClick}
                        >
                            {'Войти'}
                        </Button>
                    )}
                </div>
            </div>
        </header>
    )
}

export default AppBar
