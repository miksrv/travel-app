import { useTranslation } from 'next-i18next'
import React, { useMemo } from 'react'

import Autocomplete from '@/ui/autocomplete'
import { DropdownOption } from '@/ui/dropdown'

import { API } from '@/api/api'
import { ApiTypes } from '@/api/types'

import styles from './styles.module.sass'

interface SearchControlProps {
    onSelectResult?: (coordinates: ApiTypes.LatLonCoordinate) => void
}

const SearchControl: React.FC<SearchControlProps> = ({ onSelectResult }) => {
    const { t } = useTranslation('common', {
        keyPrefix: 'components.interactiveMap.searchControl'
    })

    const [geoSearch, { data, isLoading }] =
        API.useLocationGetGeosearchMutation()

    const locationOptions = useMemo(
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
                    value:
                        item?.locality ??
                        item?.region ??
                        item?.district ??
                        item?.country ??
                        ''
                }
            }),
        [data?.items]
    )

    const handleSearchLocation = (value: string) => {
        if (value.length >= 3) {
            geoSearch(value)
        }
    }

    const handleSelectLocation = (value: DropdownOption) => {
        const location = data?.items?.find(
            (item) => (item?.lon || 0) + (item?.lat || 0) === value?.key
        )

        if (location?.lat && location?.lon) {
            onSelectResult?.({
                lat: location.lat,
                lon: location.lon
            })
        }
    }

    return (
        <Autocomplete
            className={styles.searchControl}
            placeholder={t('placeholder')}
            clearable={true}
            value={location}
            loading={isLoading}
            options={locationOptions}
            onSearch={handleSearchLocation}
            onSelect={handleSelectLocation}
        />
    )
}

export default SearchControl
