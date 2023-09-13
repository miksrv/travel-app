import { numberFormatter } from '@/functions/helpers'
import { ImageList, ImageListItem } from '@mui/material'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { skipToken } from '@reduxjs/toolkit/query'
import { NextPage } from 'next'
import { useRouter } from 'next/dist/client/router'
import Image from 'next/image'
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
                sx={{ mb: 1, mt: 2 }}
            >
                {data?.title}
            </Typography>
            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <Typography variant={'body1'}>{data?.content}</Typography>
                </CardContent>
            </Card>
            <Card sx={{ mb: 2 }}>
                <CardContent>
                    <div>Просмотров: {numberFormatter(data?.views || 0)}</div>
                    <div>Рейтинг: {data?.rating}</div>
                    <div>Фотографий: {data?.photosCount}</div>
                    <div>Расстояние: {data?.distance} км</div>
                    <div>Категория: {data?.category?.title}</div>
                    <div>Подкатегория: {data?.subcategory?.title}</div>
                </CardContent>
            </Card>
            {!!data?.photos?.length && (
                <Card>
                    <CardContent>
                        <ImageList
                            gap={3}
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
