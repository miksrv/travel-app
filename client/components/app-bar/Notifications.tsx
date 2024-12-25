import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'next-i18next'
import { Button, Popout, Spinner } from 'simple-react-ui-kit'

import styles from './styles.module.sass'

import { API, useAppDispatch, useAppSelector } from '@/api'
import { deleteAllNotifications, Notify, setUnreadCounter } from '@/api/notificationSlice'
import Notification from '@/components/snackbar/Notification'
import Counter from '@/ui/counter'

type NotificationsProps = object

const Notifications: React.FC<NotificationsProps> = () => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()

    const notifyContainerRef = useRef<HTMLDivElement>(null)

    const notifyCounter = useAppSelector((state) => state.notification.counter)

    const [notifyShow, setNotifyShow] = useState<boolean>(false)
    const [notifyPage, setNotifyPage] = useState<number>(1)

    const [clearNotification, { isLoading: loadingClear, isSuccess }] = API.useNotificationsDeleteMutation()

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

    const handleClearNotificationsClick = async () => {
        setNotifyPage(1)

        await clearNotification()
        dispatch(setUnreadCounter(0))
        dispatch(deleteAllNotifications())
    }

    useEffect(() => {
        if (isSuccess) {
            dispatch(
                Notify({
                    id: 'clearNotification',
                    title: '',
                    message: t('notification-list-has-been-cleared'),
                    type: 'success'
                })
            )
        }
    }, [isSuccess])

    useEffect(() => {
        const unreadCount = notifyData?.items?.filter(({ read }) => !read).length

        if (unreadCount) {
            const newUnreadValue = notifyCounter - unreadCount
            dispatch(setUnreadCounter(newUnreadValue < 0 ? 0 : newUnreadValue))
        }
    }, [notifyData])

    useEffect(() => {
        const onScroll = () => {
            const targetDiv = notifyContainerRef.current
            if (!targetDiv) {
                return
            }

            const scrolledToBottom = targetDiv.scrollTop + targetDiv.clientHeight >= targetDiv.scrollHeight - 20

            if (
                notifyData?.count &&
                scrolledToBottom &&
                !notifyFetching &&
                !!notifyData.items?.length &&
                notifyData.count > notifyData.items.length
            ) {
                setNotifyPage(notifyPage + 1)
            }
        }

        const targetDiv = notifyContainerRef.current

        if (!targetDiv) {
            return
        }

        targetDiv.addEventListener('scroll', onScroll)

        return () => {
            targetDiv.removeEventListener('scroll', onScroll)
        }
    }, [notifyPage, notifyFetching, notifyData])

    return (
        <Popout
            icon={'Bell'}
            mode={'outline'}
            size={'medium'}
            className={styles.notifyPopup}
            onOpenChange={setNotifyShow}
            action={
                notifyCounter > 0 && (
                    <Counter
                        className={styles.notifyCounter}
                        value={notifyCounter}
                    />
                )
            }
        >
            <>
                {!!notifyData?.items?.length && (
                    <div
                        className={styles.notificationsContent}
                        ref={notifyContainerRef}
                    >
                        {notifyData.items.map((item) => (
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
                        <p>{t('no-notifications')}</p>
                    </div>
                )}

                <div className={styles.notifyFooter}>
                    <Button
                        size={'small'}
                        mode={'secondary'}
                        label={t('clear')}
                        stretched={true}
                        disabled={loadingClear || notifyFetching || !notifyData?.items?.length}
                        loading={loadingClear || (notifyFetching && !!notifyData?.items?.length)}
                        onClick={handleClearNotificationsClick}
                    />
                </div>
            </>
        </Popout>
    )
}

export default Notifications
