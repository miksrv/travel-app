import { useTranslation } from 'next-i18next'
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import useGeolocation from 'react-hook-geolocation'

import Button from '@/ui/button'
import Counter from '@/ui/counter'
import Icon from '@/ui/icon'
import Popout from '@/ui/popout'

import { API } from '@/api/api'
import { openAuthDialog, setUserLocation } from '@/api/applicationSlice'
import { logout } from '@/api/authSlice'
import {
    deleteAllNotifications,
    setUnreadCounter
} from '@/api/notificationSlice'
import { useAppDispatch, useAppSelector } from '@/api/store'
import { ApiTypes } from '@/api/types'

import AppAuthChecker from '@/components/app-auth-checker'
import Notification from '@/components/snackbar/Notification'
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
    const { t } = useTranslation('common', { keyPrefix: 'components.appBar' })
    const dispatch = useAppDispatch()
    const geolocation = useGeolocation()

    const notifyContainerRef = useRef<HTMLDivElement>(null)

    const appState = useAppSelector((state) => state)

    const [notifyShow, setNotifyShow] = useState<boolean>(false)
    const [notifyPage, setNotifyPage] = useState<number>(1)

    const [updateLocation] = API.useLocationPutCoordinatesMutation()

    const [clearNotification, { isLoading: loadingClear }] =
        API.useNotificationsDeleteMutation()
    const { data: randomPlace, refetch } = API.usePlacesGetRandomQuery(
        undefined,
        {
            skip: !!randomPlaceId
        }
    )

    const { data: notifyData, isFetching: notifyFetching } =
        API.useNotificationsGetListQuery(
            {
                limit: 15,
                offset: (notifyPage - 1) * 15
            },
            {
                skip: !notifyShow
            }
        )

    const handleLoginClick = (event: React.MouseEvent) => {
        event.preventDefault()
        dispatch(openAuthDialog())
    }

    const handleLogout = (event: React.MouseEvent) => {
        event.preventDefault()
        dispatch(logout())
    }

    const handleNotificationsClick = () => {
        if (!notifyShow) {
            setNotifyShow(true)
        }
    }

    const handleClearNotificationsClick = async () => {
        await clearNotification()
        dispatch(setUnreadCounter(0))
        dispatch(deleteAllNotifications())
        refetch()
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

    useEffect(() => {
        const unreadCount = notifyData?.items?.filter(
            ({ read }) => !read
        )?.length

        if (unreadCount) {
            const newUnreadValue = appState.notification.counter - unreadCount
            dispatch(setUnreadCounter(newUnreadValue < 0 ? 0 : newUnreadValue))
        }
    }, [notifyData])

    useEffect(() => {
        const onScroll = () => {
            const targetDiv = notifyContainerRef.current
            if (!targetDiv) return

            const scrolledToBottom =
                targetDiv.scrollTop + targetDiv.clientHeight >=
                targetDiv.scrollHeight - 20

            if (
                notifyData?.count &&
                scrolledToBottom &&
                !notifyFetching &&
                !!notifyData?.items?.length &&
                notifyData?.count > notifyData?.items?.length
            ) {
                setNotifyPage(notifyPage + 1)
            }
        }

        const targetDiv = notifyContainerRef.current
        if (!targetDiv) return

        targetDiv.addEventListener('scroll', onScroll)

        return () => {
            targetDiv.removeEventListener('scroll', onScroll)
        }
    }, [notifyPage, notifyFetching, notifyData])

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
                            <Popout
                                action={
                                    <button
                                        className={styles.notificationsButton}
                                        onClick={handleNotificationsClick}
                                    >
                                        <Icon name={'Notifications'} />
                                        <Counter
                                            className={styles.notifyCounter}
                                            value={
                                                appState.notification.counter
                                            }
                                        />
                                    </button>
                                }
                            >
                                <>
                                    <div
                                        className={styles.notificationsContent}
                                        ref={notifyContainerRef}
                                    >
                                        {notifyData?.items?.map((item) => (
                                            <Notification
                                                key={item.id}
                                                showDate={true}
                                                {...item}
                                            />
                                        ))}
                                    </div>
                                    <div className={styles.notifyButton}>
                                        <Button
                                            mode={'secondary'}
                                            stretched={true}
                                            disabled={
                                                loadingClear || notifyFetching
                                            }
                                            onClick={
                                                handleClearNotificationsClick
                                            }
                                        >
                                            {'Очистить'}
                                        </Button>
                                    </div>
                                </>
                            </Popout>
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
