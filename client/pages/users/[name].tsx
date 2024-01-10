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
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/dist/client/router'
import Link from 'next/link'
import React, { useState } from 'react'

import { API, IMG_HOST } from '@/api/api'
import { wrapper } from '@/api/store'

import ActivityList from '@/components/activity-list'
import PageLayout from '@/components/page-layout'
import PhotoGallery from '@/components/photo-gallery'
import PhotoLightbox from '@/components/photo-lightbox'
import PlacesList from '@/components/places-list'
import Reputation from '@/components/reputation'
import StatisticLine from '@/components/statistic-line'

import { formatDate } from '@/functions/helpers'

import userAvatar from '@/public/images/no-avatar.png'

import Breadcrumbs from '../../ui/breadcrumbs'

export const getServerSideProps = wrapper.getServerSideProps(
    (store) =>
        async (context): Promise<GetServerSidePropsResult<any>> => {
            const name = context.params?.name

            if (typeof name === 'string') {
                const data: any = await store.dispatch(
                    API.endpoints.usersGetItem.initiate(name)
                )

                await Promise.all(
                    store.dispatch(API.util?.getRunningQueriesThunk())
                )

                if (data.error?.originalStatus === 404) {
                    return { notFound: true }
                }

                return { props: { data } }
            }

            return { notFound: true }
        }
)

