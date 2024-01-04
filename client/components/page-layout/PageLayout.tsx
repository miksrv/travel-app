import Link from 'next/link'
import React, { useState } from 'react'

import Icon from '@/ui/icon'

import { useAppSelector } from '@/api/store'

import Header from '@/components/header'

import { concatClassNames as cn } from '@/functions/helpers'

import { menuItems } from './menu'
import styles from './styles.module.sass'

interface PageLayoutProps {
    title?: string
    breadcrumb?: string
    fullSize?: boolean
    children?: React.ReactNode
}

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
                                {item.icon && <Icon name={item.icon} />}
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
