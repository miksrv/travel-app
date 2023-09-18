import { numberFormatter } from '@/functions/helpers'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Unstable_Grid2'
import { skipToken } from '@reduxjs/toolkit/query'
import { NextPage } from 'next'
import { useRouter } from 'next/dist/client/router'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { usePlacesGetItemQuery } from '@/api/api'

import Breadcrumbs from '@/components/breadcrumbs'
import Carousel from '@/components/carousel'
import PageLayout from '@/components/page-layout'
import PageTitle from '@/components/page-title'

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
            >
                <Grid
                    lg={8}
                    md={8}
                    xs={12}
                >
                    <Card sx={{ mb: 2, mt: 2 }}>
                        <CardContent
                            sx={{ height: 500, p: 0, position: 'relative' }}
                        >
                            {data?.photos?.[0] && (
                                <Image
                                    style={{
                                        height: 'inherit',
                                        marginBottom: -30,
                                        objectFit: 'cover',
                                        width: '100%    '
                                    }}
                                    src={`http://localhost:8080/photos/${data?.id}/${data?.photos?.[0]?.filename}.${data?.photos?.[0]?.extension}`}
                                    alt={data?.photos?.[0]?.title || ''}
                                    width={data?.photos?.[0]?.width}
                                    height={data?.photos?.[0]?.height}
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
                    <Card sx={{ mb: 2, mt: 2 }}>
                        <CardContent sx={{ height: '224px' }}>
                            <Typography variant={'body2'}>
                                Просмотров: {numberFormatter(data?.views || 0)}
                            </Typography>
                            <Typography variant={'body2'}>
                                Фотографий: {data?.photosCount}
                            </Typography>
                            <Typography variant={'body2'}>
                                Расстояние: {data?.distance} км
                            </Typography>
                            <Typography variant={'body2'}>
                                Категория: {data?.category?.title}
                            </Typography>
                            <Typography variant={'body2'}>
                                Подкатегория: {data?.subcategory?.title}
                            </Typography>
                            <Typography variant={'body2'}>
                                Адрес: {data?.address?.street || '-'}
                            </Typography>
                            <Typography variant={'body2'}>
                                Страна:{' '}
                                {data?.address?.country ? (
                                    <Link
                                        color='inherit'
                                        href={`/country/${data.address.country.id}`}
                                    >
                                        {data.address.country.name}
                                    </Link>
                                ) : (
                                    '-'
                                )}
                            </Typography>
                            <Typography variant={'body2'}>
                                Область:{' '}
                                {data?.address?.region ? (
                                    <Link
                                        color='inherit'
                                        href={`/region/${data.address.region.id}`}
                                    >
                                        {data.address.region.name}
                                    </Link>
                                ) : (
                                    '-'
                                )}
                            </Typography>
                            <Typography variant={'body2'}>
                                Район:{' '}
                                {data?.address?.district ? (
                                    <Link
                                        color='inherit'
                                        href={`/district/${data.address.district.id}`}
                                    >
                                        {data.address.district.name}
                                    </Link>
                                ) : (
                                    '-'
                                )}
                            </Typography>
                            <Typography variant={'body2'}>
                                Населенный пункт:{' '}
                                {data?.address?.city ? (
                                    <Link
                                        color='inherit'
                                        href={`/city/${data.address.city.id}`}
                                    >
                                        {data.address.city.name}
                                    </Link>
                                ) : (
                                    '-'
                                )}
                            </Typography>
                        </CardContent>
                    </Card>
                    <Card sx={{ mb: 2, mt: 2 }}>
                        <CardContent sx={{ height: '260px', p: 0 }}>
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

            {!!data?.tags?.length && (
                <Stack
                    direction='row'
                    spacing={1}
                    sx={{ mb: -1, mt: 2 }}
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

            <br />
            <br />
            <br />
            <br />

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
        </PageLayout>
    )
}

export default Place
