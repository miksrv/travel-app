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
import { PlacesFilterType } from '@/components/places-filter-panel/types'
import PlacesList from '@/components/places-list'

import { encodeQueryData } from '@/functions/helpers'

const DEFAULT_SORT = ApiTypes.SortFields.Updated
const DEFAULT_ORDER = ApiTypes.SortOrder.DESC
const POST_PER_PAGE = 16

interface PlacesPageProps {
    category: string | null
    sort: ApiTypes.SortFields
    order: ApiTypes.SortOrder
    currentPage: number
    placesCount: number
    placesList: Place.Place[]
}

const PlacesPage: NextPage<PlacesPageProps> = (props) => {
    const { category, sort, order, currentPage, placesCount, placesList } =
        props
    const { t } = useTranslation('common', { keyPrefix: 'page.places' })

    const { data: categoryData, isLoading } = API.useCategoriesGetListQuery()

    const geolocation = useGeolocation()
    const router = useRouter()

    const initialFilter: PlacesFilterType = {
        category: category ?? undefined,
        order: order !== DEFAULT_ORDER ? order : undefined,
        page: currentPage !== 1 ? currentPage : undefined,
        sort: sort !== DEFAULT_SORT ? sort : undefined
    }

    const handleChangeFilter = async (
        key: keyof PlacesFilterType,
        value: string | number
    ) => {
        const filter = { ...initialFilter, [key]: value }
        const result = {
            category: filter.category ?? undefined,
            order: filter.order !== DEFAULT_ORDER ? filter.order : undefined,
            page: filter.page !== 1 ? filter.page : undefined,
            sort: filter.sort !== DEFAULT_SORT ? filter.sort : undefined
        }

        return await router.push('/places' + encodeQueryData(result))
    }

    const [introduce] = API.useIntroduceMutation()

    const currentCategory = categoryData?.items?.find(
        ({ name }) => name === category
    )?.title

    const title = currentCategory
        ? `${t('shortTitle')}: ${currentCategory}`
        : t('title')

    const titlePage = `${title}${
        currentPage && currentPage !== 1 ? ` - Страница ${currentPage}` : ''
    }`

    useEffect(() => {
        if (geolocation?.latitude && geolocation?.longitude) {
            introduce({ lat: geolocation.latitude, lon: geolocation.longitude })
        }
    }, [geolocation.latitude, geolocation.longitude])

    return (
        <PageLayout
            title={titlePage}
            breadcrumb={category ? currentCategory : t('breadcrumb')}
            links={
                category
                    ? [{ link: '/places', text: t('breadcrumb') }]
                    : undefined
            }
        >
            <NextSeo title={titlePage} />
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
            <PlacesFilterPanel
                sort={sort}
                order={order}
                category={category}
                // location={location}
                onChange={handleChangeFilter}
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
                    urlParam={initialFilter}
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
            const category = (context.query.category as string) || null
            const sort =
                (context.query.sort as ApiTypes.SortFields) || DEFAULT_SORT
            const order =
                (context.query.order as ApiTypes.SortOrder) || DEFAULT_ORDER

            const translations = await serverSideTranslations(locale)

            const { data: placesList } = await store.dispatch(
                API.endpoints?.placesGetList.initiate({
                    category: category ?? null,
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
                    category,
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
