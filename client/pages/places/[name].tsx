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
import { Photo } from '@/api/types/Photo'
import { Place } from '@/api/types/Place'

import PageLayout from '@/components/page-layout'
import PlaceDescription from '@/components/place/description'
import PlaceHeader from '@/components/place/header'
import PlaceInformation from '@/components/place/information'
import PlacePhotos from '@/components/place/photos'
import PlacesList from '@/components/places-list'

const NEAR_PLACES_COUNT = 4

interface PlacePageProps {
    place?: Place
    photoList?: Photo[]
    nearPlaces?: Place[]
}

const PlacePage: NextPage<PlacePageProps> = (props) => {
    const { place, photoList, nearPlaces } = props
    const { t } = useTranslation('common', { keyPrefix: 'page.place' })
    const { data: ratingData, isLoading: ratingLoading } =
        API.useRatingGetListQuery(place?.id!, {
            skip: !place?.id
        })

    // const [setBookmark, { isLoading: bookmarkPutLoading }] =
    //     API.useBookmarksPutPlaceMutation()
    //
    // const [setVisited, { isLoading: visitedPutLoading }] =
    //     API.useVisitedPutPlaceMutation()
    //
    // const { data: bookmarksUserData, isLoading: bookmarksUserLoading } =
    //     API.useBookmarksGetCheckPlaceQuery(
    //         { place: placeData?.id! },
    //         { skip: !placeData?.id || !authSlice.isAuth }
    //     )

    // const { data: activityData } = API.useActivityGetListQuery(
    //     {
    //         place: placeData?.id
    //     },
    //     {
    //         skip: !placeData?.id
    //     }
    // )

    return (
        <PageLayout
            title={place?.title}
            breadcrumb={place?.title}
            links={[
                {
                    link: '/places/',
                    text: t('breadcrumb')
                }
            ]}
        >
            <NextSeo title={place?.title} />
            <PlaceHeader
                place={place}
                ratingValue={ratingData?.rating ?? place?.rating}
                ratingCount={ratingData?.count}
            />
            <PlaceInformation
                place={place}
                ratingValue={ratingData?.vote}
                loading={ratingLoading}
            />
            <PlacePhotos
                title={place?.title}
                photos={photoList}
                placeId={place?.id}
            />
            <PlaceDescription
                id={place?.id}
                title={place?.title}
                content={place?.content}
                tags={place?.tags}
            />
            <Container>
                <h2>{'Ближайшие места рядом'}</h2>
                {`Найдены несколько ближайших интересных мест в радиусе ${Math.max(
                    ...(nearPlaces?.map(({ distance }) => distance || 0) || [])
                )} км`}
            </Container>
            <PlacesList places={nearPlaces} />
        </PageLayout>
    )
}

export const getServerSideProps = wrapper.getServerSideProps(
    (store) =>
        async (context): Promise<GetServerSidePropsResult<PlacePageProps>> => {
            const id = context.params?.name
            const locale = context.locale ?? 'en'

            const translations = await serverSideTranslations(locale)

            if (typeof id !== 'string') {
                return { notFound: true }
            }

            const { data: placeData, isError } = await store.dispatch(
                API.endpoints.placesGetItem.initiate(id)
            )

            if (isError) {
                return { notFound: true }
            }

            const { data: photosData } = await store.dispatch(
                API.endpoints.photosGetList.initiate({ place: id })
            )

            const { data: nearPlaces } = await store.dispatch(
                API.endpoints?.placesGetList.initiate({
                    excludePlaces: [id],
                    latitude: placeData?.latitude,
                    limit: NEAR_PLACES_COUNT,
                    longitude: placeData?.longitude,
                    order: ApiTypes.SortOrder.ASC,
                    sort: ApiTypes.SortFields.Distance
                })
            )

            await Promise.all(store.dispatch(API.util.getRunningQueriesThunk()))

            return {
                props: {
                    ...translations,
                    nearPlaces: nearPlaces?.items,
                    photoList: photosData?.items,
                    place: placeData
                }
            }
        }
)

export default PlacePage
