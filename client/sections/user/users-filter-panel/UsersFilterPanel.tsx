import React, { useEffect, useMemo, useState } from 'react'
import debounce from 'lodash-es/debounce'
import { cn, Input, Select, SelectOptionType } from 'simple-react-ui-kit'

import { useTranslation } from 'next-i18next/pages'

import { ApiType } from '@/api'
import { UserSortFields } from '@/api/types/users'

import { UsersFilterType } from './types'

import styles from './styles.module.sass'

interface UsersFilterPanelProps {
    search?: string
    sort?: string
    order?: string
    withAvatar?: boolean
    withPlaces?: boolean
    onChange?: (key: keyof UsersFilterType, value: string | undefined) => void
    onResetAll?: () => void
}

const SEARCH_DEBOUNCE_MS = 400

export const UsersFilterPanel: React.FC<UsersFilterPanelProps> = ({
    search,
    sort,
    order,
    withAvatar,
    withPlaces,
    onChange,
    onResetAll
}) => {
    const { t } = useTranslation()

    const [searchInput, setSearchInput] = useState(search ?? '')

    useEffect(() => {
        setSearchInput(search ?? '')
    }, [search])

    const sortOptions: Array<SelectOptionType<string>> = useMemo(
        () =>
            Object.values(UserSortFields).map((s) => ({
                key: s,
                value: t(`sort_${s}`)
            })),
        [t]
    )

    const orderOptions: Array<SelectOptionType<string>> = useMemo(
        () =>
            Object.values(ApiType.SortOrders).map((o) => ({
                key: o,
                value: t(`order_${o}`)
            })),
        [t]
    )

    const handleChangeSort = (selected: Array<SelectOptionType<string>> | undefined) => {
        onChange?.('sort', selected?.[0]?.key)
    }

    const handleChangeOrder = (selected: Array<SelectOptionType<string>> | undefined) => {
        onChange?.('order', selected?.[0]?.key)
    }

    const emitSearchDebounced = useMemo(
        () =>
            debounce((value: string) => {
                onChange?.('search', value.trim() || undefined)
            }, SEARCH_DEBOUNCE_MS),
        [onChange]
    )

    useEffect(() => () => emitSearchDebounced.cancel(), [emitSearchDebounced])

    const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setSearchInput(value)
        emitSearchDebounced(value)
    }

    const toggleAvatar = () => onChange?.('withAvatar', withAvatar ? undefined : '1')
    const toggleWithPlaces = () => onChange?.('withPlaces', withPlaces ? undefined : '1')

    const hasActiveFilters = !!(search || withAvatar || withPlaces || sort || order)

    return (
        <div className={styles.component}>
            <Input
                icon={'Search'}
                clearable={true}
                placeholder={t('search-by-name')}
                value={searchInput}
                onChange={handleSearchInputChange}
            />

            <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>{t('filters')}</span>
                {hasActiveFilters && (
                    <button
                        type={'button'}
                        className={styles.resetButton}
                        onClick={() => onResetAll?.()}
                    >
                        {t('reset-all')}
                    </button>
                )}
            </div>

            <div
                className={styles.toggles}
                role={'group'}
                aria-label={t('filters')}
            >
                <button
                    type={'button'}
                    className={cn(styles.toggleRow, withAvatar && styles.toggleRowActive)}
                    onClick={toggleAvatar}
                    aria-pressed={!!withAvatar}
                >
                    <span className={styles.toggleLabel}>{t('with-avatar')}</span>
                </button>
                <button
                    type={'button'}
                    className={cn(styles.toggleRow, withPlaces && styles.toggleRowActive)}
                    onClick={toggleWithPlaces}
                    aria-pressed={!!withPlaces}
                >
                    <span className={styles.toggleLabel}>{t('with-places')}</span>
                </button>
            </div>

            <Select
                placeholder={t('sorting')}
                options={sortOptions}
                value={sort}
                onSelect={handleChangeSort}
            />

            <Select
                placeholder={t('order')}
                options={orderOptions}
                value={order}
                onSelect={handleChangeOrder}
            />
        </div>
    )
}
