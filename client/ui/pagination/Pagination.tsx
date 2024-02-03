import { useTranslation } from 'next-i18next'
import Link from 'next/link'
import React, { useMemo } from 'react'

import Icon from '@/ui/icon'

import { concatClassNames as cn, encodeQueryData } from '@/functions/helpers'

import styles from './styles.module.sass'

const LEFT_PAGE = 'LEFT'
const RIGHT_PAGE = 'RIGHT'

interface PaginationProps<T> {
    currentPage?: number
    totalPostCount?: number
    linkPart?: string
    urlParam?: T
    perPage?: number
    neighbours?: number
    onChangePage?: (page: number) => void
}

const Pagination: React.FC<PaginationProps<any>> = ({
    currentPage = 1,
    totalPostCount = 0,
    linkPart,
    urlParam,
    perPage = 4,
    neighbours = 2,
    onChangePage
}) => {
    const { t } = useTranslation('common', {
        keyPrefix: 'ui.pagination'
    })

    const pageNeighbours = Math.max(0, Math.min(neighbours, 2))
    const totalPages = Math.ceil(totalPostCount / perPage)

    const link = `/${linkPart}`

    const fetchPageNumbers: (string | number)[] = useMemo(() => {
        const totalNumbers = pageNeighbours * 2 + 3
        const totalBlocks = totalNumbers + 2

        if (totalPages > totalBlocks) {
            let pages = []

            const leftBound = currentPage - pageNeighbours
            const rightBound = currentPage + pageNeighbours
            const beforeLastPage = totalPages - 1

            const startPage = leftBound > 2 ? leftBound : 2
            const endPage =
                rightBound < beforeLastPage ? rightBound : beforeLastPage

            pages = range(startPage, endPage)

            const pagesCount = pages.length
            const singleSpillOffset = totalNumbers - pagesCount - 1

            const leftSpill = startPage > 2
            const rightSpill = endPage < beforeLastPage

            const leftSpillPage = LEFT_PAGE
            const rightSpillPage = RIGHT_PAGE

            if (leftSpill && !rightSpill) {
                const extraPages = range(
                    startPage - singleSpillOffset,
                    startPage - 1
                )
                pages = [leftSpillPage, ...extraPages, ...pages]
            } else if (!leftSpill && rightSpill) {
                const extraPages = range(
                    endPage + 1,
                    endPage + singleSpillOffset
                )
                pages = [...pages, ...extraPages, rightSpillPage]
            } else if (leftSpill && rightSpill) {
                pages = [leftSpillPage, ...pages, rightSpillPage]
            }

            return [1, ...pages, totalPages]
        }

        return range(1, totalPages)
    }, [currentPage, pageNeighbours, totalPages])

    return (
        <nav
            aria-label={'Pages Pagination'}
            className={styles.pagination}
        >
            {fetchPageNumbers.map((page) => (
                <Link
                    className={cn(
                        styles.item,
                        currentPage === page ? styles.active : undefined
                    )}
                    href={
                        page === RIGHT_PAGE
                            ? `${link}${encodeQueryData({
                                  ...urlParam,
                                  page: currentPage + 1
                              })}`
                            : page === LEFT_PAGE
                            ? `${link}${encodeQueryData({
                                  ...urlParam,
                                  page: currentPage - 1
                              })}`
                            : page === 1
                            ? `${link}${encodeQueryData({
                                  ...urlParam,
                                  page: undefined
                              })}`
                            : `${link}${encodeQueryData({
                                  ...urlParam,
                                  page
                              })}`
                    }
                    title={
                        page === RIGHT_PAGE
                            ? t('nextPage')
                            : page === LEFT_PAGE
                            ? t('prevPage')
                            : `${t('page')} - ${page}`
                    }
                    key={page}
                    onClick={(event) => {
                        if (onChangePage) {
                            event.preventDefault()
                            onChangePage(Number(page))
                        }
                    }}
                >
                    {page === RIGHT_PAGE ? (
                        <Icon name={'Right'} />
                    ) : page === LEFT_PAGE ? (
                        <Icon name={'Left'} />
                    ) : (
                        <>{page}</>
                    )}
                </Link>
            ))}
        </nav>
    )
}

/**
 * Generates an array of numbers in a certain range and with a given step
 * @param from
 * @param to
 * @param step
 */
export const range = (from: number, to: number, step = 1) => {
    let i = from
    const range: number[] = []

    while (i <= to) {
        range.push(i)
        i += step
    }

    return range
}

export default Pagination
