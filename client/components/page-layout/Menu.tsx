import Link from 'next/link'
import React from 'react'

import Icon from '@/ui/icon'
import { IconTypes } from '@/ui/icon/types'

import { useAppSelector } from '@/api/store'

import styles from './styles.module.sass'

export type MenuItemType = {
    icon?: IconTypes
    link: string
    text: string
}

interface MenuProps {
    onClick?: () => void
}

const Menu: React.FC<MenuProps> = ({ onClick }) => {
    const authSlice = useAppSelector((state) => state.auth)

    const menuItems: MenuItemType[] = [
        {
            icon: 'User',
            link: authSlice.isAuth ? `/users/${authSlice?.user?.id}` : '/login',
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
            link: '/places/create',
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
            {menuItems.map((item) => (
                <li key={item.link}>
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
