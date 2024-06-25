import React from 'react'
import { GetServerSidePropsResult, NextPage } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { API } from '@/api/api'
import { setLocale } from '@/api/applicationSlice'
import { useAppSelector, wrapper } from '@/api/store'
import { ApiTypes, Photo, Place as PlaceType } from '@/api/types'
import AppLayout from '@/components/app-layout'
import Edit from '@/components/page-place/Edit'
import Place from '@/components/page-place/Place'
import { LOCAL_STORAGE } from '@/functions/constants'

const NEAR_PLACES_COUNT = 10
const PAGES = ['edit', undefined] as const

type PageType = (typeof PAGES)[number]

export interface PlacePageProps {
    page: PageType | null
    ratingCount: number
    place?: PlaceType.Place
    photoList?: Photo.Photo[]
    nearPlaces?: PlaceType.Place[] | null
}

const PlacePage: NextPage<PlacePageProps> = ({ page, ...props }) => {
    const isAuth = useAppSelector((state) => state.auth.isAuth)

    // const [setVisited, { isLoading: visitedPutLoading }] =
    //     API.useVisitedPutPlaceMutation()

    return <AppLayout>{page === 'edit' && isAuth ? <Edit {...props} /> : <Place {...props} />}</AppLayout>
}

export const getServerSideProps = wrapper.getServerSideProps(
    (store) =>
        async (context): Promise<GetServerSidePropsResult<PlacePageProps>> => {
            const id = context.params?.slug?.[0]
            const page = context.params?.slug?.[1] as PageType
            const cookies = context.req.cookies
            const locale = (context.locale ?? 'en') as ApiTypes.LocaleType

            const translations = await serverSideTranslations(locale)

            if (typeof id !== 'string' || !PAGES.includes(page)) {
                return { notFound: true }
            }

            let lat
            let lon

            if (cookies[LOCAL_STORAGE.LOCATION]) {
                const userLocation = cookies[LOCAL_STORAGE.LOCATION]?.split(';')

                if (userLocation?.[0] && userLocation[1]) {
                    lat = parseFloat(userLocation[0])
                    lon = parseFloat(userLocation[1])
                }
            }

            store.dispatch(setLocale(locale))

            const { data: placeData, isError } = await store.dispatch(
                API.endpoints.placesGetItem.initiate({
                    id,
                    lat: lat ?? null,
                    lon: lon ?? null
                })
            )

            if (isError) {
                return { notFound: true }
            }

            const { data: ratingData } = await store.dispatch(API.endpoints.ratingGetList.initiate(id))

            const { data: photosData } = await store.dispatch(API.endpoints.photosGetList.initiate({ place: id }))

            const { data: nearPlaces } = await store.dispatch(
                API.endpoints.placesGetList.initiate({
                    excludePlaces: [id],
                    lat: placeData?.lat,
                    limit: NEAR_PLACES_COUNT,
                    lon: placeData?.lon,
                    order: ApiTypes.SortOrders.ASC,
                    sort: ApiTypes.SortFields.Distance
                })
            )

            await Promise.all(store.dispatch(API.util.getRunningQueriesThunk()))

            return {
                props: {
                    ...translations,
                    nearPlaces: nearPlaces?.items ?? null,
                    page: page ?? null,
                    photoList: photosData?.items,
                    place: placeData,
                    ratingCount: ratingData?.count ?? 0
                }
            }
        }
)

export default PlacePage
