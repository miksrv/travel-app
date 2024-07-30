import React from 'react'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'

import styles from './styles.module.sass'

import { openAuthDialog } from '@/api/applicationSlice'
import { useAppDispatch } from '@/api/store'
import Icon from '@/ui/icon'
import { IconTypes } from '@/ui/icon/types'

export type MenuItemType = {
    icon?: IconTypes
    auth?: boolean
    link?: string
    text: string
}

interface MenuProps {
    type?: 'mobile' | 'desktop'
    userId?: string
    isAuth?: boolean
    onClick?: () => void
}

const Menu: React.FC<MenuProps> = ({ type, userId, isAuth, onClick }) => {
    const { t } = useTranslation('common')

    const dispatch = useAppDispatch()

    const menuItems: MenuItemType[] = [
        {
            icon: 'Feed',
            link: '/',
            text: t('geotags')
        },
        {
            auth: true,
            icon: 'PlusCircle',
            link: '/places/create',
            text: t('create-geotag')
        },
        {
            auth: true,
            icon: 'User',
            link: userId ? `/users/${userId}` : undefined,
            text: t('my-page')
        },
        {
            auth: true,
            icon: 'Photo',
            link: userId ? `/users/${userId}/photos` : undefined,
            text: t('my-photos')
        },
        {
            icon: 'Map',
            link: '/map',
            text: t('map-of-geotags')
        },
        {
            icon: 'Place',
            link: '/places',
            text: t('interesting-places')
        },
        {
            icon: 'Category',
            link: '/categories',
            text: t('categories')
        },
        {
            icon: 'Tag',
            link: '/tags',
            text: t('hashtags')
        },
        {
            icon: 'Users',
            link: '/users/',
            text: t('users')
        },
        {
            // TODO Add new param - target for link
            icon: 'Telegram',
            link: 'https://t.me/geometki',
            text: t('project-diary')
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

export default Menu
