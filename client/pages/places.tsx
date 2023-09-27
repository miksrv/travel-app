import { encodeQueryData } from '@/functions/helpers'
import { Pagination } from '@mui/material'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Paper from '@mui/material/Paper'
import { GetStaticProps, NextPage } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/dist/client/router'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import React, { useState } from 'react'
import useGeolocation from 'react-hook-geolocation'

import { useIntroduceMutation, usePlacesGetListQuery } from '@/api/api'
import { API, Place } from '@/api/types'

import Breadcrumbs from '@/components/breadcrumbs'
import PageLayout from '@/components/page-layout'
import PageTitle from '@/components/page-title'
import PlacesFilterPanel from '@/components/places-filter-panel'
import PlacesList from '@/components/places-list'

const POST_PER_PAGE = 9

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
    const [category, setCategory] = useState<Place.Category>()
    const [location, setLocation] = useState<API.PlaceLocationType>()

    const [introduce] = useIntroduceMutation()
    const { data, isLoading } = usePlacesGetListQuery({
        category: category?.name,
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
            <Card sx={{ mb: 2 }}>
                <CardHeader
                    title={t('title', 'Интересные места')}
                    titleTypographyProps={{ component: 'h1' }}
                    subheader={<Breadcrumbs currentPage={'Интересные места'} />}
                    sx={{ mb: -0.5, mt: -0.5 }}
                />
                <CardContent sx={{ mb: -2, mt: -3 }}>
                    <PlacesFilterPanel
                        sort={sort}
                        order={order}
                        location={location}
                        category={category}
                        onChangeSort={setSort}
                        onChangeOrder={setOrder}
                        onChangeLocation={async (location) => {
                            setPage(1)
                            setLocation(location)
                        }}
                        onChangeCategory={(category) => {
                            setPage(1)
                            setCategory(category)
                        }}
                    />
                </CardContent>
            </Card>

            {/*<Paper*/}
            {/*    sx={{*/}
            {/*        backgroundColor: '#f9f9f9',*/}
            {/*        mb: 2,*/}
            {/*        mt: 2,*/}
            {/*        p: 2,*/}
            {/*        pb: 1,*/}
            {/*        pt: 1*/}
            {/*    }}*/}
            {/*>*/}
            {/*    <PageTitle title={t('title', 'Интересные места')} />*/}
            {/*    <Breadcrumbs currentPage={'Интересные места'} />*/}
            {/*    <Divider sx={{ mt: 1 }} />*/}
            {/*    <PlacesFilterPanel*/}
            {/*        sort={sort}*/}
            {/*        order={order}*/}
            {/*        location={location}*/}
            {/*        category={category}*/}
            {/*        onChangeSort={setSort}*/}
            {/*        onChangeOrder={setOrder}*/}
            {/*        onChangeLocation={async (location) => {*/}
            {/*            setPage(1)*/}
            {/*            setLocation(location)*/}
            {/*        }}*/}
            {/*        onChangeCategory={(category) => {*/}
            {/*            setPage(1)*/}
            {/*            setCategory(category)*/}
            {/*        }}*/}
            {/*    />*/}
            {/*</Paper>*/}
            <PlacesList
                loading={isLoading}
                places={data?.items}
            />
            <Paper sx={{ mb: 2, mt: 2, p: 2, pt: 0.5 }}>
                <Pagination
                    sx={{ mt: 2 }}
                    shape={'rounded'}
                    page={page}
                    hidden={!data?.count}
                    count={Math.ceil((data?.count || 0) / POST_PER_PAGE)}
                    onChange={(_, page) => setPage(page)}
                />
            </Paper>
        </PageLayout>
    )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale ?? 'ru'))
    }
})

export default Places
