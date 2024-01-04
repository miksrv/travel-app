import React, { useState } from 'react'

import { toggleOverlay } from '@/api/applicationSlice'
import { useAppDispatch, useAppSelector } from '@/api/store'

import Header from '@/components/header'

import { concatClassNames as cn } from '@/functions/helpers'

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
    const dispatch = useAppDispatch()
    const application = useAppSelector((store) => store.application)

    const [sidebarOpen, setSidebarOpen] = useState(false)

    const handleToggleSidebar = () => {
        dispatch(toggleOverlay(!sidebarOpen))
        setSidebarOpen(!sidebarOpen)
    }

    return (
        <div className={cn(styles.component, fullSize && styles.fullSize)}>
            <div
                className={cn(
                    styles.overlay,
                    application?.showOverlay || sidebarOpen
                        ? styles.displayed
                        : styles.hidden
                )}
                onClick={handleToggleSidebar}
            />
            <Header
                fullSize={fullSize}
                title={title}
                breadcrumb={breadcrumb}
                onMenuClick={handleToggleSidebar}
            />
            <aside
                className={cn(
                    styles.sidebar,
                    sidebarOpen ? styles.opened : styles.closed
                )}
            >
                Sidebar Content
            </aside>
            <main className={styles.wrapper}>{children}</main>
        </div>
    )
}

export default PageLayout
