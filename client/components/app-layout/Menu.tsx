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
    const { t } = useTranslation('common', {
        keyPrefix: 'components.appLayout.menu'
    })

    const dispatch = useAppDispatch()

    const menuItems: MenuItemType[] = [
        {
            auth: true,
            icon: 'PlusCircle',
            link: '/places/create',
            text: t('create')
        },
        {
            auth: true,
            icon: 'User',
            link: userId ? `/users/${userId}` : undefined,
            text: t('profile')
        },
        {
            auth: true,
            icon: 'Photo',
            link: userId ? `/users/${userId}/photos` : undefined,
            text: t('photos')
        },
        {
            icon: 'Feed',
            link: '/',
            text: t('feed')
        },
        {
            icon: 'Map',
            link: '/map',
            text: t('map')
        },
        {
            icon: 'Place',
            link: '/places',
            text: t('places')
        },
        {
            icon: 'Category',
            link: '/categories',
            text: t('categories')
        },
        {
            icon: 'Tag',
            link: '/tags',
            text: t('tags')
        },
        {
            icon: 'Users',
            link: '/users/',
            text: t('users')
        },
        {
            icon: 'Telegram',
            link: 'https://t.me/geometki',
            text: t('telegram')
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
