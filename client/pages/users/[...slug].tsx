import {
    AccessTimeOutlined,
    ArticleOutlined,
    BookmarkBorderOutlined,
    ImageOutlined,
    LanguageOutlined,
    SentimentSatisfiedOutlined,
    TerrainOutlined
} from '@mui/icons-material'
import { Avatar } from '@mui/material'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import LinearProgress from '@mui/material/LinearProgress'
import Skeleton from '@mui/material/Skeleton'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Grid from '@mui/material/Unstable_Grid2'
import { skipToken } from '@reduxjs/toolkit/query'
import { GetServerSidePropsResult, NextPage } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/dist/client/router'
import Link from 'next/link'
import React, { useState } from 'react'

import Breadcrumbs from '@/ui/breadcrumbs'
import Button from '@/ui/button'
import Container from '@/ui/container'
import styles from '@/ui/dialog/styles.module.sass'
import Icon from '@/ui/icon'
import Pagination from '@/ui/pagination'

import { API, IMG_HOST } from '@/api/api'
import { wrapper } from '@/api/store'
import { Photo } from '@/api/types/Photo'
import { User } from '@/api/types/User'

import ActivityList from '@/components/activity-list'
import PageLayout from '@/components/page-layout'
import PhotoGallery from '@/components/photo-gallery'
import PhotoLightbox from '@/components/photo-lightbox'
import PlacesList from '@/components/places-list'
import Reputation from '@/components/reputation'
import UserGallery from '@/components/user/gallery'
import UserHeader from '@/components/user/header'

import { formatDate } from '@/functions/helpers'

import userAvatar from '@/public/images/no-avatar.png'

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
    const { data: dataBookmarks, isLoading: dataBookmarksLoading } =
        API.usePlacesGetListQuery({
            bookmarkUser: id,
            limit: 20,
            offset: 0
        })

    const { data: dataPlaces, isLoading: dataPlacesLoading } =
        API.usePlacesGetListQuery({
            author: id,
            limit: 20,
            offset: 0
        })

    const { data: dataActivities, isLoading: dataActivitiesLoading } =
        API.useActivityGetListQuery({
            author: id,
            limit: 20,
            offset: 0
        })

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
                    <Container className={'pageHeader'}>
                        <Button
                            className={'backLink'}
                            link={`/users/${id}`}
                            icon={'LargeLeft'}
                        />
                        <header>
                            <h1>{`${user?.name} - Фотографии`}</h1>
                            <Breadcrumbs
                                currentPage={'Фотографии'}
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
                        </header>
                        <div className={'actions'}>
                            <div>
                                {'Фотографий: '}
                                <strong>{photosCount ?? 0}</strong>
                            </div>
                        </div>
                    </Container>
                    <Container>
                        <UserGallery photos={photosList} />
                    </Container>
                    <Container className={'pagination'}>
                        <div></div>
                        <Pagination
                            currentPage={currentPage}
                            totalPostCount={photosCount}
                            perPage={PHOTOS_PER_PAGE}
                            linkPart={`users/${id}/photos`}
                        />
                    </Container>
                </>
            )}

            {/*<Card sx={{ mb: 2 }}>*/}
            {/*    <CardHeader*/}
            {/*        sx={{ p: 0 }}*/}
            {/*        title={*/}
            {/*            <Tabs*/}
            {/*                defaultValue={0}*/}
            {/*                value={activeTab}*/}
            {/*                tabIndex={activeTab}*/}
            {/*                onChange={handleTabChange}*/}
            {/*                aria-label={'basic tabs'}*/}
            {/*            >*/}
            {/*                <Tab*/}
            {/*                    label={'Активность'}*/}
            {/*                    icon={<ArticleOutlined />}*/}
            {/*                    iconPosition={'start'}*/}
            {/*                />*/}
            {/*                <Tab*/}
            {/*                    label={`Места ${*/}
            {/*                        dataPlaces?.count*/}
            {/*                            ? ` (${dataPlaces?.count})`*/}
            {/*                            : ''*/}
            {/*                    }`}*/}
            {/*                    icon={<TerrainOutlined />}*/}
            {/*                    iconPosition={'start'}*/}
            {/*                />*/}
            {/*                <Tab*/}
            {/*                    label={`Избранное ${*/}
            {/*                        // NOT WORKING!!*/}
            {/*                        dataPlaces?.count*/}
            {/*                            ? ` (${dataBookmarks?.count})`*/}
            {/*                            : ''*/}
            {/*                    }`}*/}
            {/*                    disabled={!dataBookmarks?.count}*/}
            {/*                    icon={<BookmarkBorderOutlined />}*/}
            {/*                    iconPosition={'start'}*/}
            {/*                />*/}
            {/*                <Tab*/}
            {/*                    label={`Фотографии ${*/}
            {/*                        dataPhotos?.count*/}
            {/*                            ? ` (${dataPhotos?.count})`*/}
            {/*                            : ''*/}
            {/*                    }`}*/}
            {/*                    icon={<ImageOutlined />}*/}
            {/*                    iconPosition={'start'}*/}
            {/*                />*/}
            {/*            </Tabs>*/}
            {/*        }*/}
            {/*    />*/}

            {/*    {activeTab === 3 && (*/}
            {/*        <>*/}
            {/*            <Divider />*/}
            {/*            <CardHeader*/}
            {/*                title={`${userData?.name} - Все фотографии путешественницы`}*/}
            {/*                titleTypographyProps={{*/}
            {/*                    component: 'h2',*/}
            {/*                    fontSize: 18*/}
            {/*                }}*/}
            {/*                sx={{ mb: -2 }}*/}
            {/*            />*/}
            {/*            <CardContent sx={{ mb: -1 }}>*/}
            {/*                <PhotoGallery*/}
            {/*                    photos={dataPhotos?.items}*/}
            {/*                    onPhotoClick={handlePhotoClick}*/}
            {/*                />*/}
            {/*                <PhotoLightbox*/}
            {/*                    photos={dataPhotos?.items}*/}
            {/*                    photoIndex={photoIndex}*/}
            {/*                    showLightbox={showLightbox}*/}
            {/*                    onChangeIndex={setPhotoIndex}*/}
            {/*                    onCloseLightBox={handleCloseLightbox}*/}
            {/*                />*/}
            {/*            </CardContent>*/}
            {/*        </>*/}
            {/*    )}*/}
            {/*</Card>*/}

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
