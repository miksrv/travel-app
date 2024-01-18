import React, { useEffect, useMemo, useState } from 'react'

import Autocomplete from '@/ui/autocomplete'
import Dropdown, { DropdownOption } from '@/ui/dropdown'
import OptionsList from '@/ui/dropdown/OptionsList'

import { API } from '@/api/api'
import { ApiTypes } from '@/api/types'

import { PlacesFilterType } from '@/components/places-filter-panel/types'

import { categoryImage } from '@/functions/categories'

import styles from './styles.module.sass'

interface PlacesFilterPanelProps {
    sort?: ApiTypes.SortFields
    order?: ApiTypes.SortOrder
    location?: ApiTypes.PlaceLocationType
    category?: string | null
    optionsOpen?: boolean
    onChange?: (
        key: keyof PlacesFilterType,
        value: string | number | undefined
    ) => void
    onOpenOptions?: (open: boolean) => void
    onChangeLocation?: (value?: ApiTypes.PlaceLocationType) => void
}

const sortOptions: DropdownOption[] = [
    {
        key: ApiTypes.SortFields.Views,
        value: 'Просмотры'
    },
    {
        key: ApiTypes.SortFields.Rating,
        value: 'Рейтинг'
    },
    {
        key: ApiTypes.SortFields.Created,
        value: 'Дата добавления'
    },
    {
        key: ApiTypes.SortFields.Updated,
        value: 'Дата обновления'
    },
    {
        key: ApiTypes.SortFields.Title,
        value: 'Заголовок'
    },
    {
        key: ApiTypes.SortFields.Distance,
        value: 'Расстояние'
    }
]

const orderOptions: DropdownOption[] = [
    {
        key: ApiTypes.SortOrder.ASC,
        value: 'По возрастанию'
    },
    {
        key: ApiTypes.SortOrder.DESC,
        value: 'По убыванию'
    }
]

type OpenedOptionsType = 'sort' | 'order' | 'category' | undefined

const PlacesFilterPanel: React.FC<PlacesFilterPanelProps> = (props) => {
    const {
        sort,
        order,
        location,
        category,
        optionsOpen,
        onChange,
        onOpenOptions,
        onChangeLocation
    } = props

    const { data: categoryData } = API.useCategoriesGetListQuery()

    const [searchAddress, { data: addressData, isLoading: addressLoading }] =
        API.useAddressGetSearchMutation()

    const [openedOptions, setOpenedOptions] =
        useState<OpenedOptionsType>(undefined)

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
        onOpenOptions?.(true)
        setOpenedOptions('sort')
    }

    const handleOpenOrder = () => {
        onOpenOptions?.(true)
        setOpenedOptions('order')
    }

    const handleOpenOptionsCategory = () => {
        onOpenOptions?.(true)
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
                key: item.id,
                type: ApiTypes.LocationType.Country,
                value: item.name
            })) || []),
            ...(addressData?.regions?.map((item) => ({
                key: item.id,
                type: ApiTypes.LocationType.Region,
                value: item.name
            })) || []),
            ...(addressData?.districts?.map((item) => ({
                key: item.id,
                type: ApiTypes.LocationType.District,
                value: item.name
            })) || []),
            ...(addressData?.cities?.map((item) => ({
                key: item.id,
                type: ApiTypes.LocationType.City,
                value: item.name
            })) || [])
        ],
        [addressData]
    )

    const selectedSort = sortOptions?.find(({ key }) => key === sort)
    const selectedOrder = orderOptions?.find(({ key }) => key === order)
    const selectedCategory = categoryOptions?.find(
        ({ key }) => key === category
    )

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
                        label={'Фильтровать по местоположению'}
                        placeholder={'Начните вводить название'}
                        clearable={true}
                        value={location}
                        loading={addressLoading}
                        options={locationOptions}
                        onSearch={handleSearchLocation}
                        onSelect={onChangeLocation}
                    />

                    <Dropdown
                        label={'Сортировка мест'}
                        value={selectedSort}
                        onSelect={handleChangeSort}
                        onOpen={handleOpenSort}
                    />

                    <Dropdown
                        label={'Порядок сортировки'}
                        value={selectedOrder}
                        onSelect={handleChangeOrder}
                        onOpen={handleOpenOrder}
                    />

                    <Dropdown
                        clearable={true}
                        value={selectedCategory}
                        label={'Фильтровать по категории'}
                        placeholder={'Выберите категорию'}
                        onSelect={handleChangeCategory}
                        onOpen={handleOpenOptionsCategory}
                    />
                </>
            )}
        </div>
    )
}

export default PlacesFilterPanel
