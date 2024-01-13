import React, { useEffect, useState } from 'react'

import { useAppSelector } from '@/api/store'

import Footer from '@/components/footer'
import Header from '@/components/header'

import { concatClassNames as cn } from '@/functions/helpers'

import Menu from './Menu'
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
                <Menu onClick={handleCloseOverlay} />
            </aside>
            <section className={styles.mainContainer}>
                <aside className={styles.menubar}>
                    <Menu />
                    <Footer />
                </aside>
                <main className={styles.main}>{children}</main>
            </section>
        </div>
    )
}

export default PageLayout
