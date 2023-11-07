import {
    ArticleOutlined,
    BookmarkBorderOutlined,
    DescriptionOutlined,
    ImageOutlined
} from '@mui/icons-material'
import { Button } from '@mui/material'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardMedia from '@mui/material/CardMedia'
import Divider from '@mui/material/Divider'
import Skeleton from '@mui/material/Skeleton'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { skipToken } from '@reduxjs/toolkit/query'
import { GetServerSidePropsResult, NextPage } from 'next'
import { useRouter } from 'next/dist/client/router'
import React, { useMemo } from 'react'

import { API, ImageHost } from '@/api/api'
import { useAppSelector, wrapper } from '@/api/store'
import { Activity, ApiTypes } from '@/api/types'

import Breadcrumbs from '@/components/breadcrumbs'
import PageLayout from '@/components/page-layout'
import PlaceInformation from '@/components/place-information'
import PlaceTabActivity from '@/components/place-tab-activity'
import PlaceTabDescription from '@/components/place-tab-description'
import PlaceTabPhotos from '@/components/place-tab-photos'
import PlacesList from '@/components/places-list'

import noPhoto from '@/public/images/no-photo-available.png'

export const getServerSideProps = wrapper.getServerSideProps(
    (store) =>
        async (context): Promise<GetServerSidePropsResult<any>> => {
            const name = context.params?.name

            if (typeof name === 'string') {
                const data: any = await store.dispatch(
                    API.endpoints.placesGetItem.initiate(name)
                )

                store.dispatch(
                    API.endpoints.activityGetList.initiate({ place: name })
                )

                await Promise.all(
                    store.dispatch(API.util.getRunningQueriesThunk())
                )

                if (data.error?.originalStatus === 404) {
                    return { notFound: true }
                }

                return { props: { data } }
            }

            return { notFound: true }
        }
)

const NEAR_PLACES_COUNT = 6

