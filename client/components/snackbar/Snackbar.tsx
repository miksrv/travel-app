import React from 'react'

import Icon from '@/ui/icon'

import { deleteNotification } from '@/api/snackbarSlice'
import { useAppDispatch, useAppSelector } from '@/api/store'

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
            <div className={styles.notification}>
                <div className={styles.before}>
                    <Icon name={'Award'} />
                </div>
                <div className={styles.body}>
                    <span className={styles.title}>
                        Этот сервис рекомендует один друг
                    </span>
                    <span className={styles.content}>
                        Вы можете порекомендовать сервис в дополнительном меню
                    </span>
                </div>
                <button
                    className={styles.closeButton}
                    onClick={() => handleCloseNotification('1')}
                >
                    <Icon name={'Close'} />
                </button>
            </div>

            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={styles.notification}
                >
                    {notification.title}
                </div>
            ))}
        </div>
    )
}

export default Snackbar
