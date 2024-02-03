import { useTranslation } from 'next-i18next'
import Link from 'next/link'
import React from 'react'

import Icon from '@/ui/icon'
import { IconTypes } from '@/ui/icon/types'

import styles from './styles.module.sass'

export type MenuItemType = {
    icon?: IconTypes
    link: string
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

    const menuItems: MenuItemType[] = [
        {
            icon: 'Map',
            link: '/',
            text: t('index')
        },
        {
            icon: 'Terrain',
            link: '/places',
            text: t('places')
        },
        {
            icon: 'PlusCircle',
            link: isAuth ? '/places/create' : '/login',
            text: t('create')
        },
        {
            icon: 'User',
            link: isAuth ? `/users/${userId}` : '/login',
            text: t('profile')
        },
        {
            icon: 'Users',
            link: '/users/',
            text: t('users')
        }
    ]

    return (
        <menu className={styles.menu}>
            {menuItems.map((item, i) => (
                <li key={`menu${type}${i}`}>
                    <Link
                        href={item.link}
                        title={item.text}
                        onClick={onClick}
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
