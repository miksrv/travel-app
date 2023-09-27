import { categoryImage } from '@/functions/categories'
import { convertDMS } from '@/functions/helpers'
import {
    AccessTimeOutlined,
    AccountCircleOutlined,
    AddAlarmOutlined,
    BookmarkBorderOutlined,
    PlaceOutlined,
    RemoveRedEyeOutlined,
    StarBorderOutlined,
    StraightenOutlined
} from '@mui/icons-material'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import CardMedia from '@mui/material/CardMedia'
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

import noPhoto from '@/public/images/no-photo-available.png'

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
            limit: 3,
            longitude: data?.longitude,
            order: API.SortOrder.ASC,
            sort: API.SortFields.Distance
        },
        { skip: !data?.longitude || !data?.latitude }
    )

    const [showLightbox, setShowLightbox] = useState<boolean>(false)
    const [photoIndex, setCurrentIndex] = useState<number>(0)

    const imageUrl = (index: number) =>
        `http://localhost:8080/photos/${data?.id}/${data?.photos?.[index]?.filename}.${data?.photos?.[index]?.extension}`

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
                    component={'img'}
                    height={300}
                    image={
                        data?.photos?.[0]?.filename
                            ? `http://localhost:8080/photos/${data?.id}/${data?.photos?.[0]?.filename}.${data?.photos?.[0]?.extension}`
                            : noPhoto.src
                    }
                    onClick={() => {
                        setCurrentIndex(0)
                        setShowLightbox(true)
                    }}
                />
            </Card>

            {/*<Paper*/}
            {/*    sx={{*/}
            {/*        mb: 2,*/}
            {/*        mt: 2,*/}
            {/*        p: 2,*/}
            {/*        pb: 1,*/}
            {/*        pt: 1*/}
            {/*    }}*/}
            {/*>*/}
            {/*    <PageTitle title={data?.title || ''} />*/}
            {/*    <Breadcrumbs*/}
            {/*        currentPage={data?.title}*/}
            {/*        links={[{ link: '/places/', text: 'Интересные места' }]}*/}
            {/*    />*/}
            {/*    {data?.photos?.[0] && (*/}
            {/*        <Box*/}
            {/*            sx={{*/}
            {/*                borderBottomLeftRadius: '4px',*/}
            {/*                borderBottomRightRadius: '4px',*/}
            {/*                mb: -2,*/}
            {/*                ml: -2,*/}
            {/*                mr: -2,*/}
            {/*                mt: 1*/}
            {/*            }}*/}
            {/*        >*/}
            {/*            <Image*/}
            {/*                style={{*/}
            {/*                    borderBottomLeftRadius: '4px',*/}
            {/*                    borderBottomRightRadius: '4px',*/}
            {/*                    cursor: 'pointer',*/}
            {/*                    height: 300,*/}
            {/*                    objectFit: 'cover',*/}
            {/*                    objectPosition: 'center',*/}
            {/*                    width: '100%'*/}
            {/*                }}*/}
            {/*                src={`http://localhost:8080/photos/${data?.id}/${data?.photos?.[0]?.filename}.${data?.photos?.[0]?.extension}`}*/}
            {/*                alt={data?.photos?.[0]?.title || ''}*/}
            {/*                width={data?.photos?.[0]?.width}*/}
            {/*                height={data?.photos?.[0]?.height}*/}
            {/*                onClick={() => {*/}
            {/*                    setCurrentIndex(0)*/}
            {/*                    setShowLightbox(true)*/}
            {/*                }}*/}
            {/*            />*/}
            {/*        </Box>*/}
            {/*    )}*/}
            {/*</Paper>*/}
            {/*<Card sx={{ mb: 2, mt: 0 }}>*/}
            {/*    <CardContent sx={{ height: 500, p: 0, position: 'relative' }}>*/}
            {/*        {data?.photos?.[0] && (*/}
            {/*            <Image*/}
            {/*                style={{*/}
            {/*                    cursor: 'pointer',*/}
            {/*                    height: 'inherit',*/}
            {/*                    marginBottom: -30,*/}
            {/*                    objectFit: 'cover',*/}
            {/*                    width: '100%'*/}
            {/*                }}*/}
            {/*                src={`http://localhost:8080/photos/${data?.id}/${data?.photos?.[0]?.filename}.${data?.photos?.[0]?.extension}`}*/}
            {/*                alt={data?.photos?.[0]?.title || ''}*/}
            {/*                width={data?.photos?.[0]?.width}*/}
            {/*                height={data?.photos?.[0]?.height}*/}
            {/*                onClick={() => {*/}
            {/*                    setCurrentIndex(0)*/}
            {/*                    setShowLightbox(true)*/}
            {/*                }}*/}
            {/*            />*/}
            {/*        )}*/}

            {/*        {!!data?.photos?.length && data.photos.length > 1 && (*/}
            {/*            <div className={'photos'}>*/}
            {/*                <Carousel*/}
            {/*                    slides={data?.photos}*/}
            {/*                    placeId={data.id}*/}
            {/*                    options={{*/}
            {/*                        containScroll: 'trimSnaps',*/}
            {/*                        dragFree: true*/}
            {/*                    }}*/}
            {/*                    onClick={(fileName) => {*/}
            {/*                        const findIndex = data?.photos?.findIndex(*/}
            {/*                            (photo) => photo.filename === fileName*/}
            {/*                        )*/}

            {/*                        setCurrentIndex(findIndex || 0)*/}
            {/*                        setShowLightbox(true)*/}
            {/*                    }}*/}
            {/*                />*/}
            {/*            </div>*/}
            {/*        )}*/}
            {/*    </CardContent>*/}
            {/*</Card>*/}

            <Card sx={{ mb: 2, mt: 0 }}>
                <CardContent sx={{ mb: -4 }}>
                    <Grid
                        container
                        spacing={2}
                        sx={{ mb: 2 }}
                    >
                        <Grid
                            lg={6}
                            md={6}
                            xs={6}
                        >
                            <StatisticLine
                                icon={
                                    <BookmarkBorderOutlined
                                        color={'disabled'}
                                    />
                                }
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
                                                src={
                                                    categoryImage(
                                                        data.category?.name
                                                    ).src
                                                }
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
                                icon={
                                    <AccountCircleOutlined color={'disabled'} />
                                }
                                title={'Автор:'}
                                text={
                                    <Stack
                                        direction={'row'}
                                        spacing={1}
                                    >
                                        <Avatar
                                            alt={data?.author?.name || ''}
                                            src={
                                                `http://localhost:8080/avatars/${data?.author?.avatar}` ||
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
                                icon={
                                    <RemoveRedEyeOutlined color={'disabled'} />
                                }
                                title={'Просмотров:'}
                                text={data?.views || 0}
                            />
                            <StatisticLine
                                icon={<StraightenOutlined color={'disabled'} />}
                                title={'Расстояние:'}
                                text={`${data?.distance || 0} км`}
                            />
                            <StatisticLine
                                icon={<PlaceOutlined color={'disabled'} />}
                                title={'Координаты:'}
                                text={
                                    <>
                                        {`${convertDMS(
                                            data?.latitude || 0,
                                            data?.longitude || 0
                                        )}`}{' '}
                                        <Link
                                            color={'inherit'}
                                            target={'_blank'}
                                            href={`https://yandex.ru/maps/?pt=${data?.longitude},${data?.latitude}&spn=0.1,0.1&l=sat,skl&z=14`}
                                        >
                                            {'Я'}
                                        </Link>{' '}
                                        <Link
                                            target={'_blank'}
                                            color={'inherit'}
                                            href={`https://maps.google.com/maps?ll=${data?.latitude},${data?.longitude}&q=${data?.latitude},${data?.longitude}&spn=0.1,0.1&amp;t=h&amp;hl=ru`}
                                        >
                                            {'G'}
                                        </Link>
                                    </>
                                }
                            />
                            <StatisticLine
                                icon={<AddAlarmOutlined color={'disabled'} />}
                                title={'Добавлено:'}
                                text={dayjs(data?.created?.date).format(
                                    'D MMMM YYYY, H:m'
                                )}
                            />
                            <StatisticLine
                                icon={<AccessTimeOutlined color={'disabled'} />}
                                title={'Обновлено:'}
                                text={dayjs(data?.updated?.date).format(
                                    'D MMMM YYYY, H:m'
                                )}
                            />
                            <StatisticLine
                                icon={<StarBorderOutlined color={'disabled'} />}
                                title={'Рейтнг:'}
                                text={
                                    <Rating
                                        name={'size-small'}
                                        size={'medium'}
                                        value={data?.rating || 0}
                                    />
                                }
                            />
                        </Grid>
                        <Grid
                            lg={6}
                            md={6}
                            xs={6}
                        >
                            <Box
                                sx={{
                                    border: '1px solid #CCC',
                                    borderRadius: 1,
                                    height: '100%',
                                    overflow: 'hidden',
                                    width: '100%'
                                }}
                            >
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
                                            {data?.latitude &&
                                                data?.longitude && (
                                                    <Point
                                                        lat={data.latitude}
                                                        lon={data.longitude}
                                                        title={data?.title}
                                                        category={
                                                            data?.subcategory
                                                                ?.name ??
                                                            data?.category?.name
                                                        }
                                                    />
                                                )}
                                        </>
                                    )}
                                </DynamicMap>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card sx={{ mb: 2, mt: 0 }}>
                <CardHeader
                    title={`${data?.title} - описание`}
                    titleTypographyProps={{ component: 'h2', fontSize: 18 }}
                    sx={{ mb: -2 }}
                    subheader={
                        <Typography variant={'caption'}>
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
                    }
                />
                <CardContent sx={{ mt: -3 }}>
                    <Typography
                        variant={'body2'}
                        sx={{ whiteSpace: 'break-spaces' }}
                    >
                        {data?.content}
                    </Typography>

                    {!!data?.tags?.length && (
                        <Stack
                            direction='row'
                            spacing={1}
                            sx={{ mb: -1, mt: 1 }}
                        >
                            {data.tags.map((tag) => (
                                <Link
                                    key={tag.id}
                                    color={'inherit'}
                                    href={`/tags/${tag.id}`}
                                >
                                    {`#${tag.title}`}
                                </Link>
                            ))}
                        </Stack>
                    )}
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
    icon?: React.ReactNode
    title: string
    text?: React.ReactNode
}

const StatisticLine: React.FC<StatisticLineProps> = ({ icon, title, text }) => (
    <Stack
        direction={'row'}
        spacing={1}
        sx={{ mb: 0.6 }}
    >
        {icon}
        <Typography sx={{ width: 140 }}>{title}</Typography>
        <Typography sx={{ fontWeight: 500 }}>{text || '-'}</Typography>
    </Stack>
)

export default Place
