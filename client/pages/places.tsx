import { GetServerSidePropsResult, NextPage } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/dist/client/router'
import { useEffect } from 'react'
import React from 'react'
import useGeolocation from 'react-hook-geolocation'

import Container from '@/ui/container'
import Pagination from '@/ui/pagination'

import { API } from '@/api/api'
import { wrapper } from '@/api/store'
import { ApiTypes, Place } from '@/api/types'

import PageLayout from '@/components/page-layout'
import PlacesFilterPanel from '@/components/places-filter-panel'
import PlacesList from '@/components/places-list'

import { encodeQueryData } from '@/functions/helpers'

const DEFAULT_SORT = ApiTypes.SortFields.Updated
const DEFAULT_ORDER = ApiTypes.SortOrder.DESC
const POST_PER_PAGE = 16

interface PlacesPageProps {
    sort: ApiTypes.SortFields
    order: ApiTypes.SortOrder
    currentPage: number
    placesCount: number
    placesList: Place.Place[]
}

type FilterDataType = {
    order?: ApiTypes.SortOrder
    page?: number
    sort?: ApiTypes.SortFields
}

const PlacesPage: NextPage<PlacesPageProps> = (props) => {
    const { sort, order, currentPage, placesCount, placesList } = props
    const { t } = useTranslation('common', { keyPrefix: 'page.places' })

    const geolocation = useGeolocation()
    const router = useRouter()

    const filterData: FilterDataType = {
        order: order !== DEFAULT_ORDER ? order : undefined,
        page: currentPage !== 1 ? currentPage : undefined,
        sort: sort !== DEFAULT_SORT ? sort : undefined
    }

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

    const urlOrder = order !== ApiTypes.SortOrder.DESC ? order : undefined
    const urlSort = sort !== ApiTypes.SortFields.Updated ? sort : undefined
    const urlPage = currentPage !== 1 ? currentPage : undefined

    useEffect(() => {
        if (geolocation?.latitude && geolocation?.longitude) {
            introduce({ lat: geolocation.latitude, lon: geolocation.longitude })
        }
    }, [geolocation.latitude, geolocation.longitude])

    const title = `${t('title')}${
        currentPage && currentPage !== 1 ? ` - Страница ${currentPage}` : ''
    }`

    return (
        <PageLayout
            title={title}
            breadcrumb={t('breadcrumb')}
        >
            <NextSeo title={title} />
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
            {/*        // location={location}*/}
            {/*        // category={category}*/}
            {/*        // onChangeSort={setSort}*/}
            {/*        // onChangeOrder={setOrder}*/}
            {/*        // onChangeLocation={async (location) => {*/}
            {/*        //     setPage(1)*/}
            {/*        //     setLocation(location)*/}
            {/*        // }}*/}
            {/*        // onChangeCategory={(category) => {*/}
            {/*        //     setPage(1)*/}
            {/*        //     setCategory(category)*/}
            {/*        // }}*/}
            {/*    />*/}
            {/*</Container>*/}
            <PlacesFilterPanel
                sort={sort}
                order={order}
                // location={location}
                // category={category}
                onChangeSort={async (val) =>
                    await router.push(
                        '/places' +
                            encodeQueryData({
                                order: urlOrder,
                                sort: val !== DEFAULT_SORT ? val : undefined
                            })
                    )
                }
                onChangeOrder={async (val) =>
                    await router.push(
                        '/places' +
                            encodeQueryData({
                                order: val !== DEFAULT_ORDER ? val : undefined,
                                page: urlPage,
                                sort: urlSort
                            })
                    )
                }
                // onChangeLocation={async (location) => {
                //     setPage(1)
                //     setLocation(location)
                // }}
                // onChangeCategory={(category) => {
                //     setPage(1)
                //     setCategory(category)
                // }}
            />
            <PlacesList places={placesList} />
            <Container className={'pagination'}>
                <div>
                    {'Интересных мест:'} <strong>{placesCount}</strong>
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalPostCount={placesCount}
                    perPage={POST_PER_PAGE}
                    urlParam={filterData}
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
            const sort =
                (context.query.sort as ApiTypes.SortFields) || DEFAULT_SORT
            const order =
                (context.query.order as ApiTypes.SortOrder) || DEFAULT_ORDER

            const translations = await serverSideTranslations(locale)

            const { data: placesList } = await store.dispatch(
                API.endpoints?.placesGetList.initiate({
                    limit: POST_PER_PAGE,
                    offset: (currentPage - 1) * POST_PER_PAGE,
                    order: order,
                    sort: sort
                })
            )

            await Promise.all(store.dispatch(API.util.getRunningQueriesThunk()))

            return {
                props: {
                    ...translations,
                    currentPage,
                    order,
                    placesCount: placesList?.count || 0,
                    placesList: placesList?.items || [],
                    sort
                }
            }
        }
)

export default PlacesPage
