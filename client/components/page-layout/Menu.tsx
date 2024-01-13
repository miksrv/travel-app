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

export const menuItems: MenuItemType[] = [
    {
        icon: 'Map',
        link: '/',
        text: 'Карта интересных мест'
    },
    {
        icon: 'Terrain',
        link: '/places',
        text: 'Интересные места'
    }
]

interface MenuProps {
    onClick?: () => void
}

const Menu: React.FC<MenuProps> = ({ onClick }) => (
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

export default Menu
