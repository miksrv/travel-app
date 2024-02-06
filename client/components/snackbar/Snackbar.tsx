import React from 'react'

import { useAppSelector } from '@/api/store'

import styles from './styles.module.sass'

interface FooterProps {}

const Snackbar: React.FC<FooterProps> = () => {
    const notifications = useAppSelector(
        (state) => state.snackbar.notifications
    )

    return (
        <div className={styles.snackbar}>
            {notifications.map((notification) => (
                <div key={notification.id}>{notification.title}</div>
            ))}
        </div>
    )
}

export default Snackbar
