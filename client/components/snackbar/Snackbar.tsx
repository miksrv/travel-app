import React from 'react'

import { deleteNotification } from '@/api/snackbarSlice'
import { useAppDispatch, useAppSelector } from '@/api/store'

import Notification from './Notification'
import styles from './styles.module.sass'

interface SnackbarProps {}

const Snackbar: React.FC<SnackbarProps> = () => {
    const dispatch = useAppDispatch()

    const notifications = useAppSelector(
        (state) => state.snackbar.notifications
    )

    const handleCloseNotification = (id: string) => {
        dispatch(deleteNotification(id))
    }

    return (
        <div className={styles.snackbar}>
            {notifications.map((notification) => (
                <Notification
                    key={notification.id}
                    {...notification}
                />
            ))}
        </div>
    )
}

export default Snackbar
