'use client'

import React, { useEffect } from 'react'

import { API } from '@/api/api'
import {
    addNotification,
    deleteAllNotifications,
    deleteNotification
} from '@/api/snackbarSlice'
import { useAppDispatch, useAppSelector } from '@/api/store'

import Notification from './Notification'
import styles from './styles.module.sass'

interface SnackbarProps {}

const Snackbar: React.FC<SnackbarProps> = () => {
    const dispatch = useAppDispatch()

    const authSlice = useAppSelector((state) => state.auth)
    const notificationsList = useAppSelector(
        (state) => state.snackbar.notifications
    )

    const { data } = API.useNotificationsGetListQuery(undefined, {
        pollingInterval: 30 * 1000,
        skip: !authSlice.isAuth
    })

    const handleCloseNotification = (id: string) => {
        dispatch(deleteNotification(id))
    }

    useEffect(() => {
        data?.items?.forEach((item) => {
            dispatch(addNotification(item))
        })
    }, [data?.items])

    useEffect(() => {
        return () => {
            dispatch(deleteAllNotifications())
        }
    }, [])

    return (
        <div className={styles.snackbar}>
            {notificationsList.map((notification) => (
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
