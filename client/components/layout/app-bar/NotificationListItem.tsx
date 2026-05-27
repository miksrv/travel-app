import React from 'react'
import { cn } from 'simple-react-ui-kit'

import Link from 'next/link'
import { useTranslation } from 'next-i18next/pages'

import { ApiModel } from '@/api'
import { ActivityType } from '@/api/types'
import { formatDate } from '@/utils/helpers'

import { NotificationIcon } from '../snackbar/NotificationIcon'

import styles from './styles.module.sass'

const NO_ICON_TYPES = new Set(['success', 'error', 'warning', 'info'])

export const NotificationListItem: React.FC<ApiModel.Notification> = (props) => {
    const { t } = useTranslation()

    const getActivityTitle = (type?: ActivityType): string => {
        switch (type) {
            case 'photo':
                return t('notification_photo', { defaultValue: 'Загружена новая фотография' })
            case 'place':
                return t('notification_place', { defaultValue: 'Добавлена новая геометка' })
            case 'rating':
                return t('notification_rating', { defaultValue: 'Поставлена новая оценка' })
            case 'edit':
                return t('notification_edit', { defaultValue: 'Отредактирована геометка' })
            case 'cover':
                return t('notification_cover', { defaultValue: 'Изменена обложка' })
            case 'level':
                return t('notification_level', { defaultValue: 'Новый уровень!' })
            case 'achievements':
                return t('notification_achievements', { defaultValue: 'Новое достижение' })
            case 'warning':
                return t('notification_warning', { defaultValue: 'Предупреждение' })
            case 'error':
                return t('notification_error', { defaultValue: 'Ошибка' })
            case undefined:
            case 'experience':
            case 'success':
            default:
                return ''
        }
    }

    const title = (() => {
        if (typeof props.title !== 'undefined') {
            return props.title
        }
        if (props.type === 'experience') {
            return getActivityTitle(props.activity)
        }
        if (props.activity) {
            return getActivityTitle(props.activity)
        }
        return getActivityTitle(props.type)
    })()

    const content = (() => {
        if (props.type === 'experience') {
            return `+${props.meta?.value} ${t('notification_experience', { defaultValue: 'опыта' })}`
        }
        if (props.type === 'level') {
            return `${props.meta?.title} (${props.meta?.level})`
        }
        if (props.type === 'achievements') {
            return props.meta?.title ?? ''
        }
        if (props.place) {
            return (
                <Link
                    href={`/places/${props.place.id}`}
                    title={props.place.title}
                >
                    {props.place.title}
                </Link>
            )
        }
        return props.message ?? ''
    })()

    const hideIcon = NO_ICON_TYPES.has(props.type ?? '')

    return (
        <div className={cn(styles.notifyItem, !props.read && styles.notifyItemUnread)}>
            {!hideIcon && (
                <div className={styles.notifyItemIcon}>
                    <NotificationIcon {...props} />
                </div>
            )}
            <div className={styles.notifyItemBody}>
                {!!title && <span className={styles.notifyItemTitle}>{title}</span>}
                {!!content && <span className={styles.notifyItemContent}>{content}</span>}
                <span className={styles.notifyItemDate}>{formatDate(props.created?.date, t('date-time-format'))}</span>
            </div>
        </div>
    )
}
