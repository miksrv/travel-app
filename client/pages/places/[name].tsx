import {
    ArticleOutlined,
    BookmarkBorderOutlined,
    DescriptionOutlined,
    ImageOutlined,
    OutlinedFlagOutlined
} from '@mui/icons-material'
import { Button } from '@mui/material'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardMedia from '@mui/material/CardMedia'
import Divider from '@mui/material/Divider'
import Skeleton from '@mui/material/Skeleton'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { GetServerSidePropsResult, NextPage } from 'next'
import { NextSeo } from 'next-seo'
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
            const id = context.params?.name

            if (typeof id !== 'string') {
                return { notFound: true }
            }

            const data: any = await store.dispatch(
                API.endpoints.placesGetItem.initiate(id)
            )

            store.dispatch(API.endpoints.photosGetList.initiate({ place: id }))

            store.dispatch(
                API.endpoints.activityGetList.initiate({ place: id })
            )

            await Promise.all(store.dispatch(API.util.getRunningQueriesThunk()))

            if (data.error?.originalStatus === 404) {
                return { notFound: true }
            }

            return { props: { data } }
        }
)

const NEAR_PLACES_COUNT = 6

const PlaceItemPage: NextPage = () => {
    const router = useRouter()
    const routerId = router.query.name
    const placeId = typeof routerId === 'string' ? routerId : ''

    const authSlice = useAppSelector((state) => state.auth)

    const [activeTab, setActiveTab] = React.useState<number>(0)

    const [iWasHere, setIWasHere] = React.useState<boolean>(false)

    const { data: placeData, isLoading } = API.usePlacesGetItemQuery(placeId, {
        skip: router.isFallback || !routerId
    })

    const { data: photosData, isLoading: photosLoading } =
        API.usePhotosGetListQuery(
            { place: placeId },
            {
                skip: router.isFallback || !routerId
            }
        )

    const [setBookmark, { isLoading: bookmarkPutLoading }] =
        API.useBookmarksPutPlaceMutation()

    const [setVisited, { isLoading: visitedPutLoading }] =
        API.useVisitedPutPlaceMutation()

    const { data: bookmarksUserData, isLoading: bookmarksUserLoading } =
        API.useBookmarksGetCheckPlaceQuery(
            { place: placeData?.id! },
            { skip: !placeData?.id || !authSlice.isAuth }
        )

    const { data: nearPlacesData, isLoading: nearPlacesLoading } =
        API.usePlacesGetListQuery(
            {
                excludePlaces: placeData?.id ? [placeData.id] : undefined,
                latitude: placeData?.latitude,
                limit: NEAR_PLACES_COUNT,
                longitude: placeData?.longitude,
                order: ApiTypes.SortOrder.ASC,
                sort: ApiTypes.SortFields.Distance
            },
            { skip: !placeData?.longitude || !placeData?.latitude }
        )

    const { data: activityData } = API.useActivityGetListQuery(
        {
            place: placeData?.id
        },
        {
            skip: !placeData?.id
        }
    )

    const handleTabChange = (_: React.SyntheticEvent, newTab: number) => {
        setActiveTab(newTab)
    }

    const handlePutPlaceBookmark = () => {
        setBookmark({ place: placeData?.id! })
    }

    const handlePutPlaceVisited = () => {
        setVisited({ place: placeData?.id! })
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
            <NextSeo title={placeData?.title} />
            <Card sx={{ mb: 2 }}>
                <CardHeader
                    title={
                        isLoading || photosLoading ? (
                            <Skeleton
                                variant={'text'}
                                width={'40%'}
                            />
                        ) : (
                            placeData?.title
                        )
                    }
                    titleTypographyProps={{ component: 'h1' }}
                    subheader={
                        isLoading || photosLoading ? (
                            <Skeleton
                                variant={'text'}
                                width={'70%'}
                            />
                        ) : (
                            <Breadcrumbs
                                currentPage={placeData?.title}
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
                                variant={!iWasHere ? 'contained' : 'outlined'}
                                color={'primary'}
                                disabled={
                                    !authSlice.isAuth || visitedPutLoading
                                }
                                onClick={handlePutPlaceVisited}
                                startIcon={<OutlinedFlagOutlined />}
                            >
                                {'Я тут был'}
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
                                    !bookmarksUserData?.result &&
                                    authSlice.isAuth
                                        ? 'contained'
                                        : 'outlined'
                                }
                                color={'primary'}
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
                {isLoading || photosLoading ? (
                    <Skeleton
                        variant={'rectangular'}
                        height={300}
                    />
                ) : (
                    <CardMedia
                        alt={placeData?.photo?.title}
                        component={'img'}
                        height={300}
                        image={
                            placeData?.photo?.filename
                                ? `${ImageHost}photo/${placeData?.id}/${placeData?.photo?.filename}.${placeData?.photo?.extension}`
                                : noPhoto.src
                        }
                    />
                )}
            </Card>

            <PlaceInformation
                place={placeData}
                ratingCount={ratingCount}
                loading={isLoading}
                onChangeWasHere={setIWasHere}
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
                                    photosData?.items?.length
                                        ? `(${photosData.items.length})`
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
                        id={placeData?.id}
                        title={placeData?.title}
                        address={placeData?.address}
                        content={placeData?.content}
                        tags={placeData?.tags}
                    />
                )}

                {activeTab === 1 && (
                    <PlaceTabPhotos
                        title={placeData?.title}
                        photos={photosData?.items}
                        placeId={placeData?.id}
                    />
                )}

                {activeTab === 2 && !!activityData?.items?.length && (
                    <PlaceTabActivity
                        title={placeData?.title}
                        placeId={placeData?.id}
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
        </PageLayout>
    )
}

// export default connect((state: RootState) => state)(PlacePage)
export default PlaceItemPage
