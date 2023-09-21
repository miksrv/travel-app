import { numberFormatter } from '@/functions/helpers'
import Avatar from '@mui/material/Avatar'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Rating from '@mui/material/Rating'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Unstable_Grid2'
import { skipToken } from '@reduxjs/toolkit/query'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import { NextPage } from 'next'
import { useRouter } from 'next/dist/client/router'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import Lightbox from 'react-image-lightbox'

import { usePlacesGetItemQuery, usePlacesGetListQuery } from '@/api/api'
import { API } from '@/api/types'

import Breadcrumbs from '@/components/breadcrumbs'
import Carousel from '@/components/carousel'
import PageLayout from '@/components/page-layout'
import PageTitle from '@/components/page-title'
import PlacesList from '@/components/places-list'

dayjs.locale('ru')

const DynamicMap = dynamic(() => import('@/components/map'), { ssr: false })
const Point = dynamic(() => import('@/components/map/Point'), {
    ssr: false
})

const Place: NextPage = () => {
    const router = useRouter()
    const routerObject = router.query.name
    const objectName =
        typeof routerObject === 'string' ? routerObject : skipToken

    const { data, isLoading } = usePlacesGetItemQuery(
        typeof objectName === 'string' ? objectName : '',
        {
            skip: router.isFallback || !routerObject
        }
    )

    const { data: nearPlacesData } = usePlacesGetListQuery(
        {
            excludePlaces: data?.id ? [data.id] : undefined,
            latitude: data?.latitude,
            limit: 4,
            longitude: data?.longitude,
            order: API.SortOrder.ASC,
            sort: API.SortFields.Distance
        },
        { skip: !data?.longitude || !data?.latitude }
    )

    const [showLightbox, setShowLightbox] = useState<boolean>(false)
    const [photoIndex, setCurrentIndex] = useState<number>(0)
    const [photoList, setPhotoList] = useState<string[]>([])

    const imageUrl = (index: number) =>
        `http://localhost:8080/photos/${data?.id}/${data?.photos?.[index]?.filename}.${data?.photos?.[index]?.extension}`

    return (
        <PageLayout>
            <PageTitle title={data?.title || ''} />
            <Breadcrumbs
                currentPage={data?.title}
                links={[{ link: '/places/', text: 'Интересные места' }]}
            />
            <Grid
                container
                spacing={2}
                sx={{ mb: -1.5, mt: 1 }}
            >
                <Grid
                    lg={8}
                    md={8}
                    xs={12}
                >
                    <Card sx={{ mb: 2, mt: 0 }}>
                        <CardContent
                            sx={{ height: 500, p: 0, position: 'relative' }}
                        >
                            {data?.photos?.[0] && (
                                <Image
                                    style={{
                                        height: 'inherit',
                                        marginBottom: -30,
                                        objectFit: 'cover',
                                        width: '100%'
                                    }}
                                    src={`http://localhost:8080/photos/${data?.id}/${data?.photos?.[0]?.filename}.${data?.photos?.[0]?.extension}`}
                                    alt={data?.photos?.[0]?.title || ''}
                                    width={data?.photos?.[0]?.width}
                                    height={data?.photos?.[0]?.height}
                                    onClick={() => {
                                        setCurrentIndex(0)
                                        setShowLightbox(true)
                                    }}
                                />
                            )}

                            {!!data?.photos?.length &&
                                data.photos.length > 1 && (
                                    <div className={'photos'}>
                                        <Carousel
                                            slides={data?.photos}
                                            placeId={data.id}
                                            options={{
                                                containScroll: 'trimSnaps',
                                                dragFree: true
                                            }}
                                        />
                                    </div>
                                )}
                        </CardContent>
                    </Card>
                </Grid>
                <Grid
                    lg={4}
                    md={4}
                    xs={12}
                >
                    <Card sx={{ mb: 2, mt: 0 }}>
                        <CardContent sx={{ height: '245px' }}>
                            <StatisticLine
                                title={'Категория:'}
                                text={
                                    data?.category?.name ? (
                                        <Stack
                                            direction={'row'}
                                            spacing={2}
                                        >
                                            <Image
                                                style={{
                                                    height: '18px',
                                                    marginRight: '4px',
                                                    objectFit: 'cover',
                                                    width: '18px'
                                                }}
                                                src={`/poi/${data?.category?.name}.png`}
                                                alt={data?.category?.title}
                                                width={22}
                                                height={26}
                                            />
                                            {data?.category?.title}
                                        </Stack>
                                    ) : (
                                        '-'
                                    )
                                }
                            />
                            <StatisticLine
                                title={'Подкатегория:'}
                                text={
                                    data?.subcategory?.name ? (
                                        <Stack
                                            direction={'row'}
                                            spacing={2}
                                        >
                                            <Image
                                                style={{
                                                    height: '18px',
                                                    marginRight: '4px',
                                                    objectFit: 'cover',
                                                    width: '18px'
                                                }}
                                                src={`/poi/${data?.subcategory?.name}.png`}
                                                alt={data?.subcategory?.title}
                                                width={22}
                                                height={26}
                                            />
                                            {data?.subcategory?.title}
                                        </Stack>
                                    ) : (
                                        '-'
                                    )
                                }
                            />
                            <StatisticLine
                                title={'Автор:'}
                                text={
                                    <Stack
                                        direction={'row'}
                                        spacing={1}
                                    >
                                        <Avatar
                                            alt={data?.author?.name || ''}
                                            src={
                                                data?.author?.avatar ||
                                                undefined
                                            }
                                            sx={{ height: 18, width: 18 }}
                                            variant={'rounded'}
                                        />
                                        <div>{data?.author?.name}</div>
                                    </Stack>
                                }
                            />
                            <StatisticLine
                                title={'Просмотров:'}
                                text={numberFormatter(data?.views || 0)}
                            />
                            <StatisticLine
                                title={'Расстояние:'}
                                text={`${data?.distance || 0} км`}
                            />
                            <StatisticLine
                                title={'Координаты:'}
                                text={`${data?.latitude}, ${data?.longitude}`}
                            />
                            <StatisticLine
                                title={'Добавлено:'}
                                text={dayjs(data?.created?.date).format(
                                    'D MMMM YYYY, H:m'
                                )}
                            />
                            <StatisticLine
                                title={'Обновлено:'}
                                text={dayjs(data?.updated?.date).format(
                                    'D MMMM YYYY, H:m'
                                )}
                            />
                            <StatisticLine
                                title={'Рейтнг:'}
                                text={
                                    <Rating
                                        name={'size-small'}
                                        size={'small'}
                                        value={data?.rating || 0}
                                    />
                                }
                            />
                        </CardContent>
                    </Card>
                    <Card sx={{ mb: 2, mt: 2 }}>
                        <CardContent sx={{ height: '239px', p: 0 }}>
                            <DynamicMap
                                center={
                                    data?.latitude && data?.longitude
                                        ? [data.latitude, data.longitude]
                                        : [52.580517, 56.855385]
                                }
                                zoom={15}
                            >
                                {/*@ts-ignore*/}
                                {({ TileLayer }) => (
                                    <>
                                        <TileLayer
                                            url={
                                                'https://api.mapbox.com/styles/v1/miksoft/cli4uhd5b00bp01r6eocm21rq/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoibWlrc29mdCIsImEiOiJjbGFtY3d6dDkwZjA5M3lvYmxyY2kwYm5uIn0.j_wTLxCCsqAn9TJSHMvaJg'
                                            }
                                            attribution='Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>'
                                        />
                                        {data?.latitude && data?.longitude && (
                                            <Point
                                                lat={data.latitude}
                                                lon={data.longitude}
                                                title={data?.title}
                                                category={
                                                    data?.subcategory?.name ??
                                                    data?.category?.name
                                                }
                                            />
                                        )}
                                    </>
                                )}
                            </DynamicMap>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <div>
                <Typography
                    variant={'caption'}
                    sx={{ fontWeight: 300 }}
                >
                    {data?.address?.country && (
                        <Link
                            color='inherit'
                            href={`/country/${data.address.country.id}`}
                        >
                            {data.address.country.name}
                        </Link>
                    )}
                    {data?.address?.region && (
                        <>
                            {data?.address?.country && ', '}
                            <Link
                                color='inherit'
                                href={`/region/${data.address.region.id}`}
                            >
                                {data.address.region.name}
                            </Link>
                        </>
                    )}
                    {data?.address?.district && (
                        <>
                            {data?.address?.region && ', '}
                            <Link
                                color='inherit'
                                href={`/district/${data.address.district.id}`}
                            >
                                {data.address.district.name}
                            </Link>
                        </>
                    )}
                    {data?.address?.city && (
                        <>
                            {data?.address?.district && ', '}
                            <Link
                                color='inherit'
                                href={`/city/${data.address.city.id}`}
                            >
                                {data.address.city.name}
                            </Link>
                        </>
                    )}
                    {data?.address?.street && (
                        <>
                            {', '}
                            {data?.address?.street}
                        </>
                    )}
                </Typography>
            </div>

            {!!data?.tags?.length && (
                <Stack
                    direction='row'
                    spacing={1}
                    sx={{ mb: 2, mt: 1 }}
                >
                    {data.tags.map((tag) => (
                        <Chip
                            sx={{ pl: 0 }}
                            key={tag.id}
                            label={tag.title}
                            size={'small'}
                            variant='outlined'
                        />
                    ))}
                </Stack>
            )}

            <Card sx={{ mb: 2, mt: 0 }}>
                <CardContent>
                    <Typography
                        variant={'body2'}
                        sx={{ whiteSpace: 'break-spaces' }}
                    >
                        {data?.content}
                    </Typography>
                </CardContent>
            </Card>

            <Typography
                variant='h2'
                sx={{ mb: 2, mt: 4 }}
            >
                {'Ближайшие интересные места'}
            </Typography>

            <PlacesList places={nearPlacesData?.items} />

            {/*{!!data?.photos?.length && (*/}
            {/*    <Card>*/}
            {/*        <CardContent>*/}
            {/*            <ImageList*/}
            {/*                gap={4}*/}
            {/*                cols={4}*/}
            {/*            >*/}
            {/*                {data.photos.map((photo) => (*/}
            {/*                    <ImageListItem key={photo.filename}>*/}
            {/*                        <img*/}
            {/*                            src={`http://localhost:8080/photos/${data.id}/${photo.filename}_thumb.${photo.extension}`}*/}
            {/*                            alt={photo.title || ''}*/}
            {/*                            width={photo.width}*/}
            {/*                            height={photo.height}*/}
            {/*                        />*/}
            {/*                    </ImageListItem>*/}
            {/*                ))}*/}
            {/*            </ImageList>*/}
            {/*        </CardContent>*/}
            {/*    </Card>*/}
            {/*)}*/}

            {showLightbox && (
                <Lightbox
                    mainSrc={imageUrl(photoIndex)}
                    nextSrc={imageUrl(
                        (photoIndex + 1) % (data?.photos?.length || 0)
                    )}
                    imageTitle={data?.photos?.[photoIndex]?.title || ''}
                    prevSrc={imageUrl(
                        (photoIndex + (data?.photos?.length || 0) - 1) %
                            (data?.photos?.length || 0)
                    )}
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

interface StatisticLineProps {
    title: string
    text?: string | React.ReactNode
}

const StatisticLine: React.FC<StatisticLineProps> = ({ title, text }) => (
    <Stack
        direction={'row'}
        spacing={2}
        sx={{ mb: 0.6 }}
    >
        <Typography
            variant={'caption'}
            sx={{ fontWeight: 300, width: 100 }}
        >
            {title}
        </Typography>
        <Typography
            variant={'caption'}
            sx={{ fontWeight: 400 }}
        >
            {text || '-'}
        </Typography>
    </Stack>
)

export default Place
