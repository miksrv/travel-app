import React from 'react'

import Icon from '@/ui/icon'

import { deleteNotification } from '@/api/snackbarSlice'
import { useAppDispatch, useAppSelector } from '@/api/store'

import { concatClassNames as cn } from '@/functions/helpers'

import styles from './styles.module.sass'

interface FooterProps {}

const Snackbar: React.FC<FooterProps> = () => {
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
                <div
                    key={notification.id}
                    className={styles.notification}
                >
                    {(notification.icon || notification.type) && (
                        <div
                            className={cn(
                                styles.before,
                                notification?.type && styles[notification.type]
                            )}
                        >
                            {notification.type === 'success' ? (
                                <Icon name={'CheckCircle'} />
                            ) : notification.type === 'error' ? (
                                <Icon name={'ReportError'} />
                            ) : (
                                notification.icon
                            )}
                        </div>
                    )}
                    <div className={styles.body}>
                        {notification.title && (
                            <span className={styles.title}>
                                {notification.title}
                            </span>
                        )}
                        {notification.content && (
                            <span className={styles.content}>
                                {notification.content}
                            </span>
                        )}
                    </div>
                    <button
                        className={styles.closeButton}
                        onClick={() => handleCloseNotification(notification.id)}
                    >
                        <Icon name={'Close'} />
                    </button>
                </div>
            ))}
        </div>
    )
}

export default Snackbar
