import {
    ArticleOutlined,
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
import React, { useMemo, useState } from 'react'
import Lightbox from 'react-image-lightbox'

import { API, ImageHost } from '@/api/api'
import { wrapper } from '@/api/store'
import { Activity, ApiTypes } from '@/api/types'

import Breadcrumbs from '@/components/breadcrumbs'
import PageLayout from '@/components/page-layout'
import PlaceInformation from '@/components/place-information'
import PlaceTabActivity from '@/components/place-tab-activity'
import PlaceTabDescription from '@/components/place-tab-description'
import PlaceTabPhotos from '@/components/place-tab-photos'
import PlacesList from '@/components/places-list'
import UserAvatar from '@/components/user-avatar'

import { formatDate } from '@/functions/helpers'

import noPhoto from '@/public/images/no-photo-available.png'

export const getServerSideProps = wrapper.getServerSideProps(
    (store) =>
        async (context): Promise<GetServerSidePropsResult<any>> => {
            const name = context.params?.name

            if (typeof name === 'string') {
                const data: any = await store.dispatch(
                    API.endpoints.placesGetItem.initiate(name)
                )

                store.dispatch(API.endpoints.activityGetItem.initiate(name))

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

const PLACES_PER_PAGE = 3

const PlaceItemPage: NextPage = () => {
    const router = useRouter()
    const routerId = router.query.name
    const placeId = typeof routerId === 'string' ? routerId : skipToken

    const [activeTab, setActiveTab] = React.useState<number>(0)

    const { data, isLoading } = API.usePlacesGetItemQuery(
        typeof placeId === 'string' ? placeId : '',
        {
            skip: router.isFallback || !routerId
        }
    )

    const { data: nearPlacesData, isLoading: nearPlacesLoading } =
        API.usePlacesGetListQuery(
            {
                excludePlaces: data?.id ? [data.id] : undefined,
                latitude: data?.latitude,
                limit: PLACES_PER_PAGE,
                longitude: data?.longitude,
                order: ApiTypes.SortOrder.ASC,
                sort: ApiTypes.SortFields.Distance
            },
            { skip: !data?.longitude || !data?.latitude }
        )

    const { data: activityData } = API.useActivityGetItemQuery(data?.id || '', {
        skip: !data?.id
    })

    const [showLightbox, setShowLightbox] = useState<boolean>(false)
    const [photoIndex, setCurrentIndex] = useState<number>(0)

    const imageUrl = (index: number) =>
        `${ImageHost}photo/${data?.id}/${data?.photos?.[index]?.filename}.${data?.photos?.[index]?.extension}`

    const thumbImageUrl = (index: number) =>
        `${ImageHost}photo/${data?.id}/${data?.photos?.[index]?.filename}_thumb.${data?.photos?.[index]?.extension}`

    const handleTabChange = (_: React.SyntheticEvent, newTab: number) => {
        setActiveTab(newTab)
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
                        <Button
                            sx={{ mr: 1, mt: 1.4 }}
                            size={'medium'}
                            variant={'contained'}
                        >
                            Добавить
                        </Button>
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
                        sx={{ cursor: 'pointer' }}
                        component={'img'}
                        height={300}
                        image={
                            data?.photos?.[0]?.filename
                                ? `${ImageHost}photo/${data?.id}/${data?.photos?.[0]?.filename}.${data?.photos?.[0]?.extension}`
                                : noPhoto.src
                        }
                        onClick={() => {
                            setCurrentIndex(0)
                            setShowLightbox(true)
                        }}
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
                        placeId={data?.id}
                        photos={data?.photos}
                        onPhotoClick={(index) => {
                            setCurrentIndex(index)
                            setShowLightbox(true)
                        }}
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

            <PlacesList
                perPage={PLACES_PER_PAGE}
                places={nearPlacesData?.items}
                loading={nearPlacesLoading}
            />

            {showLightbox && (
                <Lightbox
                    mainSrc={imageUrl(photoIndex)}
                    nextSrc={imageUrl(
                        (photoIndex + 1) % (data?.photos?.length || 0)
                    )}
                    prevSrc={imageUrl(
                        (photoIndex + (data?.photos?.length || 0) - 1) %
                            (data?.photos?.length || 0)
                    )}
                    mainSrcThumbnail={thumbImageUrl(photoIndex)}
                    prevSrcThumbnail={thumbImageUrl(
                        (photoIndex + (data?.photos?.length || 0) - 1) %
                            (data?.photos?.length || 0)
                    )}
                    nextSrcThumbnail={thumbImageUrl(
                        (photoIndex + 1) % (data?.photos?.length || 0)
                    )}
                    imageTitle={data?.photos?.[photoIndex]?.title || ''}
                    imageCaption={
                        <UserAvatar
                            size={'medium'}
                            user={data?.photos?.[photoIndex]?.author}
                            text={formatDate(
                                data?.photos?.[photoIndex]?.created?.date
                            )}
                        />
                    }
                    onCloseRequest={() => setShowLightbox(false)}
                    onMovePrevRequest={() =>
                        setCurrentIndex(
                            (photoIndex + (data?.photos?.length || 0) - 1) %
                                (data?.photos?.length || 0)
                        )
                    }
                    onMoveNextRequest={() =>
                        setCurrentIndex(
                            (photoIndex + 1) % (data?.photos?.length || 0)
                        )
                    }
                />
            )}
        </PageLayout>
    )
}

// export default connect((state: RootState) => state)(PlacePage)
export default PlaceItemPage
