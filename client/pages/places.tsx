import { GetServerSidePropsResult, NextPage } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/dist/client/router'
import React, { useEffect, useMemo } from 'react'
import useGeolocation from 'react-hook-geolocation'

import Breadcrumbs from '@/ui/breadcrumbs'
import Container from '@/ui/container'
import Pagination from '@/ui/pagination'

import { API } from '@/api/api'
import { wrapper } from '@/api/store'
import { ApiTypes, Place } from '@/api/types'

import PageLayout from '@/components/page-layout'
import styles from '@/components/place/header/styles.module.sass'
import PlacesFilterPanel from '@/components/places-filter-panel'
import { PlacesFilterType } from '@/components/places-filter-panel/types'
import PlacesList from '@/components/places-list'

import { encodeQueryData } from '@/functions/helpers'

const DEFAULT_SORT = ApiTypes.SortFields.Updated
const DEFAULT_ORDER = ApiTypes.SortOrder.DESC
const POST_PER_PAGE = 16

interface PlacesPageProps {
    country: number | null
    region: number | null
    district: number | null
    city: number | null
    category: string | null
    sort: ApiTypes.SortFields
    order: ApiTypes.SortOrder
    currentPage: number
    placesCount: number
    placesList: Place.Place[]
}

const PlacesPage: NextPage<PlacesPageProps> = (props) => {
    const {
        country,
        region,
        district,
        city,
        category,
        sort,
        order,
        currentPage,
        placesCount,
        placesList
    } = props

    const locationUnset = !country && !region && !district && !city
    const locationType = country
        ? 'country'
        : region
        ? 'region'
        : district
        ? 'district'
        : 'city'

    const { t } = useTranslation('common', { keyPrefix: 'page.places' })
    const { data: categoryData } = API.useCategoriesGetListQuery()
    const { data: locationData } = API.useLocationGetByTypeQuery(
        {
            id: country ?? region ?? district ?? city,
            type: locationType
        },
        { skip: locationUnset }
    )

    const [introduce] = API.useIntroduceMutation()

    const geolocation = useGeolocation()
    const router = useRouter()

    const initialFilter: PlacesFilterType = {
        category: category ?? undefined,
        city: city ?? undefined,
        country: country ?? undefined,
        district: district ?? undefined,
        order: order !== DEFAULT_ORDER ? order : undefined,
        page: currentPage !== 1 ? currentPage : undefined,
        region: region ?? undefined,
        sort: sort !== DEFAULT_SORT ? sort : undefined
    }

    const handleChangeFilter = async (
        key: keyof PlacesFilterType,
        value: string | number | undefined
    ) => {
        const filter = { ...initialFilter, [key]: value }
        const update = {
            category: filter.category ?? undefined,
            city: filter.city ?? undefined,
            country: filter.country ?? undefined,
            district: filter.district ?? undefined,
            order: filter.order !== DEFAULT_ORDER ? filter.order : undefined,
            page: filter.page !== 1 ? filter.page : undefined,
            region: filter.region ?? undefined,
            sort: filter.sort !== DEFAULT_SORT ? filter.sort : undefined
        }

        return await router.push('/places' + encodeQueryData(update))
    }

    const handleClearLocationFilter = async () => {
        const filter = {
            ...initialFilter,
            city: undefined,
            country: undefined,
            district: undefined,
            region: undefined
        }
        return await router.push('/places' + encodeQueryData(filter))
    }

    const handleChangeLocation = async (
        location?: ApiTypes.PlaceLocationType
    ) => {
        if (!location) {
            await handleClearLocationFilter()
        } else {
            await handleChangeFilter(location?.type ?? 'city', location?.key)
        }
    }

    const currentCategory = categoryData?.items?.find(
        ({ name }) => name === category
    )?.title

    const title = useMemo(() => {
        if (!currentCategory && locationUnset) {
            return t('title')
        }

        let titles = []

        if (!locationUnset) {
            titles.push(locationData?.name)
        }

        if (currentCategory) {
            titles.push(currentCategory)
        }

        return `${t('shortTitle')}: ${titles.join(', ')}`
    }, [currentCategory, locationData, locationUnset])

    const breadcrumbsLinks = useMemo(() => {
        let breadcrumbs = []

        if (category || !locationUnset) {
            breadcrumbs.push({ link: '/places', text: t('breadcrumb') })
        }

        if (!locationUnset && category) {
            breadcrumbs.push({
                link: `/places?${locationType}=${locationData?.id}`,
                text: locationData?.name!
            })
        }

        return breadcrumbs
    }, [category, locationData, locationUnset])

    useEffect(() => {
        if (geolocation?.latitude && geolocation?.longitude) {
            introduce({ lat: geolocation.latitude, lon: geolocation.longitude })
        }
    }, [geolocation.latitude, geolocation.longitude])

    return (
        <PageLayout>
            <NextSeo title={title} />
            <Container className={'pageHeader'}>
                <header>
                    <h1>{title}</h1>
                    <Breadcrumbs
                        currentPage={
                            category
                                ? currentCategory
                                : !locationUnset
                                ? locationData?.name
                                : t('breadcrumb')
                        }
                        links={breadcrumbsLinks || []}
                    />
                </header>
            </Container>
            <PlacesFilterPanel
                sort={sort}
                order={order}
                category={category}
                location={
                    locationData && !locationUnset
                        ? {
                              key: locationData.id,
                              type: locationType,
                              value: locationData.name
                          }
                        : undefined
                }
                onChange={handleChangeFilter}
                onChangeLocation={handleChangeLocation}
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

            const country =
                parseInt(context.query.country as string, 10) || null
            const region = parseInt(context.query.region as string, 10) || null
            const district =
                parseInt(context.query.district as string, 10) || null
            const city = parseInt(context.query.city as string, 10) || null

            const currentPage = parseInt(context.query.page as string, 10) || 1
            const category = (context.query.category as string) || null
            const sort =
                (context.query.sort as ApiTypes.SortFields) || DEFAULT_SORT
            const order =
                (context.query.order as ApiTypes.SortOrder) || DEFAULT_ORDER

            const translations = await serverSideTranslations(locale)

            const { data: placesList } = await store.dispatch(
                API.endpoints?.placesGetList.initiate({
                    category,
                    city,
                    country,
                    district,
                    limit: POST_PER_PAGE,
                    offset: (currentPage - 1) * POST_PER_PAGE,
                    order: order,
                    region,
                    sort: sort
                })
            )

            await Promise.all(store.dispatch(API.util.getRunningQueriesThunk()))

            return {
                props: {
                    ...translations,
                    category,
                    city,
                    country,
                    currentPage,
                    district,
                    order,
                    placesCount: placesList?.count || 0,
                    placesList: placesList?.items || [],
                    region,
                    sort
                }
            }
        }
)

export default PlacesPage
