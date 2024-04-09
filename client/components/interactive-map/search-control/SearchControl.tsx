import debounce from 'lodash-es/debounce'
import { useTranslation } from 'next-i18next'
import React, { useCallback, useMemo, useState } from 'react'

import Autocomplete, { DropdownOption } from '@/ui/autocomplete'

import { API } from '@/api/api'
import { ApiTypes } from '@/api/types'

import * as Coordinates from '@/functions/coordinates'

import styles from './styles.module.sass'

interface SearchControlProps {
    onClear?: () => void
    onSelectResult?: (
        coordinates: ApiTypes.LatLonCoordinate,
        zoom?: number,
        showPosition?: boolean
    ) => void
}

const SearchControl: React.FC<SearchControlProps> = ({
    onClear,
    onSelectResult
}) => {
    const { t } = useTranslation('common', {
        keyPrefix: 'components.interactiveMap.searchControl'
    })

    const [foundCoords, setFoundCoords] = useState<DropdownOption[]>()

    const [geoSearch, { data, isLoading }] =
        API.useLocationGetGeosearchMutation()

    const locationOptions: DropdownOption[] = useMemo(
        () =>
            data?.items?.map((item) => {
                let address: string[] = []

                if (item?.country) {
                    address.push(item.country)
                }

                if (item?.region) {
                    address.push(item.region)
                }

                if (item?.district) {
                    address.push(item.district)
                }

                if (item?.locality) {
                    address.push(item.locality)
                }

                if (item?.street) {
                    address.push(item.street)
                }

                return {
                    description: address.join(', '),
                    key: (item?.lat || 0) + (item?.lon || 0),
                    title:
                        item?.locality ??
                        item?.region ??
                        item?.district ??
                        item?.country ??
                        '',
                    value: {
                        lat: item.lat,
                        lon: item.lon
                    }
                }
            }) || [],
        [data?.items]
    )

    const handleSearchLocation = (value: string) => {
        const normalizeCoords = Coordinates.normalizeInput(value)

        if (value.length >= 3) {
            if (Coordinates.isCoordinates(value)) {
                for (const parser of [
                    Coordinates.CoordinatesD,
                    Coordinates.CoordinatesDM,
                    Coordinates.CoordinatesDMS,
                    Coordinates.CoordinatesDSigned
                ]) {
                    const result = parser.fromString(normalizeCoords)

                    if (!result?.error) {
                        const resultItems = result?.coordinates?.map((it) => {
                            const coordStrings = it.format()
                            const latLng = it.getLatLng()

                            return {
                                description: 'Координаты',
                                key: coordStrings.latitude,
                                title: `${coordStrings.latitude} ${coordStrings.longitude}`,
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
                handleDebouncedSearch(value)
            }
        }
    }

    const handleDebouncedSearch = useCallback(
        debounce((value) => {
            geoSearch(value)
        }, 1000),
        []
    )

    return (
        <Autocomplete
            className={styles.searchControl}
            placeholder={t('placeholder')}
            clearable={true}
            debouncing={false}
            value={location}
            loading={isLoading}
            options={foundCoords ?? locationOptions}
            onSearch={handleSearchLocation}
            onClear={onClear}
            onSelect={(option) =>
                option?.value &&
                onSelectResult?.(
                    option.value,
                    foundCoords ? 17 : 12,
                    !!foundCoords
                )
            }
        />
    )
}

export default SearchControl
