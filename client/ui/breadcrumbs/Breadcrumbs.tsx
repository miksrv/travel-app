import React from 'react'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'

import styles from './styles.module.sass'

import { concatClassNames as cn } from '@/functions/helpers'

export type BreadcrumbLink = {
    link: string
    text: string
}

export interface BreadcrumbsProps {
    hideHomePage?: boolean
    currentPage?: string
    className?: string
    links?: BreadcrumbLink[]
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
    hideHomePage,
    links,
    className,
    currentPage
}) => {
    const { t } = useTranslation('common', {
        keyPrefix: 'ui.breadcrumbs'
    })

    return (
        <ul
            aria-label={'breadcrumb'}
            className={cn(className, styles.breadcrumbs)}
        >
            {!hideHomePage && (
                <li>
                    <Link
                        color={'inherit'}
                        href={'/'}
                        title={t('homepage')}
                    >
                        {t('homepage')}
                    </Link>
                </li>
            )}
            {!!links?.length &&
                links.map(({ link, text }) => (
                    <li key={link}>
                        <Link
                            href={link}
                            color={'inherit'}
                            title={text}
                        >
                            {text}
                        </Link>
                    </li>
                ))}
            {currentPage && <li>{currentPage}</li>}
        </ul>
    )
}

export default Breadcrumbs
