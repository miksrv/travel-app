import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { skipToken } from '@reduxjs/toolkit/query'
import { NextPage } from 'next'
import { useRouter } from 'next/dist/client/router'
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
            <Card>
                <CardContent>
                    <div>Просмотров: {data?.views}</div>
                    <div>Рейтинг: {data?.rating}</div>
                    <div>Фотографий: {data?.photosCount}</div>
                    <div>Расстояние: {data?.distance}</div>
                </CardContent>
            </Card>

            {isLoading && <div>Loading....</div>}
            {data && JSON.stringify(data)}
            <div>{routerObject}</div>
        </PageLayout>
    )
}

export default Place
