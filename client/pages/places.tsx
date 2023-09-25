import { encodeQueryData } from '@/functions/helpers'
import { Pagination } from '@mui/material'
import { GetStaticProps, NextPage } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
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
    const { t } = useTranslation('common', { keyPrefix: 'page.places' })

    const searchParams = useSearchParams()
    const geolocation = useGeolocation()
    const router = useRouter()

    // const initPage = searchParams.get('page')
    //     ? Number(searchParams.get('page'))
    //     : 1
    // const initSort = searchParams.get('sort')
    //     ? (searchParams.get('sort') as API.SortFields)
    //     : API.SortFields.Updated
    // const initOrder = searchParams.get('order')
    //     ? (searchParams.get('order') as API.SortOrder)
    //     : API.SortOrder.DESC

    const [page, setPage] = useState<number>(1)
    const [sort, setSort] = useState<API.SortFields>(API.SortFields.Updated)
    const [order, setOrder] = useState<API.SortOrder>(API.SortOrder.DESC)
    const [location, setLocation] = useState<API.PlaceLocationType>()

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

    // useEffect(() => {
    //     if (pageUrl) {
    //         setPage(Number(pageUrl))
    //     }
    //
    //     if (sortUrl) {
    //         setSort(sortUrl as API.SortFields)
    //     }
    //
    //     if (orderUrl) {
    //         setOrder(orderUrl as API.SortOrder)
    //     }
    // })

    useEffect(() => {
        const urlParams = {
            order: order !== API.SortOrder.DESC ? order : undefined,
            page: page !== 1 ? page : undefined,
            sort: sort !== API.SortFields.Updated ? sort : undefined
        }

        router.push(`places${encodeQueryData(urlParams)}`, undefined, {
            shallow: true
        })
    }, [page, sort, order])

    useEffect(() => {
        if (geolocation?.latitude && geolocation?.longitude) {
            introduce({ lat: geolocation.latitude, lon: geolocation.longitude })
        }
    }, [geolocation.latitude, geolocation.longitude])

    return (
        <PageLayout maxWidth={'lg'}>
            <PageTitle title={t('title')} />
            <Breadcrumbs currentPage={'Интересные места'} />
            <PlacesFilterPanel
                sort={sort}
                order={order}
                location={location}
                onChangeSort={setSort}
                onChangeOrder={setOrder}
                onChangeLocation={async (location) => {
                    setPage(1)
                    setLocation(location)
                }}
            />
            <PlacesList
                loading={isLoading}
                places={data?.items}
            />
            <Pagination
                sx={{ mt: 2 }}
                shape={'rounded'}
                page={page}
                hidden={!data?.count}
                count={Math.ceil((data?.count || 0) / POST_PER_PAGE)}
                onChange={(_, page) => setPage(page)}
            />
        </PageLayout>
    )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale ?? 'ru'))
    }
})

export default Places
