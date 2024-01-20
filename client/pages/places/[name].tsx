import { SITE_NAME } from '@/pages/_app'
import { GetServerSidePropsResult, NextPage } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import React from 'react'

import Container from '@/ui/container'

import { API, IMG_HOST, SITE_LINK } from '@/api/api'
import { wrapper } from '@/api/store'
import { ApiTypes, Photo, Place } from '@/api/types'

import PageLayout from '@/components/page-layout'
import PlaceDescription from '@/components/place/description'
import PlaceHeader from '@/components/place/header'
import PlaceInformation from '@/components/place/information'
import PlacePhotos from '@/components/place/photos'
import PlacesList from '@/components/places-list'

import { formatDateUTC } from '@/functions/helpers'

const NEAR_PLACES_COUNT = 3

interface PlacePageProps {
    randomId?: string
    place?: Place.Place
    photoList?: Photo.Photo[]
    nearPlaces?: Place.Place[]
}

const PlacePage: NextPage<PlacePageProps> = (props) => {
    const { randomId, place, photoList, nearPlaces } = props
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
        <PageLayout randomPlaceId={randomId}>
            <NextSeo
                title={place?.title}
                description={place?.content?.substring(0, 160)}
                openGraph={{
                    article: {
                        authors: [`${SITE_LINK}users/${place?.author?.id}`],
                        modifiedTime: formatDateUTC(place?.updated?.date),
                        publishedTime: formatDateUTC(place?.created?.date),
                        section: place?.category?.name,
                        tags: place?.tags?.map(({ title }) => title)
                    },
                    description: place?.content?.substring(0, 160),
                    images: photoList?.map((photo, index) => ({
                        alt: `${photo.title} - Фото ${index + 1}`,
                        height: photo.height,
                        url: `${IMG_HOST}photo/${place?.id}/${photo.filename}_thumb.${photo.extension}`,
                        width: photo.width
                    })),
                    siteName: SITE_NAME,
                    title: place?.title,
                    type: 'article',
                    url: SITE_LINK
                }}
            />

            <PlaceHeader
                place={place}
                ratingValue={ratingData?.rating ?? place?.rating}
                ratingCount={ratingData?.count}
                breadcrumbs={[
                    {
                        link: '/places/',
                        text: t('breadcrumb')
                    }
                ]}
            />

            <PlaceInformation
                place={place}
                ratingValue={ratingData?.vote}
                loading={ratingLoading}
            />

            <PlacePhotos
                photos={photoList}
                placeId={place?.id}
            />

            <PlaceDescription
                placeId={place?.id}
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
                    lat: placeData?.lat,
                    limit: NEAR_PLACES_COUNT,
                    lng: placeData?.lng,
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
                    place: placeData,
                    randomId: placeData?.randomId
                }
            }
        }
)

export default PlacePage
