import { IconTypes } from '@/ui/icon/types'

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
