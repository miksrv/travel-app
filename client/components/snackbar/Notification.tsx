import React from 'react'
import { cn, Icon } from 'simple-react-ui-kit'

import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'

import { ApiModel, IMG_HOST } from '@/api'
import { formatDate } from '@/functions/helpers'
import { levelImage } from '@/functions/userLevels'

import styles from './styles.module.sass'

interface NotificationProps extends ApiModel.Notification {
    showDate?: boolean
    onClose?: (id: string) => void
    onLoad?: (id: string) => void
}

const Notification: React.FC<NotificationProps> = ({ showDate, onClose, onLoad, ...props }) => {
    const { t } = useTranslation()

    React.useEffect(() => {
        onLoad?.(props.id)
    }, [])

    return (
        <div
            className={cn(
                styles.notification,
                styles[props.type!],
                !props.read && styles.unread,
                typeof props.title !== 'undefined' && !props.title?.length ? styles.noTitle : ''
            )}
        >
            <div className={cn(styles.before)}>
                <NotificationIcon {...props} />
            </div>
            <div className={styles.body}>
                <span className={styles.title}>
                    {typeof props.title !== 'undefined'
                        ? props.title
                        : props.type === 'experience'
                          ? props.activity
                              ? t(`notification_${props.activity}`)
                              : ''
                          : props.type
                            ? t(props.type)
                            : ''}
                </span>
                <span className={styles.content}>
                    {props.message}
                    {props.type === 'experience' ? (
                        `+${props.meta?.value} ${t('notification_experience')}`
                    ) : props.type === 'level' ? (
                        `${props.meta?.title} (${props.meta?.level})`
                    ) : props.type === 'achievements' ? (
                        '' // TODO
                    ) : props.place ? (
                        <Link
                            href={`/places/${props.place.id}`}
                            title={''}
                        >
                            {props.place.title}
                        </Link>
                    ) : (
                        <></>
                    )}
                </span>
                {showDate && (
                    <div className={styles.datetime}>{formatDate(props.created?.date, t('date-time-format'))}</div>
                )}
            </div>
            {onClose && (
                <button
                    className={styles.closeButton}
                    onClick={() => onClose(props.id)}
                >
                    <Icon name={'Close'} />
                </button>
            )}
        </div>
    )
}

const NotificationIcon: React.FC<ApiModel.Notification> = ({ ...props }): React.ReactNode =>
    props.type === 'experience' ? (
        <Icon name={'DoubleUp'} />
    ) : props.type === 'error' ? (
        <Icon name={'ReportError'} />
    ) : props.type === 'success' ? (
        <Icon name={'CheckCircle'} />
    ) : props.type === 'level' ? (
        <Image
            src={levelImage(props.meta?.level).src}
            alt={''}
            width={26}
            height={26}
        />
    ) : props.place ? (
        <Image
            className={styles.placeImage}
            src={`${IMG_HOST}${props.place.cover?.preview}`}
            alt={''}
            width={50}
            height={42}
            style={{
                height: '100%',
                objectFit: 'cover'
            }}
        />
    ) : (
        <></>
    )

export default Notification
