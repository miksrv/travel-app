import Link from 'next/link'
import React, { useEffect, useState } from 'react'

import Icon from '@/ui/icon'

import { useAppSelector } from '@/api/store'

import Footer from '@/components/footer'
import Header from '@/components/header'

import { concatClassNames as cn } from '@/functions/helpers'

import { menuItems } from './menu'
import styles from './styles.module.sass'

interface PageLayoutProps {
    randomPlaceId?: string
    fullSize?: boolean
    children?: React.ReactNode
}

const PageLayout: React.FC<PageLayoutProps> = ({
    randomPlaceId,
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

    useEffect(() => {
        if (application?.showOverlay || sidebarOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'auto'
        }

        return () => {
            document.body.style.overflow = 'auto'
        }
    }, [application?.showOverlay, sidebarOpen])

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
                randomPlaceId={randomPlaceId}
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
            <Footer />
        </div>
    )
}

export default PageLayout
