import { getState } from 'jest-circus'
import { GetServerSidePropsResult, NextPage } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/dist/client/router'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import React, { useState } from 'react'
import useGeolocation from 'react-hook-geolocation'

import Container from '@/ui/container'
import Pagination from '@/ui/pagination'

import { API } from '@/api/api'
import { wrapper } from '@/api/store'
import { ApiTypes, Place } from '@/api/types'

import PageLayout from '@/components/page-layout'
import PlacesFilterPanel from '@/components/places-filter-panel'
import PlacesList from '@/components/places-list'

const POST_PER_PAGE = 16

interface PlacesPageProps {
    currentPage: number
    placesCount: number
    placesList: Place.Place[]
}

const PlacesPage: NextPage<PlacesPageProps> = (props) => {
    const { currentPage, placesCount, placesList } = props
    const { t } = useTranslation('common', { keyPrefix: 'page.places' })

    // const pathname = usePathname()
    // const searchParams = useSearchParams()
    const geolocation = useGeolocation()
    // const router = useRouter()

    // const initPage = searchParams.get('page')
    //     ? Number(searchParams.get('page'))
    //     : 1
    // const initSort = searchParams.get('sort')
    //     ? (searchParams.get('sort') as API.SortFields)
    //     : API.SortFields.Updated
    // const initOrder = searchParams.get('order')
    //     ? (searchParams.get('order') as API.SortOrder)
    //     : API.SortOrder.DESC

    // console.log('props', props)

    // const currentPage = Number(searchParams.get('page')) || 1

    // const [page, setPage] = useState<number>()
    // const [sort, setSort] = useState<ApiTypes.SortFields>(
    //     ApiTypes.SortFields.Updated
    // )
    // const [order, setOrder] = useState<ApiTypes.SortOrder>(
    //     ApiTypes.SortOrder.DESC
    // )
    // const [category, setCategory] = useState<Place.Category>()
    // const [location, setLocation] = useState<ApiTypes.PlaceLocationType>()

    const [introduce] = API.useIntroduceMutation()
    // const { data } = API.usePlacesGetListQuery({
    //     category: category?.name,
    //     city:
    //         location?.type === ApiTypes.LocationType.City
    //             ? location.value
    //             : undefined,
    //     country:
    //         location?.type === ApiTypes.LocationType.Country
    //             ? location.value
    //             : undefined,
    //     district:
    //         location?.type === ApiTypes.LocationType.District
    //             ? location.value
    //             : undefined,
    //     limit: POST_PER_PAGE,
    //     offset: (props.currentPage - 1) * POST_PER_PAGE,
    //     order: order,
    //     region:
    //         location?.type === ApiTypes.LocationType.Region
    //             ? location.value
    //             : undefined,
    //     sort: sort
    // })

    // useEffect(() => {
    //     const urlParams = {
    //         order: order !== ApiTypes.SortOrder.DESC ? order : undefined,
    //         page: page !== 1 ? page : undefined,
    //         sort: sort !== ApiTypes.SortFields.Updated ? sort : undefined
    //     }
    //
    //     router.replace(`places${encodeQueryData(urlParams)}`, undefined, {
    //         shallow: true
    //     })
    // }, [page, sort, order])

    // const createPageURL = (pageNumber: number | string) => {
    //     const params = new URLSearchParams(searchParams)
    //     params.set('page', pageNumber.toString())
    //     return `${pathname}?${params.toString()}`
    // }

    useEffect(() => {
        if (geolocation?.latitude && geolocation?.longitude) {
            introduce({ lat: geolocation.latitude, lon: geolocation.longitude })
        }
    }, [geolocation.latitude, geolocation.longitude])

    return (
        <PageLayout
            title={t('title')}
            breadcrumb={t('breadcrumb')}
        >
            <NextSeo title={t('title')} />
            {/*<Card sx={{ mb: 2 }}>*/}
            {/*    <CardHeader*/}
            {/*        title={t('title', PAGE_TITLE)}*/}
            {/*        titleTypographyProps={{ component: 'h1' }}*/}
            {/*        subheader={<Breadcrumbs currentPage={PAGE_TITLE} />}*/}
            {/*        sx={{ mb: -1, mt: -1 }}*/}
            {/*        action={*/}
            {/*            <Button*/}
            {/*                sx={{ mr: 1, mt: 1.4 }}*/}
            {/*                size={'medium'}*/}
            {/*                variant={'contained'}*/}
            {/*                href={'/places/create'}*/}
            {/*            >*/}
            {/*                {'Добавить'}*/}
            {/*            </Button>*/}
            {/*        }*/}
            {/*    />*/}
            {/*</Card>*/}
            {/*<Container>*/}
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
            {/*</Container>*/}
            <PlacesList places={placesList} />
            <Container className={'pagination'}>
                <div>
                    {'Интересных мест:'} <strong>{placesCount}</strong>
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalPostCount={placesCount}
                    perPage={POST_PER_PAGE}
                    linkPart={'places'}
                />
            </Container>
        </PageLayout>
    )
}

export const getServerSideProps = wrapper.getServerSideProps(
    (store) =>
        async (context): Promise<GetServerSidePropsResult<PlacesPageProps>> => {
            const locale = context.locale ?? 'en'
            const currentPage = parseInt(context.query.page as string, 10) || 1

            const translations = await serverSideTranslations(locale)

            const { data: placesList } = await store.dispatch(
                API.endpoints?.placesGetList.initiate({
                    limit: POST_PER_PAGE,
                    offset: (currentPage - 1) * POST_PER_PAGE,
                    order: ApiTypes.SortOrder.ASC,
                    sort: ApiTypes.SortFields.Distance
                })
            )

            await Promise.all(store.dispatch(API.util.getRunningQueriesThunk()))

            return {
                props: {
                    ...translations,
                    currentPage,
                    placesCount: placesList?.count || 0,
                    placesList: placesList?.items || []
                }
            }
        }
)

export default PlacesPage
