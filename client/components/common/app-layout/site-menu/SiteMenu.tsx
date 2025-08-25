import React from 'react'
import { Icon, IconTypes } from 'simple-react-ui-kit'

import Link from 'next/link'
import { useTranslation } from 'next-i18next'

import { useAppDispatch } from '@/api'
import { openAuthDialog } from '@/api/applicationSlice'

import styles from './styles.module.sass'

type MenuItemType = {
    icon?: IconTypes
    auth?: boolean
    link?: string
    text: string
}

interface SiteMenuProps {
    type?: 'mobile' | 'desktop'
    userId?: string
    isAuth?: boolean
    onClick?: () => void
}

export const SiteMenu: React.FC<SiteMenuProps> = ({ type, userId, isAuth, onClick }) => {
    const { t } = useTranslation('navigation')

    const dispatch = useAppDispatch()

    const menuItems: MenuItemType[] = [
        {
            icon: 'Feed',
            link: '/',
            text: t('geotags', { defaultValue: 'Геометки' })
        },
        {
            auth: true,
            icon: 'PlusCircle',
            link: '/places/create',
            text: t('create-geotag', { defaultValue: 'Добавить геометку' })
        },
        {
            auth: true,
            icon: 'User',
            link: userId ? `/users/${userId}` : undefined,
            text: t('my-page', { defaultValue: 'Моя страница' })
        },
        {
            auth: true,
            icon: 'Photo',
            link: userId ? `/users/${userId}/photos` : undefined,
            text: t('my-photos', { defaultValue: 'Мои фотографии' })
        },
        {
            icon: 'Map',
            link: '/map',
            text: t('map-of-geotags', { defaultValue: 'Карта геометок' })
        },
        {
            icon: 'Point',
            link: '/places',
            text: t('interesting-places', { defaultValue: 'Интересные места' })
        },
        {
            icon: 'Bookmark',
            link: '/categories',
            text: t('categories', { defaultValue: 'Категории' })
        },
        {
            icon: 'Tag',
            link: '/tags',
            text: t('hashtags', { defaultValue: 'Хештеги' })
        },
        {
            icon: 'Users',
            link: '/users/',
            text: t('users', { defaultValue: 'Пользователи' })
        },
        {
            icon: 'Telegram',
            link: 'https://t.me/geometki',
            text: t('project-diary', { defaultValue: 'Дневник проекта' })
        }
    ]

    const handleClick = (event: React.MouseEvent, item: MenuItemType) => {
        if (item.auth && !isAuth) {
            event.preventDefault()
            dispatch(openAuthDialog())
        }

        onClick?.()
    }

    return (
        <menu className={styles.menu}>
            {menuItems
                .filter(({ link }) => !!link)
                .map((item, i) => (
                    <li key={`menu${type}${i}`}>
                        <Link
                            href={item.link!}
                            title={item.text}
                            onClick={(event) => handleClick(event, item)}
                        >
                            {item.icon && <Icon name={item.icon} />}
                            {item.text}
                        </Link>
                    </li>
                ))}
        </menu>
    )
}
