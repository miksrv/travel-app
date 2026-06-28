import React, { useCallback, useMemo } from 'react'
import { Container } from 'simple-react-ui-kit'

import type { GetServerSidePropsResult, NextPage } from 'next'
import { useRouter } from 'next/dist/client/router'
import Head from 'next/head'
import { useTranslation } from 'next-i18next/pages'
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations'
import { JsonLdScript } from 'next-seo'
import { generateNextSeo } from 'next-seo/pages'

import { API, ApiModel, ApiType } from '@/api'
import { setLocale } from '@/app/applicationSlice'
import { wrapper } from '@/app/store'
import { AppLayout, EmptyState, PageHeader, PlacesList } from '@/components/shared'
import { Pagination } from '@/components/ui'
import { AUTH_COOKIES } from '@/config/constants'
import { IMG_HOST, SITE_LINK } from '@/config/env'
import { PlaceFilterPanel, PlacesFilterType } from '@/sections/place'
import { encodeQueryData } from '@/utils/helpers'
import { PlaceSchema } from '@/utils/schema'
import { buildHreflangTags } from '@/utils/seo'
import { hydrateAuthFromCookies } from '@/utils/serverSideAuth'

const DEFAULT_SORT = ApiType.SortFields.Trending
const DEFAULT_ORDER = ApiType.SortOrders.DESC
const POST_PER_PAGE = 21

interface PlacesPageProps {
    categoriesData: ApiModel.Category[]
    locationType: ApiType.LocationTypes | null
    locationData: ApiModel.AddressItem | null
    country: number | null
    region: number | null
    district: number | null
    locality: number | null
    /** Comma-joined category names (may be empty string for none). */
    category: string | null
    tag: string | null
    search: string | null
    bookmarksUser: string | null
    lat: number | null
    lon: number | null
    sort: ApiType.SortFieldsType
    order: ApiType.SortOrdersType
    currentPage: number
    placesCount: number
    placesList: ApiModel.Place[]
}

