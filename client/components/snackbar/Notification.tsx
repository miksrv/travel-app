import { useTranslation } from 'next-i18next'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import Icon from '@/ui/icon'

import { IMG_HOST } from '@/api/api'
import { Notification as NotificationType } from '@/api/types/Notification'

import { concatClassNames as cn, formatDate } from '@/functions/helpers'
import { levelImage } from '@/functions/userLevels'

import styles from './styles.module.sass'

interface NotificationProps extends NotificationType {
    showDate?: boolean
    onClose?: (id: string) => void
    onLoad?: (id: string) => void
}

const Notification: React.FC<NotificationProps> = ({
    showDate,
    onClose,
    onLoad,
    ...props
}) => {
    const { t } = useTranslation('common', {
        keyPrefix: 'components.notification'
    })

    React.useEffect(() => {
        onLoad?.(props.id)
    }, [])

    return (
        <div
            className={cn(
                styles.notification,
                styles[props?.type!],
                !props?.read && styles.unread
            )}
        >
            <div className={cn(styles.before)}>
                <NotificationIcon {...props} />
            </div>
            <div className={styles.body}>
                <span className={styles.title}>
                    {props.type === 'experience'
                        ? t(props?.activity!)
                        : t(props?.type!)}
                </span>
                <span className={styles.content}>
                    {props?.message}
                    {props.type === 'experience' ? (
                        `+${props?.meta?.value} ${t('experience')}`
                    ) : props.type === 'level' ? (
                        `${props?.meta?.title} (${props?.meta?.level})`
                    ) : props.type === 'achievements' ? (
                        '' // TODO
                    ) : props.place ? (
                        <Link
                            href={`/places/${props.place?.id}`}
                            title={''}
                        >
                            {props.place?.title}
                        </Link>
                    ) : (
                        <></>
                    )}
                </span>
                {showDate && (
                    <div className={styles.datetime}>
                        {formatDate(props.created?.date, t('dateFormat'))}
                    </div>
                )}
            </div>
            {onClose && (
                <button
                    className={styles.closeButton}
                    onClick={() => onClose?.(props.id)}
                >
                    <Icon name={'Close'} />
                </button>
            )}
        </div>
    )
}

const NotificationIcon: React.FC<NotificationType> = ({
    ...props
}): React.ReactNode =>
    props.type === 'experience' ? (
        <Icon name={'DoubleUp'} />
    ) : props.type === 'error' ? (
        <Icon name={'ReportError'} />
    ) : props.type === 'success' ? (
        <Icon name={'CheckCircle'} />
    ) : props.type === 'level' ? (
        <Image
            src={levelImage(props?.meta?.level)?.src}
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
