import { GetServerSidePropsResult, NextPage } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/dist/client/router'
import React, { useMemo, useState } from 'react'

import Button from '@/ui/button'
import Container from '@/ui/container'
import Dialog from '@/ui/dialog'
import Pagination from '@/ui/pagination'

import { API } from '@/api/api'
import { setLocale, toggleOverlay } from '@/api/applicationSlice'
import { useAppDispatch, wrapper } from '@/api/store'
import { ApiTypes, Place } from '@/api/types'
import { Category, LocationObject, Tag } from '@/api/types/Place'

import AppLayout from '@/components/app-layout'
import Header from '@/components/header'
import PlacesFilterPanel from '@/components/places-filter-panel'
import { PlacesFilterType } from '@/components/places-filter-panel/types'
import PlacesList from '@/components/places-list'

import { encodeQueryData } from '@/functions/helpers'

const DEFAULT_SORT = ApiTypes.SortFields.Updated
const DEFAULT_ORDER = ApiTypes.SortOrder.DESC
const POST_PER_PAGE = 21

interface PlacesPageProps {
    categoriesData: Category[]
    locationType: ApiTypes.LocationTypes | null
    locationData: LocationObject | null
    tagData: Tag | null
    country: number | null
    region: number | null
    district: number | null
    locality: number | null
    category: string | null
    tag: string | null
    sort: ApiTypes.SortFields
    order: ApiTypes.SortOrder
    currentPage: number
    placesCount: number
    placesList: Place.Place[]
}

const PlacesPage: NextPage<PlacesPageProps> = ({
    categoriesData,
    locationType,
    locationData,
    tagData,
    country,
    region,
    district,
    locality,
    category,
    tag,
    sort,
    order,
    currentPage,
    placesCount,
    placesList
}) => {
    const { t, i18n } = useTranslation('common', {
        keyPrefix: 'pages.places.placesPage'
    })

    const router = useRouter()
    const dispatch = useAppDispatch()

    const [filterOpenTitle, setFilterOpenTitle] = useState<string>('')
    const [filtersOptionsOpen, setFiltersOptionsOpen] = useState<boolean>(false)
    const [filtersDialogOpen, setFiltersDialogOpen] = useState<boolean>(false)

    const initialFilter: PlacesFilterType = {
        category: category ?? undefined,
        country: country ?? undefined,
        district: district ?? undefined,
        locality: locality ?? undefined,
        order: order !== DEFAULT_ORDER ? order : undefined,
        page: currentPage !== 1 ? currentPage : undefined,
        region: region ?? undefined,
        sort: sort !== DEFAULT_SORT ? sort : undefined,
        tag: tag ?? undefined
    }

    const handleChangeFilter = async (
        key: keyof PlacesFilterType,
        value: string | number | undefined
    ) => {
        const filter = { ...initialFilter, [key]: value }
        const update = {
            category: filter.category ?? undefined,
            country: filter.country ?? undefined,
            district: filter.district ?? undefined,
            locality: filter.locality ?? undefined,
            order: filter.order !== DEFAULT_ORDER ? filter.order : undefined,
            page: filter.page !== 1 ? filter.page : undefined,
            region: filter.region ?? undefined,
            sort: filter.sort !== DEFAULT_SORT ? filter.sort : undefined,
            tag: filter.tag ?? undefined
        }

        if (
            (filter.category !== category ||
                filter.country !== country ||
                filter.district !== district ||
                filter.region !== region ||
                filter.locality !== locality) &&
            currentPage !== 1
        ) {
            update.page = undefined
        }

        setFiltersOptionsOpen(false)
        setFilterOpenTitle('')

        return await router.push('/places' + encodeQueryData(update))
    }

    const handleClearLocationFilter = async () => {
        const filter = {
            ...initialFilter,
            country: undefined,
            district: undefined,
            locality: undefined,
            region: undefined
        }
        return await router.push('/places' + encodeQueryData(filter))
    }

    const handleOpenFilterOptions = (filterTitle?: string) => {
        setFiltersOptionsOpen(true)
        setFilterOpenTitle(filterTitle || '')
    }

    const handleChangeLocation = async (
        location?: ApiTypes.PlaceLocationType
    ) => {
        if (!location) {
            await handleClearLocationFilter()
        } else {
            await handleChangeFilter(
                location?.type ?? 'locality',
                location?.key
            )
        }
    }

    const currentCategory = categoriesData?.find(
        ({ name }) => name === category
    )?.title

    const title = useMemo(() => {
        const titleTag = tagData?.title ? ` #${tagData.title}` : ''
        const titlePage =
            initialFilter?.page && initialFilter.page > 1
                ? ` - ${t('titlePage')} ${initialFilter.page}`
                : ''

        if (!currentCategory && !locationType) {
            return t('title') + titleTag + titlePage
        }

        let titles = []

        if (locationType) {
            titles.push(locationData?.title)
        }

        if (currentCategory) {
            titles.push(currentCategory)
        }

        return `${t('title')}: ${titles.join(', ')}` + titleTag + titlePage
    }, [
        currentCategory,
        locationData,
        locationType,
        i18n.language,
        initialFilter
    ])

    const breadcrumbsLinks = useMemo(() => {
        let breadcrumbs = []

        if (category || locationType || tagData) {
            breadcrumbs.push({
                link: '/places',
                text: t('breadCrumbPlacesLink')
            })
        }

        if (locationType && category) {
            breadcrumbs.push({
                link: `/places?${locationType}=${locationData?.id}`,
                text: locationData?.title!
            })
        }

        return breadcrumbs
    }, [category, locationData, locationType, tagData])

    const filtersCount = useMemo(() => {
        let count = 0

        if (locationType) {
            count++
        }

        if (category) {
            count++
        }

        return count
    }, [category, locationType])

    const handleClickOpenFiltersDialog = () => {
        dispatch(toggleOverlay(true))
        setFiltersDialogOpen(true)
    }

    const handleFiltersDialogClose = () => {
        dispatch(toggleOverlay(false))
        setFiltersDialogOpen(false)
    }

    const handleFiltersBackLink = () => {
        setFiltersOptionsOpen(false)
        setFilterOpenTitle('')
    }

    return (
        <AppLayout>
            <NextSeo title={title} />
            <Header
                title={title}
                links={breadcrumbsLinks || []}
                currentPage={
                    category
                        ? currentCategory
                        : locationType
                        ? locationData?.title
                        : tagData?.title
                        ? `#${tagData?.title}`
                        : t('breadCrumbCurrent')
                }
                actions={
                    <Button
                        size={'m'}
                        mode={'primary'}
                        icon={'Tune'}
                        onClick={handleClickOpenFiltersDialog}
                    >
                        {t('buttonFilters')}
                        {filtersCount > 0 && ` (${filtersCount})`}
                    </Button>
                }
            />
            <PlacesList places={placesList} />
            <Container className={'pagination'}>
                <div>
                    {t('placesCount')} <strong>{placesCount}</strong>
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalPostCount={placesCount}
                    perPage={POST_PER_PAGE}
                    urlParam={initialFilter}
                    linkPart={'places'}
                />
            </Container>

            <Dialog
                contentHeight={'306px'}
                header={filterOpenTitle || t('dialogFiltersTitle')}
                open={filtersDialogOpen}
                showBackLink={filtersOptionsOpen}
                onBackClick={handleFiltersBackLink}
                onCloseDialog={handleFiltersDialogClose}
            >
                <PlacesFilterPanel
                    sort={sort}
                    order={order}
                    category={category}
                    optionsOpen={filtersOptionsOpen}
                    location={
                        locationData && locationType
                            ? {
                                  key: locationData.id,
                                  type: locationType,
                                  value: locationData.title
                              }
                            : undefined
                    }
                    onChange={handleChangeFilter}
                    onOpenOptions={handleOpenFilterOptions}
                    onChangeLocation={handleChangeLocation}
                />
            </Dialog>
        </AppLayout>
    )
}

