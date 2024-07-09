import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'next-i18next'

import styles from './styles.module.sass'

import { API } from '@/api/api'
import { useAppSelector } from '@/api/store'
import { ApiTypes } from '@/api/types'
import { PlacesFilterType } from '@/components/places-filter-panel/types'
import { categoryImage } from '@/functions/categories'
import Autocomplete from '@/ui/autocomplete'
import Dropdown, { DropdownOption } from '@/ui/dropdown'
import OptionsList from '@/ui/dropdown/OptionsList'

interface PlacesFilterPanelProps {
    sort?: ApiTypes.SortFieldsType
    order?: ApiTypes.SortOrdersType
    location?: ApiTypes.PlaceLocationType
    category?: string | null
    optionsOpen?: boolean
    onChange?: (key: keyof PlacesFilterType, value: string | number | undefined) => void
    onOpenOptions?: (title?: string) => void
    onChangeLocation?: (option?: ApiTypes.PlaceLocationType) => void
}

type OpenedOptionsType = 'sort' | 'order' | 'category' | undefined

const PlacesFilterPanel: React.FC<PlacesFilterPanelProps> = ({
    sort,
    order,
    location,
    category,
    optionsOpen,
    onChange,
    onOpenOptions,
    onChangeLocation
}) => {
    const { t } = useTranslation()

    const userLocation = useAppSelector((state) => state.application.userLocation)

    const { data: categoryData } = API.useCategoriesGetListQuery()

    const [searchAddress, { data: addressData, isLoading: addressLoading }] = API.useLocationGetSearchMutation()

    const [openedOptions, setOpenedOptions] = useState<OpenedOptionsType>(undefined)

    const sortOptions: DropdownOption[] = useMemo(
        () =>
            Object.values(ApiTypes.SortFields)
                .filter((sort) => sort !== ApiTypes.SortFields.Category)
                .map((sort) => ({
                    disabled: sort === ApiTypes.SortFields.Distance && (!userLocation?.lat || !userLocation.lon),
                    key: sort,
                    value: t(`sort_${sort}`)
                })),
        [ApiTypes.SortFields]
    )

    const orderOptions: DropdownOption[] = useMemo(
        () =>
            Object.values(ApiTypes.SortOrders).map((order) => ({
                key: order,
                value: t(`order_${order}`)
            })),
        [ApiTypes.SortOrders]
    )

    const handleChangeSort = (value: DropdownOption | undefined) => {
        onChange?.('sort', value?.key)
        setOpenedOptions(undefined)
    }

    const handleChangeOrder = (value: DropdownOption | undefined) => {
        onChange?.('order', value?.key)
        setOpenedOptions(undefined)
    }

    const handleChangeCategory = (value: DropdownOption | undefined) => {
        onChange?.('category', value?.key)
        setOpenedOptions(undefined)
    }

    const handleOpenSort = () => {
        onOpenOptions?.(t('sorting'))
        setOpenedOptions('sort')
    }

    const handleOpenOrder = () => {
        onOpenOptions?.(t('order'))
        setOpenedOptions('order')
    }

    const handleOpenOptionsCategory = () => {
        onOpenOptions?.(t('category'))
        setOpenedOptions('category')
    }

    const handleSearchLocation = (value: string) => {
        if (value.length >= 3) {
            searchAddress(value)
        }
    }

    const categoryOptions = useMemo(
        () =>
            categoryData?.items?.map((item) => ({
                image: categoryImage(item.name),
                key: item.name,
                value: item.title
            })),
        [categoryData?.items]
    )

    const locationOptions = useMemo(
        () => [
            ...(addressData?.countries?.map((item) => ({
                title: item.title,
                type: ApiTypes.LocationType.Country,
                value: item.id
            })) || []),
            ...(addressData?.regions?.map((item) => ({
                title: item.title,
                type: ApiTypes.LocationType.Region,
                value: item.id
            })) || []),
            ...(addressData?.districts?.map((item) => ({
                title: item.title,
                type: ApiTypes.LocationType.District,
                value: item.id
            })) || []),
            ...(addressData?.cities?.map((item) => ({
                title: item.title,
                type: ApiTypes.LocationType.Locality,
                value: item.id
            })) || [])
        ],
        [addressData]
    )

    const selectedSort = sortOptions.find(({ key }) => key === sort)
    const selectedOrder = orderOptions.find(({ key }) => key === order)
    const selectedCategory = categoryOptions?.find(({ key }) => key === category)

    useEffect(() => {
        if (!optionsOpen) {
            setOpenedOptions(undefined)
        }
    }, [optionsOpen])

    return (
        <div className={styles.component}>
            {openedOptions === 'sort' && (
                <OptionsList
                    selectedOption={selectedSort}
                    options={sortOptions}
                    onSelect={handleChangeSort}
                />
            )}

            {openedOptions === 'order' && (
                <OptionsList
                    selectedOption={selectedOrder}
                    options={orderOptions}
                    onSelect={handleChangeOrder}
                />
            )}

            {openedOptions === 'category' && (
                <OptionsList
                    selectedOption={selectedCategory}
                    options={categoryOptions}
                    onSelect={handleChangeCategory}
                />
            )}

            {!openedOptions && (
                <>
                    <Autocomplete
                        label={t('filter-by-location')}
                        notFoundCaption={t('nothing-found')}
                        placeholder={t('start-typing-caption')}
                        clearable={true}
                        value={location}
                        loading={addressLoading}
                        options={locationOptions}
                        onSearch={handleSearchLocation}
                        onSelect={onChangeLocation}
                    />

                    <Dropdown
                        label={t('sorting-geotags')}
                        value={selectedSort}
                        onSelect={handleChangeSort}
                        onOpen={handleOpenSort}
                    />

                    <Dropdown
                        label={t('sorting-order')}
                        value={selectedOrder}
                        onSelect={handleChangeOrder}
                        onOpen={handleOpenOrder}
                    />

                    <Dropdown
                        clearable={true}
                        value={selectedCategory}
                        label={t('filter-by-category')}
                        placeholder={t('input_category-placeholder')}
                        onSelect={handleChangeCategory}
                        onOpen={handleOpenOptionsCategory}
                    />
                </>
            )}
        </div>
    )
}

export default PlacesFilterPanel
