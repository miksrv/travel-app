import React, { useMemo, useState } from 'react'

import { useTranslation } from 'next-i18next/pages'

import { API, ApiModel, ApiType } from '@/api'
import { useAppSelector } from '@/app/store'
import { PlacesCarousel, PlacesCarouselFilter } from '@/components/widgets'

interface PopularPlacesProps {
    places?: ApiModel.Place[]
}

const PLACES_LIMIT = 6

// Matches the default sort used on /places: guests see Trending, authenticated users see Recommended.
type FilterKey = 'popular' | 'recommended' | 'nearby' | 'new' | 'active'

const FILTERS: Array<{
    key: FilterKey
    labelKey: string
    sort: ApiType.SortFieldsType
    order: ApiType.SortOrdersType
    requiresAuth?: boolean
    requiresLocation?: boolean
}> = [
    {
        key: 'popular',
        labelKey: 'popular-places-filter-popular',
        order: ApiType.SortOrders.DESC,
        sort: ApiType.SortFields.Trending
    },
    {
        key: 'recommended',
        labelKey: 'popular-places-filter-recommended',
        order: ApiType.SortOrders.DESC,
        requiresAuth: true,
        sort: ApiType.SortFields.Recommended
    },
    {
        key: 'nearby',
        labelKey: 'popular-places-filter-nearby',
        order: ApiType.SortOrders.ASC,
        requiresLocation: true,
        sort: ApiType.SortFields.Distance
    },
    {
        key: 'new',
        labelKey: 'popular-places-filter-new',
        order: ApiType.SortOrders.DESC,
        sort: ApiType.SortFields.Created
    },
    {
        key: 'active',
        labelKey: 'popular-places-filter-active',
        order: ApiType.SortOrders.DESC,
        sort: ApiType.SortFields.Updated
    }
]

export const PopularPlaces: React.FC<PopularPlacesProps> = ({ places }) => {
    const { t } = useTranslation()

    const [activeFilter, setActiveFilter] = useState<FilterKey>('popular')

    const isAuth = useAppSelector((state) => state.auth.isAuth)
    const userLocation = useAppSelector((state) => state.application.userLocation)
    const hasLocation = !!userLocation?.lat && !!userLocation?.lon

    const visibleFilters = useMemo(
        () =>
            FILTERS.filter(({ requiresAuth, requiresLocation }) => {
                if (requiresAuth && !isAuth) {
                    return false
                }
                if (requiresLocation && !hasLocation) {
                    return false
                }
                return true
            }),
        [isAuth, hasLocation]
    )

    const filter = visibleFilters.find(({ key }) => key === activeFilter) ?? visibleFilters[0]

    const { data } = API.usePlacesGetListQuery({
        limit: PLACES_LIMIT,
        order: filter.order,
        sort: filter.sort,
        ...(filter.key === 'nearby' ? { lat: userLocation?.lat, lon: userLocation?.lon } : {})
    })

    const placesList = data?.items ?? places ?? []

    const filters: PlacesCarouselFilter[] = visibleFilters.map(({ key, labelKey }) => ({
        active: filter.key === key,
        key,
        label: t(labelKey),
        onClick: () => setActiveFilter(key)
    }))

    return (
        <PlacesCarousel
            title={t('popular-places-title', 'Популярные места')}
            places={placesList}
            actionHref={'/places'}
            actionLabel={t('all-geotags')}
            filters={filters}
        />
    )
}
