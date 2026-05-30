import React, { useCallback, useEffect, useMemo, useState } from 'react'
import debounce from 'lodash-es/debounce'
import { Button, cn, Input, Select, SelectOptionType } from 'simple-react-ui-kit'

import Image from 'next/image'
import { useTranslation } from 'next-i18next/pages'

import { API, ApiModel, ApiType } from '@/api'
import { useAppSelector } from '@/app/store'
import { categoryImage } from '@/utils/categories'

import { PlacesFilterType } from './types'

import styles from './styles.module.sass'

interface PlaceFilterPanelProps {
    sort?: ApiType.SortFieldsType
    order?: ApiType.SortOrdersType
    location?: ApiModel.AddressItem
    /** Selected categories (multi). */
    categories?: string[]
    /** Free-text search query (matched against place titles). */
    search?: string
    /** When true, the bookmarks-only scope is active. */
    bookmarksOnly?: boolean
    onChange?: (key: keyof PlacesFilterType, value: string | number | undefined) => void
    onChangeLocation?: (location?: ApiModel.AddressItem) => void
    onChangeCategories?: (categories: string[]) => void
    onChangeSearch?: (search: string) => void
    onChangeBookmarksOnly?: (bookmarksOnly: boolean) => void
    onResetAll?: () => void
}

const SEARCH_DEBOUNCE_MS = 400
const CATEGORIES_DEBOUNCE_MS = 500

