import React from 'react'
import { GetServerSidePropsResult, NextPage } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { API } from '@/api/api'
import { setLocale } from '@/api/applicationSlice'
import { wrapper } from '@/api/store'
import { ApiTypes } from '@/api/types'
import { Photo } from '@/api/types/Photo'
import { User as UserType } from '@/api/types/User'
import AppLayout from '@/components/app-layout'
import UserPhotos from '@/components/page-user/Photos'
import UserPlaces from '@/components/page-user/Places'
import { UserPagesEnum } from '@/components/page-user/tabs'
import User from '@/components/page-user/User'

export const PHOTOS_PER_PAGE = 32
export const PLACES_PER_PAGE = 21

export interface UserPageProps {
    id: string
    page?: UserPagesEnum
    user?: UserType
    photosList?: Photo[]
    photosCount: number
    currentPage: number
}

const UserPage: NextPage<UserPageProps> = ({ page, ...props }) => (
    <AppLayout>
        {!page && <User {...props} />}

        {page === UserPagesEnum.PHOTOS && <UserPhotos {...props} />}

        {page === UserPagesEnum.PLACES && (
            <UserPlaces
                {...props}
                type={'places'}
            />
        )}

        {page === UserPagesEnum.BOOKMARKS && (
            <UserPlaces
                {...props}
                type={'bookmarks'}
            />
        )}
    </AppLayout>
)

export const getServerSideProps = wrapper.getServerSideProps(
    (store) =>
        async (context): Promise<GetServerSidePropsResult<UserPageProps>> => {
            const id = context.params?.slug?.[0]
            const page = context.params?.slug?.[1] as UserPagesEnum
            const locale = (context.locale ?? 'en') as ApiTypes.LocaleType
            const currentPage = parseInt(context.query.page as string, 10) || 1
            const translations = await serverSideTranslations(locale)

            if (typeof id !== 'string' || (page && !Object.values(UserPagesEnum).includes(page))) {
                return { notFound: true }
            }

            store.dispatch(setLocale(locale))

            const { data: userData, isError } = await store.dispatch(API.endpoints.usersGetItem.initiate(id))

            const { data: photosData } = await store.dispatch(
                API.endpoints.photosGetList.initiate({
                    author: id,
                    limit: page === UserPagesEnum.PHOTOS ? PHOTOS_PER_PAGE : 8,
                    offset: page === UserPagesEnum.PHOTOS ? (currentPage - 1) * PHOTOS_PER_PAGE : 0
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
                    photosCount: photosData?.count ?? 0,
                    photosList: photosData?.items ?? [],
                    user: userData
                }
            }
        }
)

export default UserPage
