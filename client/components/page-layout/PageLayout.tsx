import React from 'react'

import Header from '@/components/header'

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
    return (
        <div
            className={`${styles.component} ${
                fullSize ? styles.fullSize : undefined
            }`}
        >
            <Header
                fullSize={fullSize}
                title={title}
                breadcrumb={breadcrumb}
            />
            <main className={styles.wrapper}>{children}</main>
        </div>
    )
}

export default PageLayout
