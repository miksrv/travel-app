import { Pagination } from '@mui/material'
import { NextPage } from 'next'
import { useRouter } from 'next/dist/client/router'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import React, { useState } from 'react'
import useGeolocation from 'react-hook-geolocation'

import { useIntroduceMutation, usePlacesGetListQuery } from '@/api/api'
import { API } from '@/api/types'

import Breadcrumbs from '@/components/breadcrumbs'
import PageLayout from '@/components/page-layout'
import PageTitle from '@/components/page-title'
import PlacesFilterPanel from '@/components/places-filter-panel'
import PlacesList from '@/components/places-list'

const POST_PER_PAGE = 8

const Places: NextPage = () => {
    const searchParams = useSearchParams()
    const geolocation = useGeolocation()
    const router = useRouter()

    const [sort, setSort] = useState<API.SortFields>(API.SortFields.Created)
    const [order, setOrder] = useState<API.SortOrder>(API.SortOrder.DESC)
    const [location, setLocation] = useState<API.PlaceLocationType>()

    const page = searchParams.get('page')

    const [introduce] = useIntroduceMutation()
    const { data, isLoading } = usePlacesGetListQuery({
        city:
            location?.type === API.LocationType.City
                ? location.value
                : undefined,
        country:
            location?.type === API.LocationType.Country
                ? location.value
                : undefined,
        district:
            location?.type === API.LocationType.District
                ? location.value
                : undefined,
        limit: POST_PER_PAGE,
        offset: ((Number(page) || 1) - 1) * POST_PER_PAGE,
        order: order,
        region:
            location?.type === API.LocationType.Region
                ? location.value
                : undefined,
        sort: sort
    })

    const handlePaginationChange = async (_: any, value: number) => {
        await router.push(
            value === 1 ? 'places' : `places?page=${value}`,
            undefined,
            {
                shallow: true
            }
        )
    }

    useEffect(() => {
        if (geolocation?.latitude && geolocation?.longitude) {
            introduce({ lat: geolocation.latitude, lon: geolocation.longitude })
        }
    }, [geolocation.latitude, geolocation.longitude])

    return (
        <PageLayout maxWidth={'lg'}>
            <PageTitle title={'Интересные места'} />
            <Breadcrumbs currentPage={'Интересные места'} />
            <PlacesFilterPanel
                sort={sort}
                order={order}
                location={location}
                onChangeSort={setSort}
                onChangeOrder={setOrder}
                onChangeLocation={async (location) => {
                    await handlePaginationChange(undefined, 1)
                    setLocation(location)
                }}
            />
            <PlacesList
                loading={isLoading}
                places={data?.items}
            />
            <Pagination
                sx={{ mt: 2 }}
                page={Number(page) || 1}
                shape={'rounded'}
                hidden={!data?.count}
                count={Math.ceil((data?.count || 0) / POST_PER_PAGE)}
                onChange={handlePaginationChange}
            />
        </PageLayout>
    )
}

export default Places