const PlaceItemPage: NextPage = () => {
    const router = useRouter()
    const routerId = router.query.name
    const placeId = typeof routerId === 'string' ? routerId : skipToken

    const authSlice = useAppSelector((state) => state.auth)

    const [activeTab, setActiveTab] = React.useState<number>(0)

    const { data, isLoading } = API.usePlacesGetItemQuery(
        typeof placeId === 'string' ? placeId : '',
        {
            skip: router.isFallback || !routerId
        }
    )

    const [setBookmark, { isLoading: bookmarkPutLoading }] =
        API.useBookmarksPutPlaceMutation()

    const { data: bookmarksUserData, isLoading: bookmarksUserLoading } =
        API.useBookmarksGetCheckPlaceQuery(
            { place: data?.id! },
            { skip: !data?.id || !authSlice.isAuth }
        )

    const { data: nearPlacesData, isLoading: nearPlacesLoading } =
        API.usePlacesGetListQuery(
            {
                excludePlaces: data?.id ? [data.id] : undefined,
                latitude: data?.latitude,
                limit: NEAR_PLACES_COUNT,
                longitude: data?.longitude,
                order: ApiTypes.SortOrder.ASC,
                sort: ApiTypes.SortFields.Distance
            },
            { skip: !data?.longitude || !data?.latitude }
        )

    const { data: activityData } = API.useActivityGetListQuery(
        {
            place: data?.id
        },
        {
            skip: !data?.id
        }
    )

    const handleTabChange = (_: React.SyntheticEvent, newTab: number) => {
        setActiveTab(newTab)
    }

    const handlePutPlaceBookmark = () => {
        setBookmark({ place: data?.id! })
    }

    const ratingCount = useMemo(
        () =>
            activityData?.items?.filter(
                (item) => item.type === Activity.ActivityTypes.Rating
            )?.length || undefined,
        [activityData]
    )

    return (
        <PageLayout>
            <Card sx={{ mb: 2 }}>
                <CardHeader
                    title={
                        isLoading ? (
                            <Skeleton
                                variant={'text'}
                                width={'40%'}
                            />
                        ) : (
                            data?.title
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
                                currentPage={data?.title}
                                links={[
                                    {
                                        link: '/places/',
                                        text: 'Интересные места'
                                    }
                                ]}
                            />
                        )
                    }
                    sx={{ mb: -1, mt: -1 }}
                    action={
                        <>
                            <Button
                                sx={{ mr: 1, mt: 1.4 }}
                                size={'medium'}
                                variant={'contained'}
                            >
                                {'Добавить'}
                            </Button>

                            <Button
                                sx={{
                                    height: '33px',
                                    minWidth: '26px',
                                    mr: 1,
                                    mt: 1.4,
                                    p: '6px 8px'
                                }}
                                size={'medium'}
                                variant={
                                    !bookmarksUserData?.result
                                        ? 'contained'
                                        : 'outlined'
                                }
                                color={
                                    !bookmarksUserData?.result
                                        ? 'success'
                                        : 'primary'
                                }
                                disabled={
                                    !authSlice.isAuth ||
                                    bookmarksUserLoading ||
                                    bookmarkPutLoading
                                }
                                onClick={handlePutPlaceBookmark}
                            >
                                <BookmarkBorderOutlined />
                            </Button>
                        </>
                    }
                />
                {isLoading ? (
                    <Skeleton
                        variant={'rectangular'}
                        height={300}
                    />
                ) : (
                    <CardMedia
                        alt={data?.photos?.[0]?.title}
                        component={'img'}
                        height={300}
                        image={
                            data?.photos?.[0]?.filename
                                ? `${ImageHost}photo/${data?.id}/${data?.photos?.[0]?.filename}.${data?.photos?.[0]?.extension}`
                                : noPhoto.src
                        }
                    />
                )}
            </Card>

            <PlaceInformation
                place={data}
                ratingCount={ratingCount}
                loading={isLoading}
            />

            <Card sx={{ mb: 2, mt: 0 }}>
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
                                label={'Описание'}
                                icon={<DescriptionOutlined />}
                                iconPosition={'start'}
                            />
                            <Tab
                                label={`Фотографии ${
                                    data?.photos?.length
                                        ? `(${data.photos.length})`
                                        : ''
                                }`}
                                icon={<ImageOutlined />}
                                iconPosition={'start'}
                            />
                            {!!activityData?.items?.length && (
                                <Tab
                                    label={`Активность ${
                                        activityData?.items?.length
                                            ? `(${activityData?.items?.length})`
                                            : ''
                                    }`}
                                    icon={<ArticleOutlined />}
                                    iconPosition={'start'}
                                />
                            )}
                        </Tabs>
                    }
                />
                <Divider />

                {activeTab === 0 && (
                    <PlaceTabDescription
                        title={data?.title}
                        address={data?.address}
                        content={data?.content}
                        tags={data?.tags}
                    />
                )}

                {activeTab === 1 && (
                    <PlaceTabPhotos
                        title={data?.title}
                        photos={data?.photos}
                    />
                )}

                {activeTab === 2 && !!activityData?.items?.length && (
                    <PlaceTabActivity
                        title={data?.title}
                        placeId={data?.id}
                        activity={activityData?.items}
                    />
                )}
            </Card>

            <Card sx={{ mb: 2 }}>
                <CardHeader
                    sx={{ mb: -1, mt: -1 }}
                    title={'Ближайшие интересные места'}
                    titleTypographyProps={{
                        component: 'h2',
                        fontSize: 18
                    }}
                    subheader={`Найдены несколько ближайших интересных мест в радиусе ${Math.max(
                        ...(nearPlacesData?.items?.map(
                            ({ distance }) => distance || 0
                        ) || [])
                    )} км`}
                />
            </Card>

            <PlacesList
                perPage={NEAR_PLACES_COUNT}
                places={nearPlacesData?.items}
                loading={nearPlacesLoading}
            />
            {/*<Carousel*/}
            {/*    options={{*/}
            {/*        align: 'center',*/}
            {/*        containScroll: false,*/}
            {/*        dragFree: true,*/}
            {/*        loop: true,*/}
            {/*        slidesToScroll: 'auto'*/}
            {/*    }}*/}
            {/*>*/}
            {/*    <PlacesList*/}
            {/*        perPage={NEAR_PLACES_COUNT}*/}
            {/*        places={nearPlacesData?.items}*/}
            {/*        loading={nearPlacesLoading}*/}
            {/*        useLinearView={true}*/}
            {/*    />*/}
            {/*</Carousel>*/}
        </PageLayout>
    )
}

// export default connect((state: RootState) => state)(PlacePage)
export default PlaceItemPage
