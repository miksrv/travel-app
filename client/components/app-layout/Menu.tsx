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
    const menuItems: MenuItemType[] = [
        {
            icon: 'User',
            link: isAuth ? `/users/${userId}` : '/login',
            text: 'Моя страница'
        },
        {
            icon: 'Map',
            link: '/',
            text: 'Карта интересных мест'
        },
        {
            icon: 'Terrain',
            link: '/places',
            text: 'Интересные места'
        },
        {
            icon: 'PlusCircle',
            link: isAuth ? '/places/create' : '/login',
            text: 'Добавить место'
        },
        {
            icon: 'Users',
            link: '/users/',
            text: 'Путешественники'
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
