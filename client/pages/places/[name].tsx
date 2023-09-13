import { numberFormatter } from '@/functions/helpers'
import { ImageList, ImageListItem } from '@mui/material'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { skipToken } from '@reduxjs/toolkit/query'
import { NextPage } from 'next'
import { useRouter } from 'next/dist/client/router'
import Link from 'next/link'
import React from 'react'

import { usePlacesGetItemQuery } from '@/api/api'

import PageLayout from '@/components/page-layout'

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
            <Typography
                variant='h1'
                sx={{ mb: 0.5, mt: 2 }}
            >
                {data?.title}
            </Typography>
            <Breadcrumbs aria-label='breadcrumb'>
                <Link
                    color='inherit'
                    href='/'
                >
                    Главная
                </Link>
                <Link
                    color='inherit'
                    href='/places/'
                >
                    Интересные места
                </Link>
                <Typography variant={'caption'}>{data?.title}</Typography>
            </Breadcrumbs>
            <Card sx={{ mb: 2, mt: 2 }}>
                <CardContent>
                    <Typography
                        variant={'body2'}
                        sx={{ whiteSpace: 'break-spaces' }}
                    >
                        {data?.content}
                    </Typography>
                </CardContent>
            </Card>
            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Typography variant={'body2'}>
                        <div>
                            Просмотров: {numberFormatter(data?.views || 0)}
                        </div>
                        <div>Рейтинг: {data?.rating}</div>
                        <div>Фотографий: {data?.photosCount}</div>
                        <div>Расстояние: {data?.distance} км</div>
                        <div>Категория: {data?.category?.title}</div>
                        <div>Подкатегория: {data?.subcategory?.title}</div>
                        {data?.address?.country && (
                            <div>
                                Страна:{' '}
                                <Link
                                    color='inherit'
                                    href={`/country/${data.address.country.id}`}
                                >
                                    {data.address.country.name}
                                </Link>
                            </div>
                        )}
                        {data?.address?.region && (
                            <div>
                                Область:{' '}
                                <Link
                                    color='inherit'
                                    href={`/region/${data.address.region.id}`}
                                >
                                    {data.address.region.name}
                                </Link>
                            </div>
                        )}
                        {data?.address?.district && (
                            <div>
                                Район:{' '}
                                <Link
                                    color='inherit'
                                    href={`/district/${data.address.district.id}`}
                                >
                                    {data.address.district.name}
                                </Link>
                            </div>
                        )}
                        {data?.address?.city && (
                            <div>
                                Населенный пункт:{' '}
                                <Link
                                    color='inherit'
                                    href={`/city/${data.address.city.id}`}
                                >
                                    {data.address.city.name}
                                </Link>
                            </div>
                        )}
                    </Typography>
                </CardContent>
            </Card>
            {!!data?.photos?.length && (
                <Card>
                    <CardContent>
                        <ImageList
                            gap={4}
                            cols={4}
                        >
                            {data.photos.map((photo) => (
                                <ImageListItem key={photo.filename}>
                                    <img
                                        src={`http://localhost:8080/photos/${data.id}/${photo.filename}_thumb.${photo.extension}`}
                                        alt={photo.title || ''}
                                        width={photo.width}
                                        height={photo.height}
                                    />
                                </ImageListItem>
                            ))}
                        </ImageList>
                    </CardContent>
                </Card>
            )}
        </PageLayout>
    )
}

export default Place