const PlacesPage: NextPage<PlacesPageProps> = ({
    categoriesData,
    locationType,
    locationData,
    country,
    region,
    district,
    locality,
    category,
    tag,
    search,
    bookmarksUser,
    lat,
    lon,
    sort,
    order,
    currentPage,
    placesCount,
    placesList
}) => {
    const { t, i18n } = useTranslation()

    const router = useRouter()

    const selectedCategories = useMemo(() => (category ? category.split(',').filter(Boolean) : []), [category])

    const bookmarksOnly = !!bookmarksUser

    const initialFilter: PlacesFilterType = {
        bookmarks: bookmarksOnly ? '1' : undefined,
        category: category ?? undefined,
        country: country ?? undefined,
        district: district ?? undefined,
        lat: lat ?? undefined,
        locality: locality ?? undefined,
        lon: lon ?? undefined,
        order: order !== DEFAULT_ORDER ? order : undefined,
        page: currentPage !== 1 ? currentPage : undefined,
        region: region ?? undefined,
        search: search ?? undefined,
        sort: sort !== DEFAULT_SORT ? sort : undefined,
        tag: tag ?? undefined
    }

    const canonicalUrl = SITE_LINK + (i18n.language === 'en' ? 'en/' : '')
    const canonicalPage = `${canonicalUrl}places${encodeQueryData({
        ...initialFilter,
        bookmarks: undefined,
        lat: undefined,
        lon: undefined,
        order: undefined,
        search: undefined,
        sort: undefined
    })}`

    const pushFilter = useCallback(
        async (next: PlacesFilterType, resetPage = false) => {
            const update: PlacesFilterType = {
                bookmarks: next.bookmarks,
                category: next.category || undefined,
                country: next.country,
                district: next.district,
                lat: next.lat,
                locality: next.locality,
                lon: next.lon,
                order: next.order && next.order !== DEFAULT_ORDER ? next.order : undefined,
                page: resetPage ? undefined : next.page && next.page !== 1 ? next.page : undefined,
                region: next.region,
                search: next.search || undefined,
                sort: next.sort && next.sort !== DEFAULT_SORT ? next.sort : undefined,
                tag: next.tag
            }
            return await router.push('/places' + encodeQueryData(update))
        },
        [router]
    )

    const handleChangeFilter = useCallback(
        async (key: keyof PlacesFilterType, value: string | number | undefined) => {
            const next = { ...initialFilter, [key]: value }
            const changesScope =
                key === 'category' ||
                key === 'country' ||
                key === 'district' ||
                key === 'region' ||
                key === 'locality' ||
                key === 'bookmarks' ||
                key === 'search'
            return await pushFilter(next, changesScope && currentPage !== 1)
        },
        [initialFilter, currentPage, pushFilter]
    )

    const handleClearLocationFilter = async () => {
        return await pushFilter(
            { ...initialFilter, country: undefined, district: undefined, locality: undefined, region: undefined },
            currentPage !== 1
        )
    }

    const handleChangeLocation = async (location?: ApiModel.AddressItem) => {
        if (!location) {
            await handleClearLocationFilter()
        } else {
            await handleChangeFilter(location.type ?? 'locality', location.id)
        }
    }

    const handleChangeCategories = async (next: string[]) => {
        await handleChangeFilter('category', next.length ? next.join(',') : undefined)
    }

    const handleChangeSearch = async (value: string) => {
        await handleChangeFilter('search', value || undefined)
    }

    const handleChangeBookmarksOnly = async (value: boolean) => {
        await handleChangeFilter('bookmarks', value ? '1' : undefined)
    }

    const handleResetAll = async () => {
        await router.push('/places')
    }

    const currentCategory =
        selectedCategories.length === 1
            ? categoriesData.find(({ name }) => name === selectedCategories[0])?.title
            : undefined

    const title = useMemo(() => {
        const titleTag = tag ? ` #${tag}` : ''
        const titlePage = initialFilter.page && initialFilter.page > 1 ? ` - ${t('page')} ${initialFilter.page}` : ''

        if (!currentCategory && !locationType) {
            return t('interesting-places') + titleTag + titlePage
        }

        const titles = []

        if (locationType) {
            titles.push(locationData?.name)
        }

        if (currentCategory) {
            titles.push(currentCategory)
        }

        return `${t('interesting-places')}: ${titles.join(', ')}` + titleTag + titlePage
    }, [currentCategory, locationData, locationType, i18n.language, initialFilter])

    const description = useMemo(() => {
        const base = t('places-seo-description')
        if (!currentCategory && !locationType && !tag) {
            return base
        }
        return `${title} — ${base}`
    }, [title, currentCategory, locationType, tag, i18n.language])

    const breadcrumbsLinks = useMemo(() => {
        const breadcrumbs = []

        if (currentCategory || locationType || tag || currentPage > 1) {
            breadcrumbs.push({
                link: '/places',
                text: t('interesting-places')
            })
        }

        if (locationType && currentCategory) {
            breadcrumbs.push({
                link: `/places?${locationType}=${locationData?.id}`,
                text: locationData?.name ?? ''
            })
        }

        return breadcrumbs
    }, [currentCategory, locationData, locationType, tag, currentPage])

    const breadCrumbCurrent = currentCategory
        ? currentCategory
        : locationType
          ? locationData?.name
          : tag
            ? `#${tag}`
            : currentPage > 1
              ? `${t('page')} ${initialFilter.page}`
              : t('interesting-places')

    const breadCrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                item: canonicalUrl,
                name: t('geotags'),
                position: 1
            },
            ...(breadcrumbsLinks?.map((link, i) => ({
                '@type': 'ListItem',
                item: `${canonicalUrl}${link.link.replace(/^\//, '')}`,
                name: link.text,
                position: i + 2
            })) || []),
            {
                '@type': 'ListItem',
                item: canonicalPage,
                name: breadCrumbCurrent,
                position: breadcrumbsLinks.length + 2
            }
        ]
    }

    const isGeoFiltered = !!(lat || lon || sort !== DEFAULT_SORT || order !== DEFAULT_ORDER || search || bookmarksOnly)

    const filterPanel = (
        <PlaceFilterPanel
            sort={sort}
            order={order}
            categories={selectedCategories}
            search={search ?? undefined}
            bookmarksOnly={bookmarksOnly}
            location={
                locationData && locationType
                    ? { id: locationData.id, name: locationData.name, type: locationType }
                    : undefined
            }
            onChange={handleChangeFilter}
            onChangeLocation={handleChangeLocation}
            onChangeCategories={handleChangeCategories}
            onChangeSearch={handleChangeSearch}
            onChangeBookmarksOnly={handleChangeBookmarksOnly}
            onResetAll={handleResetAll}
        />
    )

    return (
        <AppLayout
            sidebar={filterPanel}
            sidebarTitle={t('filters')}
        >
            <Head>
                {generateNextSeo({
                    title: title,
                    description: description,
                    canonical: canonicalPage,
                    noindex: isGeoFiltered,
                    nofollow: false,
                    openGraph: {
                        description: description,
                        images: placesList
                            .filter(({ cover }) => cover?.full)
                            .slice(0, 3)
                            .map(({ cover, title }) => ({
                                alt: `${title}`,
                                url: `${IMG_HOST}${cover?.full}`
                            })),
                        locale: i18n.language === 'ru' ? 'ru_RU' : 'en_US',
                        siteName: t('geotags'),
                        title: title,
                        type: 'website',
                        url: canonicalPage
                    },
                    twitter: { cardType: 'summary_large_image' },
                    additionalLinkTags: buildHreflangTags('places')
                })}
            </Head>

            <JsonLdScript
                scriptKey={'places-breadcrumb'}
                data={breadCrumbSchema}
            />
            <JsonLdScript
                scriptKey={'places-list'}
                data={placesList.map((place) => PlaceSchema(place, SITE_LINK))}
            />
            {!isGeoFiltered && (currentCategory || tag) && (
                <JsonLdScript
                    scriptKey={'places-item-list'}
                    data={{
                        '@context': 'https://schema.org',
                        '@type': 'ItemList',
                        name: title,
                        url: canonicalPage,
                        itemListElement: placesList.map((place, index) => ({
                            '@type': 'ListItem',
                            position: (currentPage - 1) * POST_PER_PAGE + index + 1,
                            url: `${SITE_LINK}places/${place.id}`
                        }))
                    }}
                />
            )}

            <PageHeader
                title={title}
                homePageTitle={t('geotags')}
                links={breadcrumbsLinks || []}
                currentPage={breadCrumbCurrent}
            />

            {placesList?.length ? (
                <>
                    <PlacesList places={placesList} />
                    <Container className={'paginationContainer'}>
                        <div>
                            {t('geotags_count')} <strong>{placesCount}</strong>
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            captionPage={t('page')}
                            captionNextPage={t('next-page')}
                            captionPrevPage={t('prev-page')}
                            totalItemsCount={placesCount}
                            perPage={POST_PER_PAGE}
                            urlParam={initialFilter}
                            linkPart={'places'}
                        />
                    </Container>
                </>
            ) : (
                <Container>
                    <EmptyState />
                </Container>
            )}
        </AppLayout>
    )
}

