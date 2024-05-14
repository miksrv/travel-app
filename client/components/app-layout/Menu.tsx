import { useTranslation } from 'next-i18next'
import Link from 'next/link'
import React from 'react'

import Icon from '@/ui/icon'
import { IconTypes } from '@/ui/icon/types'

import { openAuthDialog } from '@/api/applicationSlice'
import { useAppDispatch } from '@/api/store'

import styles from './styles.module.sass'

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

const KEY = 'components.appLayout.menu.'

const Menu: React.FC<MenuProps> = ({ type, userId, isAuth, onClick }) => {
    const { t } = useTranslation()

    const dispatch = useAppDispatch()

    const menuItems: MenuItemType[] = [
        {
            auth: true,
            icon: 'User',
            link: userId ? `/users/${userId}` : undefined,
            text: t(`${KEY}profile`)
        },
        {
            auth: true,
            icon: 'Photo',
            link: userId ? `/users/${userId}/photos` : undefined,
            text: t(`${KEY}photos`)
        },
        {
            icon: 'Feed',
            link: '/',
            text: t(`${KEY}feed`)
        },
        {
            icon: 'Map',
            link: '/map',
            text: t(`${KEY}map`)
        },
        {
            icon: 'Place',
            link: '/places',
            text: t(`${KEY}places`)
        },
        {
            auth: true,
            icon: 'PlusCircle',
            link: '/places/create',
            text: t(`${KEY}create`)
        },
        {
            icon: 'Category',
            link: '/categories',
            text: t(`${KEY}categories`)
        },
        {
            icon: 'Tag',
            link: '/tags',
            text: t(`${KEY}tags`)
        },
        {
            icon: 'Users',
            link: '/users/',
            text: t(`${KEY}users`)
        },
        {
            icon: 'Telegram',
            link: 'https://t.me/geometki',
            text: t(`${KEY}telegram`)
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
                ?.map((item, i) => (
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
