import { GetServerSidePropsResult, NextPage } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

import { API } from '@/api/api'
import { setLocale } from '@/api/applicationSlice'
import { useAppSelector, wrapper } from '@/api/store'
import { ApiTypes, Photo, Place as PlaceType } from '@/api/types'

import AppLayout from '@/components/app-layout'
import Edit from '@/components/page-place/Edit'
import Place from '@/components/page-place/Place'

const NEAR_PLACES_COUNT = 6
const PAGES = ['edit', undefined] as const

type PageType = (typeof PAGES)[number]

export interface PlacePageProps {
    randomId?: string
    page: PageType | null
    place?: PlaceType.Place
    photoList?: Photo.Photo[]
    nearPlaces?: PlaceType.Place[]
}

const PlacePage: NextPage<PlacePageProps> = ({ randomId, page, ...props }) => {
    const authSlice = useAppSelector((state) => state.auth)

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
        <AppLayout randomPlaceId={randomId}>
            {page === 'edit' && authSlice?.isAuth ? (
                <Edit {...props} />
            ) : (
                <Place {...props} />
            )}
        </AppLayout>
    )
}

export const getServerSideProps = wrapper.getServerSideProps(
    (store) =>
        async (context): Promise<GetServerSidePropsResult<PlacePageProps>> => {
            const id = context.params?.slug?.[0]
            const page = context.params?.slug?.[1] as PageType
            const locale = (context.locale ?? 'en') as ApiTypes.LocaleType

            const translations = await serverSideTranslations(locale)

            if (typeof id !== 'string' || !PAGES.includes(page)) {
                return { notFound: true }
            }

            store.dispatch(setLocale(locale))

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
                    lon: placeData?.lon,
                    order: ApiTypes.SortOrderTypes.ASC,
                    sort: ApiTypes.SortFieldsTypes.Distance
                })
            )

            await Promise.all(store.dispatch(API.util.getRunningQueriesThunk()))

            return {
                props: {
                    ...translations,
                    nearPlaces: nearPlaces?.items,
                    page: page ?? null,
                    photoList: photosData?.items,
                    place: placeData,
                    randomId: placeData?.randomId
                }
            }
        }
)

export default PlacePage
