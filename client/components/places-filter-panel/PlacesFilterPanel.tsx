import React, { useMemo, useState } from 'react'

import Autocomplete from '@/ui/autocomplete'
import Dropdown, { DropdownOptions } from '@/ui/dropdown'
import OptionsList from '@/ui/dropdown/OptionsList'

import { API } from '@/api/api'
import { ApiTypes } from '@/api/types'

import { PlacesFilterType } from '@/components/places-filter-panel/types'

import { categoryImage } from '@/functions/categories'
import { concatClassNames as cn } from '@/functions/helpers'

import styles from './styles.module.sass'

interface PlacesFilterPanelProps {
    sort?: ApiTypes.SortFields
    order?: ApiTypes.SortOrder
    location?: ApiTypes.PlaceLocationType
    category?: string | null
    onChange?: (
        key: keyof PlacesFilterType,
        value: string | number | undefined
    ) => void
    onChangeLocation?: (value?: ApiTypes.PlaceLocationType) => void
}

const sortOptions: DropdownOptions[] = [
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

const orderOptions: DropdownOptions[] = [
    {
        key: ApiTypes.SortOrder.ASC,
        value: 'По возрастанию'
    },
    {
        key: ApiTypes.SortOrder.DESC,
        value: 'По убыванию'
    }
]

const PlacesFilterPanel: React.FC<PlacesFilterPanelProps> = (props) => {
    const { sort, order, location, category, onChange, onChangeLocation } =
        props

    const { data: categoryData } = API.useCategoriesGetListQuery()

    const [searchAddress, { data: addressData, isLoading: addressLoading }] =
        API.useAddressGetSearchMutation()

    const [openCategory, setOpenCategory] = useState<boolean>(false)

    const handleChangeSort = (value: DropdownOptions | undefined) =>
        onChange?.('sort', value?.key)

    const handleChangeOrder = (value: DropdownOptions | undefined) =>
        onChange?.('order', value?.key)

    const handleChangeCategory = (value: DropdownOptions | undefined) => {
        onChange?.('category', value?.key)
        setOpenCategory(false)
    }

    const handleOpenOptionsCategory = () => {
        setOpenCategory(true)
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

    return (
        <div className={styles.component}>
            {openCategory && (
                <OptionsList
                    options={categoryOptions}
                    onSelect={handleChangeCategory}
                />
            )}

            {!openCategory && (
                <>
                    <Dropdown
                        label={'Сортировка мест'}
                        value={sortOptions?.find(({ key }) => key === sort)}
                        options={sortOptions}
                        onSelect={handleChangeSort}
                    />

                    <Dropdown
                        label={'Порядок сортировки'}
                        value={orderOptions?.find(({ key }) => key === order)}
                        options={orderOptions}
                        onSelect={handleChangeOrder}
                    />

                    <Dropdown
                        clearable={true}
                        value={categoryOptions?.find(
                            ({ key }) => key === category
                        )}
                        label={'Фильтровать по категории'}
                        placeholder={'Выберите категорию'}
                        onSelect={handleChangeCategory}
                        onOpen={handleOpenOptionsCategory}
                    />

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
                </>
            )}
        </div>
    )
}

export default PlacesFilterPanel
