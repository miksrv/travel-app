import { Breadcrumbs as MuiBreadcrumbs } from '@mui/material'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import React from 'react'

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
}) => {
    return (
        <MuiBreadcrumbs aria-label={'breadcrumb'}>
            {!hideHomePage && (
                <Link
                    color={'inherit'}
                    href={'/'}
                >
                    Главная
                </Link>
            )}
            {!!links?.length &&
                links.map(({ link, text }) => (
                    <Link
                        color={'inherit'}
                        href={link}
                    >
                        {text}
                    </Link>
                ))}
            {currentPage && (
                <Typography variant={'caption'}>{currentPage}</Typography>
            )}
        </MuiBreadcrumbs>
    )
}

export default Breadcrumbs