const UserItemPage: NextPage = () => {
    const router = useRouter()
    const routerId = router.query.name
    const userId = typeof routerId === 'string' ? routerId : skipToken

    const [showLightbox, setShowLightbox] = useState<boolean>(false)
    const [photoIndex, setPhotoIndex] = useState<number>()
    const [activeTab, setActiveTab] = React.useState<number>(0)

    const { data: userData, isLoading } = API.useUsersGetItemQuery(
        typeof userId === 'string' ? userId : '',
        {
            skip: router.isFallback || !routerId
        }
    )

    const { data: dataBookmarks, isLoading: dataBookmarksLoading } =
        API.usePlacesGetListQuery(
            {
                bookmarkUser: userData?.id,
                limit: 20,
                offset: 0
            },
            {
                skip: !userData?.id
            }
        )

    const { data: dataPlaces, isLoading: dataPlacesLoading } =
        API.usePlacesGetListQuery(
            {
                author: userData?.id,
                limit: 20,
                offset: 0
            },
            {
                skip: !userData?.id
            }
        )

    const { data: dataPhotos, isLoading: dataPhotosLoading } =
        API.usePhotosGetListQuery(
            {
                author: userData?.id
            },
            {
                skip: !userData?.id
            }
        )

    const { data: dataActivities, isLoading: dataActivitiesLoading } =
        API.useActivityGetListQuery(
            {
                author: userData?.id,
                limit: 20,
                offset: 0
            },
            {
                skip: !userData?.id
            }
        )

    const nextLevelPercentage = (
        currentExperience: number,
        experienceToNextLevel: number
    ): number => {
        if (currentExperience < 0 || experienceToNextLevel <= 0) {
            return 0
        }

        return Math.min(100, (currentExperience / experienceToNextLevel) * 100)
    }

    const handlePhotoClick = (index: number) => {
        setPhotoIndex(index)
        setShowLightbox(true)
    }

    const handleCloseLightbox = () => {
        setShowLightbox(false)
    }

    const handleTabChange = (_: React.SyntheticEvent, newTab: number) => {
        setActiveTab(newTab)
    }

    return (
        <PageLayout>
            <NextSeo title={userData?.name} />
            <Card sx={{ mb: 2 }}>
                <CardHeader
                    title={
                        isLoading ? (
                            <Skeleton
                                variant={'text'}
                                width={'40%'}
                            />
                        ) : (
                            userData?.name
                        )
                    }
                    titleTypographyProps={{ component: 'h1' }}
                    subheader={
                        isLoading ? (
                            <Skeleton
                                variant={'text'}
                                width={'70%'}
                            />
                        ) : (
                            <Breadcrumbs
                                currentPage={userData?.name}
                                links={[
                                    {
                                        link: '/users/',
                                        text: 'Путешественники'
                                    }
                                ]}
                            />
                        )
                    }
                    sx={{ mb: -1, mt: -1 }}
                />
                <Divider />
                <CardContent sx={{ paddingBottom: '16px !important' }}>
                    <Grid container>
                        <Grid
                            lg={3}
                            md={3}
                            xs={3}
                            alignContent={'center'}
                        >
                            <Avatar
                                alt={userData?.name || ''}
                                src={
                                    userData?.avatar
                                        ? `${IMG_HOST}avatar/${userData.avatar}`
                                        : userAvatar.src
                                }
                                sx={{
                                    height: 128,
                                    margin: '0 auto',
                                    width: 128
                                }}
                                variant={'circular'}
                            />
                            <Box
                                sx={{
                                    margin: '10px auto',
                                    maxWidth: '70%',
                                    textAlign: 'center'
                                }}
                            >
                                {`${userData?.level?.name} (${userData?.level?.level})`}
                                <LinearProgress
                                    variant={'determinate'}
                                    value={nextLevelPercentage(
                                        userData?.level?.experience || 0,
                                        userData?.level?.nextLevel ||
                                            userData?.level?.experience ||
                                            0
                                    )}
                                />
                            </Box>
                        </Grid>
                        <Grid
                            lg={5}
                            md={5}
                            xs={5}
                        >
                            <StatisticLine
                                hide={!userData?.reputation}
                                icon={
                                    <SentimentSatisfiedOutlined
                                        color={'disabled'}
                                    />
                                }
                                title={'Репутация:'}
                                content={
                                    <Reputation value={userData?.reputation} />
                                }
                            />
                            <StatisticLine
                                hide={!userData?.created}
                                icon={<AccessTimeOutlined color={'disabled'} />}
                                title={'Регистрация:'}
                                content={formatDate(userData?.created?.date)}
                            />
                            <StatisticLine
                                hide={!userData?.activity}
                                icon={<AccessTimeOutlined color={'disabled'} />}
                                title={'Был(а) тут:'}
                                content={formatDate(userData?.activity?.date)}
                            />
                            <StatisticLine
                                hide={!userData?.website}
                                icon={<LanguageOutlined color={'disabled'} />}
                                title={'Вебсайт:'}
                                content={
                                    <Link
                                        target={'_blank'}
                                        color={'inherit'}
                                        href={userData?.website || ''}
                                    >
                                        {userData?.website}
                                    </Link>
                                }
                            />
                        </Grid>
                        <Grid
                            lg={4}
                            md={4}
                            xs={4}
                        >
                            <StatisticLine
                                title={'Добавлено мест:'}
                                content={userData?.statistic?.places}
                            />
                            <StatisticLine
                                title={'Загружено фотографий:'}
                                content={userData?.statistic?.photos}
                            />
                            <StatisticLine
                                title={'Поставлено оценок:'}
                                content={userData?.statistic?.rating}
                            />
                            <StatisticLine
                                title={'Редактирований:'}
                                content={userData?.statistic?.edit}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card sx={{ mb: 2 }}>
                <CardHeader
                    sx={{ p: 0 }}
                    title={
                        <Tabs
                            defaultValue={0}
                            value={activeTab}
                            tabIndex={activeTab}
                            onChange={handleTabChange}
                            aria-label={'basic tabs'}
                        >
                            <Tab
                                label={'Активность'}
                                icon={<ArticleOutlined />}
                                iconPosition={'start'}
                            />
                            <Tab
                                label={`Места ${
                                    dataPlaces?.count
                                        ? ` (${dataPlaces?.count})`
                                        : ''
                                }`}
                                icon={<TerrainOutlined />}
                                iconPosition={'start'}
                            />
                            <Tab
                                label={`Избранное ${
                                    // NOT WORKING!!
                                    dataPlaces?.count
                                        ? ` (${dataBookmarks?.count})`
                                        : ''
                                }`}
                                disabled={!dataBookmarks?.count}
                                icon={<BookmarkBorderOutlined />}
                                iconPosition={'start'}
                            />
                            <Tab
                                label={`Фотографии ${
                                    dataPhotos?.count
                                        ? ` (${dataPhotos?.count})`
                                        : ''
                                }`}
                                icon={<ImageOutlined />}
                                iconPosition={'start'}
                            />
                        </Tabs>
                    }
                />

                {activeTab === 3 && (
                    <>
                        <Divider />
                        <CardHeader
                            title={`${userData?.name} - Все фотографии путешественницы`}
                            titleTypographyProps={{
                                component: 'h2',
                                fontSize: 18
                            }}
                            sx={{ mb: -2 }}
                        />
                        <CardContent sx={{ mb: -1 }}>
                            <PhotoGallery
                                photos={dataPhotos?.items}
                                onPhotoClick={handlePhotoClick}
                            />
                            <PhotoLightbox
                                photos={dataPhotos?.items}
                                photoIndex={photoIndex}
                                showLightbox={showLightbox}
                                onChangeIndex={setPhotoIndex}
                                onCloseLightBox={handleCloseLightbox}
                            />
                        </CardContent>
                    </>
                )}
            </Card>

            {activeTab === 0 && (
                <ActivityList
                    perPage={30}
                    activities={dataActivities?.items}
                    loading={dataActivitiesLoading}
                />
            )}

            {activeTab === 1 && (
                <PlacesList
                    perPage={6}
                    places={dataPlaces?.items}
                    loading={dataPlacesLoading}
                />
            )}

            {activeTab === 2 && (
                <PlacesList
                    perPage={6}
                    places={dataBookmarks?.items}
                    loading={dataBookmarksLoading}
                />
            )}
        </PageLayout>
    )
}

// export default connect((state: RootState) => state)(PlacePage)
export default UserItemPage