export const getServerSideProps = wrapper.getServerSideProps(
    (store) =>
        async (context): Promise<GetServerSidePropsResult<PlacesPageProps>> => {
            const locale = (context.locale ?? 'en') as ApiTypes.LocaleType

            const country =
                parseInt(context.query.country as string, 10) || null
            const region = parseInt(context.query.region as string, 10) || null
            const district =
                parseInt(context.query.district as string, 10) || null
            const locality =
                parseInt(context.query.locality as string, 10) || null

            const currentPage = parseInt(context.query.page as string, 10) || 1
            const category = (context.query.category as string) || null
            const tag = (context.query.tag as string) || null
            const sort =
                (context.query.sort as ApiTypes.SortFields) || DEFAULT_SORT
            const order =
                (context.query.order as ApiTypes.SortOrder) || DEFAULT_ORDER

            const translations = await serverSideTranslations(locale)

            const locationType: ApiTypes.LocationTypes | null =
                !country && !region && !district && !locality
                    ? null
                    : country
                    ? 'country'
                    : region
                    ? 'region'
                    : district
                    ? 'district'
                    : 'locality'

            store.dispatch(setLocale(locale))

            const locationData = !locationType
                ? null
                : await store.dispatch(
                      API.endpoints?.locationGetByType.initiate({
                          id: country ?? region ?? district ?? locality,
                          type: locationType
                      })
                  )

            const tagData = !tag
                ? null
                : await store.dispatch(API.endpoints?.tagsGetItem.initiate(tag))

            const { data: categoriesData } = await store.dispatch(
                API.endpoints?.categoriesGetList.initiate()
            )

            const { data: placesList } = await store.dispatch(
                API.endpoints?.placesGetList.initiate({
                    category,
                    country,
                    district,
                    limit: POST_PER_PAGE,
                    locality,
                    offset: (currentPage - 1) * POST_PER_PAGE,
                    order: order,
                    region,
                    sort: sort,
                    tag
                })
            )

            await Promise.all(store.dispatch(API.util.getRunningQueriesThunk()))

            return {
                props: {
                    ...translations,
                    categoriesData: categoriesData?.items || [],
                    category,
                    country,
                    currentPage,
                    district,
                    locality,
                    locationData: locationData?.data || null,
                    locationType,
                    order,
                    placesCount: placesList?.count || 0,
                    placesList: placesList?.items || [],
                    region,
                    sort,
                    tag,
                    tagData: tagData?.data || null
                }
            }
        }
)

export default PlacesPage
