import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import styles from './styles.module.sass'

import { API } from '@/api/api'
import { ApiTypes } from '@/api/types'
import { categoryImage } from '@/functions/categories'
import * as Coordinates from '@/functions/coordinates'
import Autocomplete, { DropdownOption } from '@/ui/autocomplete'

enum DropdownOptionType {
    COORDINATES = 'coordinates',
    POINT = 'point'
}

interface SearchProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Search: React.FC<SearchProps> = () => {
    const { t } = useTranslation()
    const router = useRouter()

    const [foundCoords, setFoundCoords] = useState<DropdownOption[]>()
    const [searchString, setSearchString] = useState<string>('')

    const { data, isFetching } = API.usePlacesGetListQuery(
        {
            limit: 10,
            search: searchString
        },
        { skip: searchString.length <= 2 }
    )

    const options = useMemo(
        () =>
            data?.items?.map((item) => {
                const address: string[] = []

                if (item.address?.country) {
                    address.push(item.address.country.title)
                }

                if (item.address?.region) {
                    address.push(item.address.region.title)
                }

                if (item.address?.district) {
                    address.push(item.address.district.title)
                }

                if (item.address?.locality) {
                    address.push(item.address.locality.title)
                }

                return {
                    description: address.join(', '),
                    image: categoryImage(item.category?.name),
                    title: item.title,
                    type: DropdownOptionType.POINT,
                    value: item.id
                }
            }),
        [data?.items]
    )

    const handleSearchLocation = (value: string) => {
        const normalizeCoords = Coordinates.normalizeInput(value)

        if (Coordinates.isCoordinates(value)) {
            for (const parser of [
                Coordinates.CoordinatesD,
                Coordinates.CoordinatesDM,
                Coordinates.CoordinatesDMS,
                Coordinates.CoordinatesDSigned
            ]) {
                const result = parser.fromString(normalizeCoords)

                if (!result.error) {
                    const resultItems = result.coordinates?.map((it) => {
                        const coordStrings = it.format()
                        const latLng = it.getLatLng()

                        return {
                            description: 'Координаты',
                            key: coordStrings.latitude,
                            title: `${coordStrings.latitude} ${coordStrings.longitude}`,
                            type: DropdownOptionType.COORDINATES,
                            value: {
                                lat: latLng.lat,
                                lon: latLng.lon
                            }
                        }
                    })

                    setFoundCoords(resultItems)
                }
            }
        } else {
            setFoundCoords(undefined)
            setSearchString(value)
        }
    }

    const handleSelectLocation = async (value: DropdownOption) => {
        if (value.type === DropdownOptionType.COORDINATES) {
            const coords = value.value as ApiTypes.LatLonCoordinate
            await router.push(`/map#${coords.lat},${coords.lon},17?m=${coords.lat},${coords.lon}`)
        } else {
            await router.push(`/places/${value.value}`)
        }
    }

    return (
        <Autocomplete
            className={styles.search}
            notFoundCaption={t('nothing-found')}
            placeholder={t('global-search-placeholder')}
            debounceDelay={300}
            leftIcon={'Search'}
            hideArrow={!options?.length || !searchString.length}
            loading={isFetching}
            options={foundCoords ?? options}
            onSearch={handleSearchLocation}
            onSelect={handleSelectLocation}
        />
    )
}

export default Search
