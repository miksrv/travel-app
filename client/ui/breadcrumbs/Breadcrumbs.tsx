import Link from 'next/link'
import React from 'react'

import styles from './styles.module.sass'

export type BreadcrumbLink = {
    link: string
    text: string
}

interface BreadcrumbsProps {
    hideHomePage?: boolean
    links?: BreadcrumbLink[]
    currentPage?: string
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
    hideHomePage,
    links,
    currentPage
}) => (
    <ul
        aria-label={'breadcrumb'}
        className={styles.component}
    >
        {!hideHomePage && (
            <li>
                <Link
                    color={'inherit'}
                    href={'/'}
                >
                    Главная
                </Link>
            </li>
        )}
        {!!links?.length &&
            links.map(({ link, text }) => (
                <li key={link}>
                    <Link
                        href={link}
                        color={'inherit'}
                    >
                        {text}
                    </Link>
                </li>
            ))}
        {currentPage && <li>{currentPage}</li>}
    </ul>
)

export default Breadcrumbs