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

    const appState = useAppSelector((state) => state)

    const { data } = API.useNotificationsGetListQuery(undefined, {
        pollingInterval: 15 * 1000,
        skip: !appState.auth.isAuth
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
            {appState.notification.list?.map((notification) => (
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
