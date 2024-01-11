import React, { useMemo } from 'react'

import Autocomplete from '@/ui/autocomplete'
import Container from '@/ui/container'
import Dropdown from '@/ui/dropdown'

import { API } from '@/api/api'
import { ApiTypes, Place } from '@/api/types'

import { PlacesFilterType } from '@/components/places-filter-panel/types'

import { categoryImage } from '@/functions/categories'

import styles from './styles.module.sass'

interface PlacesFilterPanelProps {
    sort?: ApiTypes.SortFields
    order?: ApiTypes.SortOrder
    location?: ApiTypes.PlaceLocationType
    category?: string | null
    onChange?: (key: keyof PlacesFilterType, value: string | number) => void
    onChangeSort?: (value: ApiTypes.SortFields) => void
    onChangeOrder?: (value: ApiTypes.SortOrder) => void
    onChangeLocation?: (value?: ApiTypes.PlaceLocationType) => void
    onChangeCategory?: (value?: Place.Category) => void
}

type SortOptionsProps = {
    key: ApiTypes.SortFields
    value: string
}

const SortOptions: SortOptionsProps[] = [
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

const PlacesFilterPanel: React.FC<PlacesFilterPanelProps> = (props) => {
    const { sort, order, location, category, onChange } = props

    const { data: categoryData } = API.useCategoriesGetListQuery()

    const [searchAddress, { data: addressData, isLoading: addressLoading }] =
        API.useAddressGetSearchMutation()

    const handleChangeSort = (value: ApiTypes.SortFields) =>
        onChange?.('sort', value)

    const handleChangeOrder = (value: ApiTypes.SortOrder) =>
        onChange?.('order', value)

    const handleChangeCategory = (value: string) =>
        onChange?.('category', value)

    const handleSearchLocation = (value: string) => {
        if (value.length > 3) {
            searchAddress(value)
        }
    }

    const AutocompleteData = useMemo(
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
        <Container className={styles.component}>
            <div className={styles.container}>
                <Dropdown
                    value={sort}
                    // className={styles.sortDropdown}
                    options={SortOptions.map((item) => item)}
                    onSelect={handleChangeSort}
                />

                <Dropdown
                    value={order}
                    // className={styles.orderDropdown}
                    options={[
                        {
                            key: ApiTypes.SortOrder.ASC,
                            value: 'По возрастанию'
                        },
                        {
                            key: ApiTypes.SortOrder.DESC,
                            value: 'По убыванию'
                        }
                    ]}
                    onSelect={handleChangeOrder}
                />

                <Dropdown
                    clearable={true}
                    value={category}
                    placeholder={'Выберите категорию'}
                    // className={styles.categoryDropdown}
                    options={categoryData?.items?.map((item) => ({
                        image: categoryImage(item.name),
                        key: item.name,
                        value: item.title
                    }))}
                    onSelect={handleChangeCategory}
                />

                <Autocomplete
                    placeholder={'Поиск по местоположению'}
                    loading={addressLoading}
                    options={AutocompleteData}
                    onSearch={handleSearchLocation}
                />
            </div>
        </Container>
    )
}

export default PlacesFilterPanel
