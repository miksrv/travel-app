import debounce from 'lodash-es/debounce'
import { useTranslation } from 'next-i18next'
import React, { useCallback, useMemo, useState } from 'react'

import Autocomplete, { DropdownOption } from '@/ui/autocomplete'

import { API } from '@/api/api'
import { ApiTypes } from '@/api/types'

import {
    CoordinatesD,
    CoordinatesDM,
    CoordinatesDMS,
    CoordinatesDSigned,
    reHemisphere,
    reSignedFractional
} from '@/components/interactive-map/search-control/coordinates'

import styles from '../styles.module.sass'

interface SearchControlProps {
    onSelectResult?: (
        coordinates: ApiTypes.LatLonCoordinate,
        zoom?: number
    ) => void
}

const SearchControl: React.FC<SearchControlProps> = ({ onSelectResult }) => {
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

    const regexps = {
        easternHemishphere: /[EeЕе]|[ВвB] *[Дд]?/gu, // second Ее is cyrillic
        northernHemishphere: /[Nn]|[СсCc] *[Шш]?/gu,
        southernHemishphere: /[Ss]|[Юю] *[Шш]?/gu,
        // This regexp wag generated using script at https://gist.github.com/wladich/3d15edc8fcd8b735ac883ef60fe10bfe
        // It matches all unicode characters except Lu (Uppercase Letter), Ll (Lowercase Letter)
        // and [0123456789,.-]. It ignores unassigned code points (Cn) and characters that are removed after NFKC
        // normalization.
        // Manually added: "oO" (lat), "оО" (rus)
        // eslint-disable-next-line max-len, no-control-regex, no-misleading-character-class, prettier/prettier
        symbols:
            /[OoОо\u0000-\u002b\u002f\u003a-\u0040\u005b-\u0060\u007b-\u00bf\u00d7\u00f7\u01bb\u01c0-\u01cc\u0294\u02b9-\u036f\u0375\u03f6\u0482-\u0489\u0559-\u055f\u0589-\u109f\u10fb\u10fc\u1100-\u139f\u1400-\u1c7f\u1cc0-\u1cff\u1d2f-\u1d6a\u1dc0-\u1dff\u1f88-\u1f8f\u1f98-\u1f9f\u1fa8-\u1faf\u1fbc-\u1fc1\u1fcc-\u1fcf\u1ffc-\u2131\u213a-\u214d\u214f-\u2182\u2185-\u2bff\u2ce5-\u2cea\u2cef-\u2cf1\u2cf9-\u2cff\u2d30-\ua63f\ua66e-\ua67f\ua69e-\ua721\ua788-\ua78a\ua78f\ua7f7-\ua7f9\ua7fb-\uab2f\uab5b-\uab5f\uabc0-\uffff]/gu,
        westernHemishphere: /[Ww]|[Зз] *[Дд]?/gu
    }

    const normalizeInput = (inp: string) => {
        let s = inp.normalize('NFKC') // convert subscripts and superscripts to normal chars
        s = ' ' + s + ' '
        // replace everything that is not letter, number, minus, dot or comma to space
        s = s.replace(regexps.symbols, ' ')
        // remove all dots and commas if they are not between digits
        s = s.replace(/[,.](?=\D)/gu, ' ')
        s = s.replace(/(\D)[,.]/gu, '$1 ') // lookbehind is not supported in all browsers
        // if dot is likely to be used as decimal separator, remove all commas
        if (s.includes('.')) {
            s = s.replace(/,/gu, ' ')
        } else {
            // otherwise comma is decimal separator
            s = s.replace(/,/gu, '.')
        }
        s = s.replace(/-(?=\D)/gu, ' ') // remove all minuses that are not in the beginning of number
        s = s.replace(/([^ ])-/gu, '$1 ') // lookbehind is not supported in all browsers

        s = s.replace(regexps.northernHemishphere, ' N ')
        s = s.replace(regexps.southernHemishphere, ' S ')
        s = s.replace(regexps.westernHemishphere, ' W ')
        s = s.replace(regexps.easternHemishphere, ' E ')

        s = s.replace(/ +/gu, ' ') // compress whitespaces
        s = s.trim()
        return s
    }

    const isCoordinates = (value: string): boolean => {
        const coordFieldRe = new RegExp(
            `^((${reHemisphere})|(${reSignedFractional}))$`,
            'u'
        )
        const coordNumbersFieldRe = new RegExp(`^(${reSignedFractional})$`, 'u')
        const fields = normalizeInput(value).split(' ')
        return (
            fields.length > 1 &&
            fields.every((field) => field.match(coordFieldRe)) &&
            fields.some((field) => field.match(coordNumbersFieldRe))
        )
    }

    const handleSearchLocation = (value: string) => {
        const normalizeCoords = normalizeInput(value)

        if (value.length >= 3) {
            if (isCoordinates(value)) {
                for (const parser of [
                    CoordinatesD,
                    CoordinatesDM,
                    CoordinatesDMS,
                    CoordinatesDSigned
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
                                    lon: latLng.lng
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
            onSelect={(option) =>
                option?.value &&
                onSelectResult?.(option.value, foundCoords ? 17 : 12)
            }
        />
    )
}

export default SearchControl
