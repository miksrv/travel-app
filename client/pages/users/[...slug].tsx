import { GetServerSidePropsResult, NextPage } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

import { API } from '@/api/api'
import { setLocale } from '@/api/applicationSlice'
import { wrapper } from '@/api/store'
import { ApiTypes } from '@/api/types'
import { Photo } from '@/api/types/Photo'
import { User as UserType } from '@/api/types/User'

import AppLayout from '@/components/app-layout'
import UserPhotos from '@/components/page-user/Photos'
import UserPlaces from '@/components/page-user/Places'
import User from '@/components/page-user/User'

export const PHOTOS_PER_PAGE = 32
export const PLACES_PER_PAGE = 21
const PAGES = ['photos', 'places', undefined] as const

type PageType = (typeof PAGES)[number]

export interface UserPageProps {
    id: string
    page: PageType | null
    user?: UserType
    photosList?: Photo[]
    photosCount: number
    currentPage: number
}

const UserPage: NextPage<UserPageProps> = ({ page, ...props }) => {
    // const { data: dataBookmarks, isLoading: dataBookmarksLoading } =
    //     API.usePlacesGetListQuery({
    //         bookmarkUser: id,
    //         limit: 20,
    //         offset: 0
    //     })
    //
    // const { data: dataPlaces, isLoading: dataPlacesLoading } =
    //     API.usePlacesGetListQuery({
    //         author: id,
    //         limit: 20,
    //         offset: 0
    //     })
    //
    // const { data: dataActivities, isLoading: dataActivitiesLoading } =
    //     API.useActivityGetListQuery({
    //         author: id,
    //         limit: 20,
    //         offset: 0
    //     })

    return (
        <AppLayout>
            {!page && <User {...props} />}
            {page === 'photos' && <UserPhotos {...props} />}
            {page === 'places' && <UserPlaces {...props} />}

            {/*{activeTab === 0 && (*/}
            {/*    <ActivityList*/}
            {/*        perPage={30}*/}
            {/*        activities={dataActivities?.items}*/}
            {/*        loading={dataActivitiesLoading}*/}
            {/*    />*/}
            {/*)}*/}

            {/*{activeTab === 1 && (*/}
            {/*    <PlacesList*/}
            {/*        perPage={6}*/}
            {/*        places={dataPlaces?.items}*/}
            {/*        loading={dataPlacesLoading}*/}
            {/*    />*/}
            {/*)}*/}

            {/*{activeTab === 2 && (*/}
            {/*    <PlacesList*/}
            {/*        perPage={6}*/}
            {/*        places={dataBookmarks?.items}*/}
            {/*        loading={dataBookmarksLoading}*/}
            {/*    />*/}
            {/*)}*/}
        </AppLayout>
    )
}

export const getServerSideProps = wrapper.getServerSideProps(
    (store) =>
        async (context): Promise<GetServerSidePropsResult<UserPageProps>> => {
            const id = context.params?.slug?.[0]
            const page = context.params?.slug?.[1] as PageType
            const locale = (context.locale ?? 'en') as ApiTypes.LocaleType
            const currentPage = parseInt(context.query.page as string, 10) || 1

            const translations = await serverSideTranslations(locale)

            if (typeof id !== 'string' || !PAGES.includes(page)) {
                return { notFound: true }
            }

            store.dispatch(setLocale(locale))

            const { data: userData, isError } = await store.dispatch(
                API.endpoints.usersGetItem.initiate(id)
            )

            const { data: photosData } = await store.dispatch(
                API.endpoints.photosGetList.initiate({
                    author: id,
                    limit: page === 'photos' ? PHOTOS_PER_PAGE : 8,
                    offset:
                        page === 'photos'
                            ? (currentPage - 1) * PHOTOS_PER_PAGE
                            : 0
                })
            )

            if (isError) {
                return { notFound: true }
            }

            await Promise.all(store.dispatch(API.util.getRunningQueriesThunk()))

            return {
                props: {
                    ...translations,
                    currentPage,
                    id,
                    page: page ?? null,
                    photosCount: photosData?.count || 0,
                    photosList: photosData?.items || [],
                    user: userData
                }
            }
        }
)

export default UserPage
