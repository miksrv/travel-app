import React, { useCallback, useMemo, useState } from 'react'
import debounce from 'lodash-es/debounce'

import { useTranslation } from 'next-i18next'

import { API, ApiType } from '@/api'
import * as Coordinates from '@/functions/coordinates'
import Autocomplete, { DropdownOption } from '@/ui/autocomplete'

import styles from './styles.module.sass'

interface SearchControlProps {
    onClear?: () => void
    onSelectResult?: (coordinates: ApiType.Coordinates, zoom?: number, showPosition?: boolean) => void
}

const SearchControl: React.FC<SearchControlProps> = ({ onClear, onSelectResult }) => {
    const { t } = useTranslation()

    const [foundCoords, setFoundCoords] = useState<DropdownOption[]>()

    const [geoSearch, { data, isLoading }] = API.useLocationGetGeoSearchMutation()

    const locationOptions: DropdownOption[] = useMemo(
        () =>
            data?.items?.map((item) => {
                const address: string[] = []

                if (item.country) {
                    address.push(item.country)
                }

                if (item.region) {
                    address.push(item.region)
                }

                if (item.district) {
                    address.push(item.district)
                }

                if (item.locality) {
                    address.push(item.locality)
                }

                if (item.street) {
                    address.push(item.street)
                }

                return {
                    description: address.join(', '),
                    key: (item.lat || 0) + (item.lon || 0),
                    title: item.locality ?? item.region ?? item.district ?? item.country ?? '',
                    value: {
                        lat: item.lat,
                        lon: item.lon
                    }
                }
            }) || [],
        [data?.items]
    )

    const handleSearchLocation = async (value: string) => {
        const normalizeCoords = Coordinates.normalizeInput(value)

        if (value.length <= 3) {
            return
        }

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
                            description: t('coordinates'),
                            key: coordStrings.latitude,
                            title: `${coordStrings.latitude as string} ${coordStrings.longitude as string}`,
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
            await handleDebouncedSearch(value)
        }
    }

    const handleDebouncedSearch = useCallback(
        debounce(async (value) => {
            await geoSearch(value)
        }, 1000),
        []
    )

    return (
        <Autocomplete
            className={styles.searchControl}
            notFoundCaption={t('nothing-found')}
            placeholder={t('search-locality-coordinates')}
            clearable={true}
            debouncing={false}
            value={location}
            loading={isLoading}
            options={foundCoords ?? locationOptions}
            onSearch={handleSearchLocation}
            onClear={onClear}
            onSelect={(option) => option?.value && onSelectResult?.(option.value, foundCoords ? 17 : 12, !!foundCoords)}
        />
    )
}

export default SearchControl