export const PlaceFilterPanel: React.FC<PlaceFilterPanelProps> = ({
    sort,
    order,
    location,
    categories = [],
    search,
    bookmarksOnly,
    onChange,
    onChangeLocation,
    onChangeCategories,
    onChangeSearch,
    onChangeBookmarksOnly,
    onResetAll
}) => {
    const { t } = useTranslation()

    const userLocation = useAppSelector((state) => state.application.userLocation)
    const isAuth = useAppSelector((state) => state.auth.isAuth)

    const { data: categoryData } = API.useCategoriesGetListQuery({ places: true, counts: true })

    const [searchAddress, { data: addressData, isLoading: addressLoading }] = API.useLocationGetSearchMutation()

    // Local input state lets the user type without re-renders triggering server fetches on each keypress.
    const [searchInput, setSearchInput] = useState(search ?? '')

    useEffect(() => {
        setSearchInput(search ?? '')
    }, [search])

    const sortOptions: Array<SelectOptionType<string>> = useMemo(
        () =>
            Object.values(ApiType.SortFields)
                .filter((s) => s !== ApiType.SortFields.Category)
                .filter((s) => !(s === ApiType.SortFields.Recommended && !isAuth))
                .filter((s) => !(s === ApiType.SortFields.Trending && isAuth))
                .map((s) => ({
                    disabled: s === ApiType.SortFields.Distance && (!userLocation?.lat || !userLocation.lon),
                    key: s,
                    value: t(`sort_${s}`)
                })),
        [isAuth, userLocation]
    )

    const orderOptions: Array<SelectOptionType<string>> = useMemo(
        () => Object.values(ApiType.SortOrders).map((o) => ({ key: o, value: t(`order_${o}`) })),
        []
    )

    const locationOptions: Array<SelectOptionType<string>> = useMemo(() => {
        const results: Array<SelectOptionType<string>> = [
            ...(addressData?.countries?.map((item) => ({ key: `country:${item.id}`, value: item.name })) ?? []),
            ...(addressData?.regions?.map((item) => ({ key: `region:${item.id}`, value: item.name })) ?? []),
            ...(addressData?.districts?.map((item) => ({ key: `district:${item.id}`, value: item.name })) ?? []),
            ...(addressData?.cities?.map((item) => ({ key: `locality:${item.id}`, value: item.name })) ?? [])
        ]

        if (location?.id && location?.name && location?.type) {
            const currentKey = `${location.type}:${location.id}`
            if (!results.find((o) => o.key === currentKey)) {
                results.unshift({ key: currentKey, value: location.name })
            }
        }

        return results
    }, [addressData, location])

    const handleChangeSort = (selected: Array<SelectOptionType<string>> | undefined) => {
        onChange?.('sort', selected?.[0]?.key)
    }

    const handleChangeOrder = (selected: Array<SelectOptionType<string>> | undefined) => {
        onChange?.('order', selected?.[0]?.key)
    }

    const handleChangeLocation = (selected: Array<SelectOptionType<string>> | undefined) => {
        const item = selected?.[0]
        if (!item) {
            onChangeLocation?.(undefined)
            return
        }
        const colonIndex = item.key.indexOf(':')
        const type = item.key.slice(0, colonIndex) as ApiType.LocationTypes
        const id = parseInt(item.key.slice(colonIndex + 1), 10)
        onChangeLocation?.({ id, name: item.value, type })
    }

    const handleSearchLocation = useCallback(
        debounce(async (text?: string) => {
            if (text && text.length >= 3) {
                await searchAddress(text)
            }
        }, 600),
        []
    )

    const emitSearchDebounced = useMemo(
        () =>
            debounce((value: string) => {
                onChangeSearch?.(value.trim())
            }, SEARCH_DEBOUNCE_MS),
        [onChangeSearch]
    )

    useEffect(() => () => emitSearchDebounced.cancel(), [emitSearchDebounced])

    const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setSearchInput(value)
        emitSearchDebounced(value)
    }

    // Buffer rapid category clicks locally; only push the merged result to the parent (and URL) once
    // the user pauses, so toggling several categories in a row produces one fetch instead of many.
    const [pendingCategories, setPendingCategories] = useState<string[]>(categories)

    useEffect(() => {
        setPendingCategories(categories)
    }, [categories])

    const emitCategoriesDebounced = useMemo(
        () =>
            debounce((next: string[]) => {
                onChangeCategories?.(next)
            }, CATEGORIES_DEBOUNCE_MS),
        [onChangeCategories]
    )

    useEffect(() => () => emitCategoriesDebounced.cancel(), [emitCategoriesDebounced])

    const toggleCategory = (name: string) => {
        const next = pendingCategories.includes(name)
            ? pendingCategories.filter((c) => c !== name)
            : [...pendingCategories, name]
        setPendingCategories(next)
        emitCategoriesDebounced(next)
    }

    const handleResetAll = () => {
        emitCategoriesDebounced.cancel()
        setPendingCategories([])
        onResetAll?.()
    }

    const totalCount = categoryData?.count
    const bookmarksCount = categoryData?.bookmarksCount

    const hasActiveFilters = !!(search || bookmarksOnly || pendingCategories.length > 0 || location || sort || order)

    return (
        <div className={styles.component}>
            <Input
                icon={'Search'}
                clearable={true}
                placeholder={t('search-places-placeholder')}
                value={searchInput}
                onChange={handleSearchInputChange}
            />

            {isAuth && (
                <div
                    className={styles.scopeToggle}
                    role={'group'}
                    aria-label={t('filter-scope')}
                >
                    <Button
                        stretched={true}
                        mode={!bookmarksOnly ? 'primary' : 'secondary'}
                        className={styles.scopeButton}
                        onClick={() => onChangeBookmarksOnly?.(false)}
                    >
                        <span className={styles.scopeLabel}>{t('all-places')}</span>
                        {typeof totalCount === 'number' && (
                            <span className={cn(styles.scopeCount, !bookmarksOnly && styles.scopeCountActive)}>
                                {totalCount.toLocaleString()}
                            </span>
                        )}
                    </Button>
                    <Button
                        stretched={true}
                        mode={bookmarksOnly ? 'primary' : 'secondary'}
                        className={styles.scopeButton}
                        onClick={() => onChangeBookmarksOnly?.(true)}
                    >
                        <span className={styles.scopeLabel}>{t('favorites')}</span>
                        {typeof bookmarksCount === 'number' && (
                            <span className={cn(styles.scopeCount, bookmarksOnly && styles.scopeCountActive)}>
                                {bookmarksCount.toLocaleString()}
                            </span>
                        )}
                    </Button>
                </div>
            )}

            <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>{t('filters')}</span>
                {hasActiveFilters && (
                    <button
                        type={'button'}
                        className={styles.resetButton}
                        onClick={handleResetAll}
                    >
                        {t('reset-all')}
                    </button>
                )}
            </div>

            <div className={styles.categoriesGroup}>
                <div className={styles.categoriesTitle}>{t('categories')}</div>
                <ul className={styles.categoryList}>
                    {categoryData?.items?.map((item) => {
                        const active = pendingCategories.includes(item.name)
                        return (
                            <li key={item.name}>
                                <button
                                    type={'button'}
                                    className={cn(styles.categoryRow, active && styles.categoryRowActive)}
                                    onClick={() => toggleCategory(item.name)}
                                    aria-pressed={active}
                                >
                                    <Image
                                        src={categoryImage(item.name as ApiModel.Categories).src}
                                        width={20}
                                        height={20}
                                        alt={''}
                                        className={styles.categoryIcon}
                                    />
                                    <span className={styles.categoryName}>{item.title}</span>
                                    {typeof item.count === 'number' && (
                                        <span className={styles.categoryCount}>{item.count.toLocaleString()}</span>
                                    )}
                                </button>
                            </li>
                        )
                    })}
                </ul>
            </div>

            <Select
                searchable={true}
                clearable={true}
                loading={addressLoading}
                placeholder={t('filter-by-location')}
                notFoundCaption={t('nothing-found')}
                options={locationOptions}
                value={location?.id && location?.type ? `${location.type}:${location.id}` : undefined}
                onSearch={handleSearchLocation}
                onSelect={handleChangeLocation}
            />

            <Select
                placeholder={t('sorting-geotags')}
                options={sortOptions}
                value={sort}
                onSelect={handleChangeSort}
            />

            {sort !== ApiType.SortFields.Recommended && (
                <Select
                    placeholder={t('sorting-order')}
                    options={orderOptions}
                    value={order}
                    onSelect={handleChangeOrder}
                />
            )}
        </div>
    )
}
