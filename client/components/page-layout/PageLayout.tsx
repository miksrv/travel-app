import {
    ArticleOutlined,
    MapOutlined,
    PeopleOutline,
    PhotoOutlined,
    TerrainOutlined
} from '@mui/icons-material'
import Link from 'next/link'
import React, { useState } from 'react'

import { useAppSelector } from '@/api/store'

import Header from '@/components/header'

import { concatClassNames as cn } from '@/functions/helpers'

import styles from './styles.module.sass'

interface PageLayoutProps {
    title?: string
    breadcrumb?: string
    fullSize?: boolean
    children?: React.ReactNode
}

type MenuItemsProps = {
    link: string
    text: string
    icon?: React.ReactNode
}

const menuItems: MenuItemsProps[] = [
    {
        icon: <ArticleOutlined color={'primary'} />,
        link: '/',
        text: 'Лента активностей'
    },
    {
        icon: <TerrainOutlined color={'primary'} />,
        link: '/places',
        text: 'Интересные места'
    },
    // {
    //     icon: <PlaceOutlined color={'primary'} />,
    //     link: '/places',
    //     text: 'Населенные пункты'
    // },
    {
        icon: <MapOutlined color={'primary'} />,
        link: '/map',
        text: 'Карта мест'
    },
    // {
    //     icon: <LabelOutlined color={'primary'} />,
    //     link: '/tags',
    //     text: 'Метки мест'
    // },
    {
        icon: <PhotoOutlined color={'primary'} />,
        link: '/photos',
        text: 'Фотографии'
    },
    // {
    //     icon: <BookmarkBorderOutlined color={'primary'} />,
    //     link: '/categories',
    //     text: 'Категории'
    // },
    {
        icon: <PeopleOutline color={'primary'} />,
        link: '/users',
        text: 'Путешественники'
    }
]

const PageLayout: React.FC<PageLayoutProps> = ({
    title,
    breadcrumb,
    fullSize,
    children
}) => {
    const application = useAppSelector((store) => store.application)

    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)

    const handleCloseOverlay = () => {
        setSidebarOpen(false)
    }

    const handleOpenSideBar = () => {
        setSidebarOpen(true)
    }

    return (
        <div className={cn(styles.component, fullSize && styles.fullSize)}>
            <div
                role={'button'}
                tabIndex={0}
                className={cn(
                    styles.overlay,
                    application?.showOverlay || sidebarOpen
                        ? styles.displayed
                        : styles.hidden
                )}
                onKeyDown={handleCloseOverlay}
                onClick={handleCloseOverlay}
            />
            <Header
                fullSize={fullSize}
                title={title}
                breadcrumb={breadcrumb}
                onMenuClick={handleOpenSideBar}
            />
            <aside
                className={cn(
                    styles.sidebar,
                    sidebarOpen ? styles.opened : styles.closed
                )}
            >
                <menu className={styles.menu}>
                    {menuItems.map((item) => (
                        <li key={item.link}>
                            <Link
                                href={item.link}
                                title={item.text}
                                onClick={handleCloseOverlay}
                            >
                                {item.text}
                            </Link>
                        </li>
                    ))}
                </menu>
            </aside>
            <main className={styles.wrapper}>{children}</main>
        </div>
    )
}

export default PageLayout