export const getServerSideProps = wrapper.getServerSideProps(
    (store) =>
        async (context): Promise<GetServerSidePropsResult<PlacesPageProps>> => {
            const cookies = context.req.cookies
            const locale = (context.locale ?? 'en') as ApiType.Locale

            const country = parseInt(context.query.country as string, 10) || null
            const region = parseInt(context.query.region as string, 10) || null
            const district = parseInt(context.query.district as string, 10) || null
            const locality = parseInt(context.query.locality as string, 10) || null

            const currentPage = parseInt(context.query.page as string, 10) || 1
            const rawCategory = (context.query.category as string) || null

            const lat = parseFloat(context.query.lat as string) || null
            const lon = parseFloat(context.query.lon as string) || null

            const tag = (context.query.tag as string) || null
            const search = ((context.query.search as string) || '').trim() || null
            const bookmarksParam = (context.query.bookmarks as string) || null

            const sort =
                (context.query.sort as ApiType.SortFieldsType) ||
                (cookies[AUTH_COOKIES.TOKEN] ? ApiType.SortFields.Recommended : DEFAULT_SORT)
            const order = (context.query.order as ApiType.SortOrdersType) || DEFAULT_ORDER

            hydrateAuthFromCookies(store, cookies)

            const authState = store.getState().auth

            let bookmarksUser: string | null = null
            if (bookmarksParam === '1' && authState.isAuth) {
                const { data: authData } = await store.dispatch(API.endpoints.authGetMe.initiate())
                bookmarksUser = authData?.user?.id ?? null
            }

            const translations = await serverSideTranslations(locale)

            const locationType: ApiType.LocationTypes | null =
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
                      API.endpoints.locationGetByType.initiate({
                          id: country ?? region ?? district ?? locality,
                          type: locationType
                      })
                  )

            if (locationType && locationData?.isError) {
                return { notFound: true }
            }

            const { data: categoriesData } = await store.dispatch(
                API.endpoints.categoriesGetList.initiate({ places: true, counts: true })
            )

            // Normalise and validate selected categories against the known list.
            const knownNames = new Set((categoriesData?.items ?? []).map((c) => c.name))
            const selectedCategories = rawCategory
                ? rawCategory
                      .split(',')
                      .map((s) => s.trim())
                      .filter((c) => c && knownNames.has(c as ApiModel.Categories))
                : []

            if (rawCategory && rawCategory.split(',').length === 1 && selectedCategories.length === 0) {
                return { notFound: true }
            }

            const categoryParam: string | null = selectedCategories.length ? selectedCategories.join(',') : null

            const { data: placesList } = await store.dispatch(
                API.endpoints.placesGetList.initiate({
                    bookmarkUser: bookmarksUser ?? undefined,
                    category: categoryParam,
                    country,
                    district,
                    lat,
                    limit: POST_PER_PAGE,
                    locality,
                    lon,
                    offset: (currentPage - 1) * POST_PER_PAGE,
                    order: order,
                    region,
                    search: search ?? undefined,
                    searchScope: search ? 'title' : undefined,
                    sort: sort,
                    tag
                })
            )

            await Promise.all(store.dispatch(API.util.getRunningQueriesThunk()))

            return {
                props: {
                    ...translations,
                    bookmarksUser,
                    categoriesData: categoriesData?.items ?? [],
                    category: categoryParam,
                    country,
                    currentPage,
                    district,
                    lat,
                    locality,
                    locationData: locationData?.data || null,
                    locationType,
                    lon,
                    order,
                    placesCount: placesList?.count ?? 0,
                    placesList: placesList?.items ?? [],
                    region,
                    search,
                    sort,
                    tag
                }
            }
        }
)

export default PlacesPage
