import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardMedia from '@mui/material/CardMedia'
import Divider from '@mui/material/Divider'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import { skipToken } from '@reduxjs/toolkit/query'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import { NextPage } from 'next'
import { useRouter } from 'next/dist/client/router'
import React, { useMemo, useState } from 'react'
import Lightbox from 'react-image-lightbox'

import { API, ImageHost } from '@/api/api'
import { Activity, ApiTypes } from '@/api/types'

import Avatar from '@/components/avatar'
import Breadcrumbs from '@/components/breadcrumbs'
import PageLayout from '@/components/page-layout'
import PlaceInformation from '@/components/place-information'
import PlaceTabActivity from '@/components/place-tab-activity'
import PlaceTabDescription from '@/components/place-tab-description'
import PlaceTabPhotos from '@/components/place-tab-photos'
import PlacesList from '@/components/places-list'

import noPhoto from '@/public/images/no-photo-available.png'

dayjs.locale('ru')

const Place: NextPage = () => {
    const router = useRouter()
    const routerObject = router.query.name
    const objectName =
        typeof routerObject === 'string' ? routerObject : skipToken

    const [value, setValue] = React.useState<number>(0)

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue)
    }

    const { data, isLoading } = API.usePlacesGetItemQuery(
        typeof objectName === 'string' ? objectName : '',
        {
            skip: router.isFallback || !routerObject
        }
    )

    const { data: nearPlacesData } = API.usePlacesGetListQuery(
        {
            excludePlaces: data?.id ? [data.id] : undefined,
            latitude: data?.latitude,
            limit: 3,
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
        `${ImageHost}/photos/${data?.id}/${data?.photos?.[index]?.filename}.${data?.photos?.[index]?.extension}`

    const thumbImageUrl = (index: number) =>
        `${ImageHost}/photos/${data?.id}/${data?.photos?.[index]?.filename}_thumb.${data?.photos?.[index]?.extension}`

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
                    title={data?.title || 'Загрузка...'}
                    titleTypographyProps={{ component: 'h1' }}
                    subheader={
                        <Breadcrumbs
                            currentPage={data?.title}
                            links={[
                                { link: '/places/', text: 'Интересные места' }
                            ]}
                        />
                    }
                    sx={{ mb: -0.5, mt: -0.5 }}
                />
                <CardMedia
                    alt={data?.photos?.[0]?.title}
                    sx={{ cursor: 'pointer' }}
                    component={'img'}
                    height={300}
                    image={
                        data?.photos?.[0]?.filename
                            ? `${ImageHost}/photos/${data?.id}/${data?.photos?.[0]?.filename}.${data?.photos?.[0]?.extension}`
                            : noPhoto.src
                    }
                    onClick={() => {
                        setCurrentIndex(0)
                        setShowLightbox(true)
                    }}
                />
            </Card>

            <PlaceInformation
                place={data}
                ratingCount={ratingCount}
            />

            <Card sx={{ mb: 2, mt: 0 }}>
                <CardHeader
                    sx={{ p: 0 }}
                    title={
                        <Tabs
                            value={value}
                            onChange={handleChange}
                            aria-label={'basic tabs example'}
                        >
                            <Tab label={'Описание'} />
                            <Tab
                                label={`Фотографии ${
                                    data?.photos?.length
                                        ? `(${data.photos.length})`
                                        : ''
                                }`}
                            />
                            <Tab
                                label={`Активность ${
                                    activityData?.items?.length
                                        ? `(${activityData?.items?.length})`
                                        : ''
                                }`}
                            />
                        </Tabs>
                    }
                />
                <Divider />

                {value === 0 && (
                    <PlaceTabDescription
                        title={data?.title}
                        address={data?.address}
                        content={data?.content}
                        tags={data?.tags}
                    />
                )}

                {value === 1 && (
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

                {value === 2 && (
                    <PlaceTabActivity
                        title={data?.title}
                        placeId={data?.id}
                        activity={activityData?.items}
                    />
                )}
            </Card>

            <Typography
                variant={'h2'}
                sx={{ mb: 2, mt: 4 }}
            >
                {'Ближайшие интересные места'}
            </Typography>

            <PlacesList places={nearPlacesData?.items} />

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
                        <Avatar
                            size={'medium'}
                            userName={data?.photos?.[photoIndex]?.author?.name}
                            image={data?.photos?.[photoIndex]?.author?.avatar}
                            text={dayjs(
                                data?.photos?.[photoIndex]?.created?.date
                            ).format('D MMMM YYYY, HH:mm')}
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

export default Place
