import { GetServerSidePropsResult, NextPage } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/dist/client/router'
import React from 'react'

import Container from '@/ui/container'

import { API } from '@/api/api'
import { wrapper } from '@/api/store'
import { ApiTypes } from '@/api/types'

import PageLayout from '@/components/page-layout'
import PlaceDescription from '@/components/place/description'
import PlaceHeader from '@/components/place/header'
import PlaceInformation from '@/components/place/information'
import PlacePhotos from '@/components/place/photos'
import PlacesList from '@/components/places-list'

const NEAR_PLACES_COUNT = 4

const PlacePage: NextPage = () => {
    const { t } = useTranslation('common', { keyPrefix: 'page.place' })
    const router = useRouter()
    const routerId = router.query.name
    const placeId = typeof routerId === 'string' ? routerId : ''

    // const authSlice = useAppSelector((state) => state.auth)

    const { data: placeData, isLoading } = API.usePlacesGetItemQuery(placeId, {
        skip: router.isFallback || !routerId
    })

    const { data: ratingData, isLoading: ratingLoading } =
        API.useRatingGetListQuery(placeId, {
            skip: router.isFallback || !routerId
        })

    const { data: photosData } = API.usePhotosGetListQuery(
        { place: placeId },
        {
            skip: router.isFallback || !routerId
        }
    )

    // const [setBookmark, { isLoading: bookmarkPutLoading }] =
    //     API.useBookmarksPutPlaceMutation()

    // const [setVisited, { isLoading: visitedPutLoading }] =
    //     API.useVisitedPutPlaceMutation()

    // const { data: bookmarksUserData, isLoading: bookmarksUserLoading } =
    //     API.useBookmarksGetCheckPlaceQuery(
    //         { place: placeData?.id! },
    //         { skip: !placeData?.id || !authSlice.isAuth }
    //     )

    const { data: nearPlacesData, isLoading: nearPlacesLoading } =
        API.usePlacesGetListQuery(
            {
                excludePlaces: placeData?.id ? [placeData.id] : undefined,
                latitude: placeData?.latitude,
                limit: NEAR_PLACES_COUNT,
                longitude: placeData?.longitude,
                order: ApiTypes.SortOrder.ASC,
                sort: ApiTypes.SortFields.Distance
            },
            { skip: !placeData?.longitude || !placeData?.latitude }
        )

    // const { data: activityData } = API.useActivityGetListQuery(
    //     {
    //         place: placeData?.id
    //     },
    //     {
    //         skip: !placeData?.id
    //     }
    // )

    // const handlePutPlaceBookmark = () => {
    //     setBookmark({ place: placeData?.id! })
    // }

    // const handlePutPlaceVisited = () => {
    //     setVisited({ place: placeData?.id! })
    // }

    return (
        <PageLayout
            title={placeData?.title}
            breadcrumb={placeData?.title}
            links={[
                {
                    link: '/places/',
                    text: t('breadcrumb')
                }
            ]}
        >
            <NextSeo title={placeData?.title} />
            <PlaceHeader
                place={placeData}
                ratingValue={ratingData?.rating || placeData?.rating}
                ratingCount={ratingData?.count}
            />
            <PlaceInformation
                place={placeData}
                ratingValue={ratingData?.vote}
                loading={isLoading || ratingLoading}
            />
            <PlacePhotos
                title={placeData?.title}
                photos={photosData?.items}
                placeId={placeData?.id}
            />
            <PlaceDescription
                id={placeData?.id}
                title={placeData?.title}
                content={placeData?.content}
                tags={placeData?.tags}
            />
            <Container>
                <h2>{'Ближайшие места рядом'}</h2>
                {`Найдены несколько ближайших интересных мест в радиусе ${Math.max(
                    ...(nearPlacesData?.items?.map(
                        ({ distance }) => distance || 0
                    ) || [])
                )} км`}
            </Container>
            <PlacesList places={nearPlacesData?.items} />
        </PageLayout>
    )
}

export const getServerSideProps = wrapper.getServerSideProps(
    (store) =>
        async (context): Promise<GetServerSidePropsResult<any>> => {
            const id = context.params?.name
            const locale = context.locale ?? 'en'
            const translations = await serverSideTranslations(locale)

            if (typeof id !== 'string') {
                return { notFound: true }
            }

            const data: any = await store.dispatch(
                API.endpoints.placesGetItem.initiate(id)
            )

            store.dispatch(API.endpoints.photosGetList.initiate({ place: id }))

            await Promise.all(store.dispatch(API.util.getRunningQueriesThunk()))

            if (data.error?.originalStatus === 404) {
                return { notFound: true }
            }

            return { props: { ...translations, data } }
        }
)

export default PlacePage
