import { categoryImage } from '@/functions/categories'
import { convertDMS } from '@/functions/helpers'
import {
    AccessTimeOutlined,
    AccountCircleOutlined,
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
import Divider from '@mui/material/Divider'
import Rating from '@mui/material/Rating'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
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
import Gallery from 'react-photo-gallery'

import { API } from '@/api/api'
import { Activity, ApiTypes } from '@/api/types'

import Breadcrumbs from '@/components/breadcrumbs'
import Carousel from '@/components/carousel'
import PageLayout from '@/components/page-layout'
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

    const { data: ratingData } = API.useRatingGetListQuery(data?.id || '', {
        skip: !data?.id
    })

    const { data: activityData } = API.useActivityGetItemQuery(data?.id || '', {
        skip: !data?.id
    })

    const [setRating, { data: newRating, isLoading: setRatingLoading }] =
        API.useRatingPutScoreMutation()

    const [showLightbox, setShowLightbox] = useState<boolean>(false)
    const [photoIndex, setCurrentIndex] = useState<number>(0)

    const imageUrl = (index: number) =>
        `http://localhost:8080/photos/${data?.id}/${data?.photos?.[index]?.filename}.${data?.photos?.[index]?.extension}`

    const thumbImageUrl = (index: number) =>
        `http://localhost:8080/photos/${data?.id}/${data?.photos?.[index]?.filename}_thumb.${data?.photos?.[index]?.extension}`

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
                            ? `http://localhost:8080/photos/${data?.id}/${data?.photos?.[0]?.filename}.${data?.photos?.[0]?.extension}`
                            : noPhoto.src
                    }
                    onClick={() => {
                        setCurrentIndex(0)
                        setShowLightbox(true)
                    }}
                />
            </Card>

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
                                                    marginTop: '2px',
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
                                            sx={{ height: 20, width: 20 }}
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
                                        <sup>
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
                                        </sup>
                                    </>
                                }
                            />
                            <StatisticLine
                                icon={<AccessTimeOutlined color={'disabled'} />}
                                title={'Изменено:'}
                                text={dayjs(data?.updated?.date).format(
                                    'D MMMM YYYY, HH:mm'
                                )}
                            />
                            <StatisticLine
                                icon={<StarBorderOutlined color={'disabled'} />}
                                title={'Рейтнг:'}
                                text={
                                    <Box
                                        sx={{
                                            alignItems: 'center',
                                            display: 'flex',
                                            width: 200
                                        }}
                                    >
                                        <Rating
                                            size={'medium'}
                                            value={
                                                data?.rating &&
                                                data.rating > 0 &&
                                                !newRating?.rating
                                                    ? data?.rating
                                                    : newRating?.rating ?? 0
                                            }
                                            disabled={setRatingLoading}
                                            readOnly={!ratingData?.canVote}
                                            onChange={(_, value) => {
                                                setRating({
                                                    place: data?.id!,
                                                    score: value || 5
                                                })
                                            }}
                                        />
                                        {!!ratingData?.count && (
                                            <Box
                                                sx={{ ml: 1 }}
                                            >{`(${ratingData?.count})`}</Box>
                                        )}
                                    </Box>
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
                    <>
                        <CardHeader
                            title={`${data?.title} - описание`}
                            titleTypographyProps={{
                                component: 'h2',
                                fontSize: 18
                            }}
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
                    </>
                )}
                {value === 1 && (
                    <>
                        <CardHeader
                            title={`${data?.title} - фотографии`}
                            titleTypographyProps={{
                                component: 'h2',
                                fontSize: 18
                            }}
                            sx={{ mb: -3 }}
                        />
                        <CardContent>
                            {data?.photos?.length && (
                                <Gallery
                                    photos={data?.photos?.map((photo) => ({
                                        height: photo.height,
                                        src: `http://localhost:8080/photos/${data?.id}/${photo.filename}_thumb.${photo.extension}`,
                                        width: photo.width
                                    }))}
                                    onClick={(event, photos) => {
                                        setCurrentIndex(photos.index)
                                        setShowLightbox(true)
                                    }}
                                />
                            )}
                        </CardContent>
                    </>
                )}

                {value === 2 && (
                    <>
                        <CardHeader
                            title={`${data?.title} - история активности`}
                            titleTypographyProps={{
                                component: 'h2',
                                fontSize: 18
                            }}
                            sx={{ mb: -2 }}
                        />
                        <CardContent sx={{ mb: -2 }}>
                            {activityData?.items?.length ? (
                                <>
                                    {activityData.items.map((item, key) => (
                                        <Stack
                                            key={key}
                                            direction='row'
                                            spacing={4}
                                            sx={{ pb: 1 }}
                                        >
                                            <Typography
                                                variant={'body1'}
                                                sx={{
                                                    color: '#818c99',
                                                    display: 'block',
                                                    width: 160
                                                }}
                                            >
                                                {dayjs(
                                                    item?.created?.date
                                                ).format('D MMMM YYYY, HH:mm')}
                                            </Typography>
                                            <Typography
                                                variant={'body1'}
                                                sx={{
                                                    display: 'block',
                                                    width: 160
                                                }}
                                            >
                                                {
                                                    {
                                                        [Activity.ActivityTypes
                                                            .Place]:
                                                            'Редактирование',
                                                        [Activity.ActivityTypes
                                                            .Photo]:
                                                            'Загрузка фотографии',
                                                        [Activity.ActivityTypes
                                                            .Rating]:
                                                            'Оценка места'
                                                    }[item.type]
                                                }
                                            </Typography>
                                            <Box sx={{ width: 120 }}>
                                                {item.type ===
                                                    Activity.ActivityTypes
                                                        .Place && <div> </div>}
                                                {item.type ===
                                                    Activity.ActivityTypes
                                                        .Rating && (
                                                    <Rating
                                                        size={'medium'}
                                                        value={
                                                            item.rating?.value
                                                        }
                                                        readOnly={true}
                                                    />
                                                )}
                                                {item.type ===
                                                    Activity.ActivityTypes
                                                        .Photo && (
                                                    <Image
                                                        style={{
                                                            objectFit: 'cover'
                                                        }}
                                                        src={`http://localhost:8080/photos/${data?.id}/${item.photo?.filename}_thumb.${item.photo?.extension}`}
                                                        alt={
                                                            item.photo?.title ||
                                                            ''
                                                        }
                                                        width={105}
                                                        height={20}
                                                    />
                                                )}
                                            </Box>
                                            <div>
                                                {item.author ? (
                                                    <Stack
                                                        direction={'row'}
                                                        spacing={1}
                                                    >
                                                        <Avatar
                                                            alt={
                                                                item.author
                                                                    .name || ''
                                                            }
                                                            src={
                                                                `http://localhost:8080/avatars/${item.author.avatar}` ||
                                                                undefined
                                                            }
                                                            sx={{
                                                                height: 20,
                                                                width: 20
                                                            }}
                                                            variant={'rounded'}
                                                        />
                                                        <div>
                                                            {item.author.name}
                                                        </div>
                                                    </Stack>
                                                ) : (
                                                    <div>{'Гость'}</div>
                                                )}
                                            </div>
                                        </Stack>
                                    ))}
                                </>
                            ) : (
                                <>{'Нет данных для отображения'}</>
                            )}
                        </CardContent>
                    </>
                )}
            </Card>

            <Typography
                variant='h2'
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
                        <Stack
                            direction={'row'}
                            spacing={1}
                        >
                            <Avatar
                                alt={
                                    data?.photos?.[photoIndex]?.author?.name ||
                                    ''
                                }
                                src={
                                    `http://localhost:8080/avatars/${data?.photos?.[photoIndex]?.author?.avatar}` ||
                                    undefined
                                }
                                sx={{ height: 32, width: 32 }}
                                variant={'rounded'}
                            />
                            <div>
                                <div>
                                    {data?.photos?.[photoIndex]?.author?.name}
                                </div>
                                <Typography
                                    variant={'caption'}
                                    sx={{
                                        color: '#818c99',
                                        display: 'block',
                                        mt: '-4px'
                                    }}
                                >
                                    {dayjs(
                                        data?.photos?.[photoIndex]?.created
                                            ?.date
                                    ).format('D MMMM YYYY, HH:mm')}
                                </Typography>
                            </div>
                        </Stack>
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
        <Typography
            sx={{ color: '#818c99', width: 140 }}
            variant={'body1'}
        >
            {title}
        </Typography>
        <Typography variant={'body1'}>{text || '-'}</Typography>
    </Stack>
)

export default Place
