import { GetServerSidePropsResult, NextPage } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import React from 'react'

import Button from '@/ui/button'
import Container from '@/ui/container'
import Pagination from '@/ui/pagination'

import { API } from '@/api/api'
import { wrapper } from '@/api/store'
import { Photo } from '@/api/types/Photo'
import { User } from '@/api/types/User'

import Header from '@/components/header'
import PageLayout from '@/components/page-layout'
import UserGallery from '@/components/user/gallery'
import UserHeader from '@/components/user/header'

const PHOTOS_PER_PAGE = 32
const PAGES = ['photos', undefined] as const

type PageType = (typeof PAGES)[number]

interface UserPageProps {
    id: string
    page: PageType | null
    user?: User
    photosList?: Photo[]
    photosCount: number
    currentPage: number
}

const UserPage: NextPage<UserPageProps> = ({
    id,
    page,
    user,
    photosList,
    photosCount,
    currentPage
}) => {
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
        <PageLayout>
            {!page && (
                <>
                    <NextSeo title={user?.name} />

                    <UserHeader user={user} />

                    <Container title={'Фотографии'}>
                        <UserGallery photos={photosList} />

                        {photosCount > 8 && (
                            <Button
                                size={'m'}
                                mode={'secondary'}
                                stretched={true}
                                link={`/users/${id}/photos`}
                                style={{ marginTop: '15px' }}
                            >
                                {'Показать все фотографии'}
                            </Button>
                        )}
                    </Container>
                </>
            )}

            {page === 'photos' && (
                <>
                    <NextSeo title={user?.name} />
                    <Header
                        title={`${user?.name} - Фотографии`}
                        currentPage={'Фотографии'}
                        backLink={`/users/${id}`}
                        links={[
                            {
                                link: '/users/',
                                text: 'Путешественники'
                            },
                            {
                                link: `/users/${id}`,
                                text: user?.name || ''
                            }
                        ]}
                    />
                    <Container>
                        <UserGallery photos={photosList} />
                    </Container>
                    <Container className={'pagination'}>
                        <div>
                            {'Фотографий: '}
                            <strong>{photosCount ?? 0}</strong>
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPostCount={photosCount}
                            perPage={PHOTOS_PER_PAGE}
                            linkPart={`users/${id}/photos`}
                        />
                    </Container>
                </>
            )}

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
        </PageLayout>
    )
}

export const getServerSideProps = wrapper.getServerSideProps(
    (store) =>
        async (context): Promise<GetServerSidePropsResult<UserPageProps>> => {
            const id = context.params?.slug?.[0]
            const page = context.params?.slug?.[1] as PageType
            const locale = context.locale ?? 'en'
            const currentPage = parseInt(context.query.page as string, 10) || 1

            const translations = await serverSideTranslations(locale)

            if (typeof id !== 'string' || !PAGES.includes(page)) {
                return { notFound: true }
            }

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
                    photosList: photosData?.items,
                    user: userData
                }
            }
        }
)

export default UserPage
