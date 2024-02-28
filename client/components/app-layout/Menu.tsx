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

    const dispatch = useAppDispatch()

    const menuItems: MenuItemType[] = [
        {
            icon: 'Map',
            link: '/map',
            text: t('map')
        },
        {
            icon: 'Terrain',
            link: '/places',
            text: t('places')
        },
        {
            auth: true,
            icon: 'PlusCircle',
            link: '/places/create',
            text: t('create')
        },
        {
            auth: true,
            icon: 'User',
            link: `/users/${userId}`,
            text: t('profile')
        },
        {
            icon: 'Users',
            link: '/users/',
            text: t('users')
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
            {menuItems.map((item, i) => (
                <li key={`menu${type}${i}`}>
                    <Link
                        href={item.link}
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
