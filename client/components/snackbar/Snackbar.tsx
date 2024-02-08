'use client'

import React, { useEffect } from 'react'

import { API } from '@/api/api'
import {
    addNotification,
    deleteAllNotifications,
    deleteNotification,
    setUnreadCounter
} from '@/api/notificationSlice'
import { useAppDispatch, useAppSelector } from '@/api/store'

import Notification from './Notification'
import styles from './styles.module.sass'

interface SnackbarProps {}

const Snackbar: React.FC<SnackbarProps> = () => {
    const dispatch = useAppDispatch()

    const notifications = useAppSelector((state) => state.notification.list)
    const isAuth = useAppSelector((state) => state.auth.isAuth)

    const { data } = API.useNotificationsGetUpdatesQuery(undefined, {
        pollingInterval: 15 * 1000,
        skip: !isAuth
    })

    const handleCloseNotification = (id: string) => {
        dispatch(deleteNotification(id))
    }

    useEffect(() => {
        data?.items?.forEach((item) => {
            dispatch(addNotification(item))
        })

        dispatch(setUnreadCounter(data?.count ?? 0))
    }, [data])

    useEffect(() => {
        return () => {
            dispatch(deleteAllNotifications())
        }
    }, [])

    return (
        <div className={styles.snackbar}>
            {notifications?.map((notification) => (
                <Notification
                    key={notification.id}
                    onClose={handleCloseNotification}
                    {...notification}
                />
            ))}
        </div>
    )
}

export default Snackbar
