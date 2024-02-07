import { TFunction, i18n } from 'next-i18next'
import React from 'react'

import { Notification } from '@/api/snackbarSlice'
import { Notification } from '@/api/types/Notification'

export const formatNotify = (
    notification: Notification | any
): Notification => ({
    content: '',
    icon: '',
    id: notification.id,
    title: 'sss'
})

const _notifyTitle = (notification: Notification): string =>
    notification.type === 'level' ? 'level' : ''
