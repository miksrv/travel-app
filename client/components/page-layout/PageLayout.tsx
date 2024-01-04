import React, { useState } from 'react'

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
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const handleToggleSidebar = () => {
        setSidebarOpen(!sidebarOpen)
    }

    return (
        <div className={cn(styles.component, fullSize && styles.fullSize)}>
            {sidebarOpen && (
                <div
                    className={styles.overlay}
                    onClick={handleToggleSidebar}
                />
            )}
            <Header
                fullSize={fullSize}
                title={title}
                breadcrumb={breadcrumb}
                onMenuClick={handleToggleSidebar}
            />
            <aside
                className={`${styles.sidebar} ${
                    sidebarOpen ? styles.opened : styles.closed
                }`}
            >
                Sidebar Content
            </aside>
            <main className={styles.wrapper}>{children}</main>
        </div>
    )
}

export default PageLayout
