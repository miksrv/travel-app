import { useTranslation } from 'next-i18next'
import React, { useEffect, useRef, useState } from 'react'

import Button from '@/ui/button'
import Counter from '@/ui/counter'
import Icon from '@/ui/icon'
import Popout from '@/ui/popout'
import Spinner from '@/ui/spinner'

import { API } from '@/api/api'
import {
    deleteAllNotifications,
    setUnreadCounter
} from '@/api/notificationSlice'
import { useAppDispatch, useAppSelector } from '@/api/store'

import Notification from '@/components/snackbar/Notification'

import styles from './styles.module.sass'

interface NotificationsProps {}

const Notifications: React.FC<NotificationsProps> = () => {
    const { t } = useTranslation('common', {
        keyPrefix: 'components.appBar.notifications'
    })
    const dispatch = useAppDispatch()

    const notifyContainerRef = useRef<HTMLDivElement>(null)

    const appState = useAppSelector((state) => state)

    const [notifyShow, setNotifyShow] = useState<boolean>(false)
    const [notifyPage, setNotifyPage] = useState<number>(1)

    const [clearNotification, { isLoading: loadingClear }] =
        API.useNotificationsDeleteMutation()

    const {
        data: notifyData,
        isLoading: notifyLoading,
        isFetching: notifyFetching
    } = API.useNotificationsGetListQuery(
        {
            limit: 5,
            offset: (notifyPage - 1) * 5
        },
        {
            skip: !notifyShow
        }
    )

    const handleNotificationsClick = () => {
        if (!notifyShow) {
            setNotifyShow(true)
        }
    }

    const handleClearNotificationsClick = async () => {
        setNotifyPage(1)

        await clearNotification()
        dispatch(setUnreadCounter(0))
        dispatch(deleteAllNotifications())
    }

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
        <Popout
            action={
                <button
                    className={styles.notificationsButton}
                    onClick={handleNotificationsClick}
                >
                    <Icon name={'Notifications'} />
                    <Counter
                        className={styles.notifyCounter}
                        value={appState.notification.counter}
                    />
                </button>
            }
        >
            <>
                {!!notifyData?.items?.length && (
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
                )}
                {notifyLoading && (
                    <div className={styles.loader}>
                        <Spinner />
                    </div>
                )}
                {!notifyData?.items?.length && !notifyLoading && (
                    <div className={styles.noData}>
                        <p>{t('noData')}</p>
                    </div>
                )}
                <div className={styles.notifyFooter}>
                    <Button
                        mode={'secondary'}
                        stretched={true}
                        disabled={
                            loadingClear ||
                            notifyFetching ||
                            !notifyData?.items?.length
                        }
                        onClick={handleClearNotificationsClick}
                    >
                        {t('clearButton')}
                    </Button>
                </div>
            </>
        </Popout>
    )
}

export default Notifications
