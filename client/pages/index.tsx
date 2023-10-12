import { Card } from '@mui/material'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import { NextPage } from 'next'
import type { GetStaticProps } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import Gallery from 'react-photo-gallery'

import { API, ImageHost } from '@/api/api'
import { ActivityTypes } from '@/api/types/Activity'

import Avatar from '@/components/avatar'
import Breadcrumbs from '@/components/breadcrumbs'
import PageLayout from '@/components/page-layout'

import { categoryImage } from '@/functions/categories'
import { formatDate } from '@/functions/helpers'

const Main: NextPage = () => {
    const { t } = useTranslation('common')

    const { data, isLoading } = API.useActivityGetListQuery()

    return (
        <PageLayout>
            <Card sx={{ mb: 2 }}>
                <CardHeader
                    title={t('title', 'Лента активности')}
                    titleTypographyProps={{ component: 'h1' }}
                    subheader={
                        <Breadcrumbs
                            currentPage={'Лента активности пользователей'}
                            hideHomePage={true}
                        />
                    }
                    sx={{ mb: -0.5, mt: -0.5 }}
                />
            </Card>
            {data?.items?.map((item, index) => (
                <Card
                    key={index}
                    sx={{ mb: 1.5 }}
                >
                    <CardContent>
                        <Avatar
                            size={'medium'}
                            userName={item.author?.name}
                            image={item.author?.avatar}
                            text={
                                <>
                                    {formatDate(item.created?.date)}
                                    {' • '}
                                    {
                                        {
                                            [ActivityTypes.Place]:
                                                'Редактирование',
                                            [ActivityTypes.Photo]:
                                                'Загрузка фотографии',
                                            [ActivityTypes.Rating]:
                                                'Оценка места'
                                        }[item.type]
                                    }
                                </>
                            }
                        />

                        <Typography
                            gutterBottom
                            variant={'h3'}
                            sx={{ mt: 1 }}
                        >
                            <Link
                                href={`/places/${item.place?.id}`}
                                title={item.place?.title}
                                style={{
                                    color: 'rgba(0, 0, 0, 0.87)',
                                    textDecoration: 'none'
                                }}
                            >
                                <Image
                                    style={{
                                        float: 'left',
                                        marginLeft: '2px',
                                        marginRight: '4px',
                                        marginTop: '1px'
                                    }}
                                    src={
                                        categoryImage(
                                            item.place?.category?.name
                                        ).src
                                    }
                                    alt={item.place?.category?.title || ''}
                                    width={16}
                                    height={18}
                                />
                                {item.place?.title}
                            </Link>
                        </Typography>

                        {item.type === ActivityTypes.Place && (
                            <Typography
                                variant={'body1'}
                                color={'text.primary'}
                                sx={{ mb: -1.5 }}
                            >
                                {item.place?.content
                                    ? `${item.place.content}...`
                                    : 'Нет данных для отображения'}
                            </Typography>
                        )}

                        {item.photos?.length && item.place?.id ? (
                            <Gallery
                                photos={item.photos?.map((photo) => ({
                                    height: photo.height,
                                    src: `${ImageHost}photos/${item.place?.id}/${photo.filename}.${photo.extension}`,
                                    width: photo.width
                                }))}
                            />
                        ) : (
                            ''
                        )}
                    </CardContent>
                </Card>
            ))}
        </PageLayout>
    )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
    props: {
        ...(await serverSideTranslations(locale ?? 'ru'))
    }
})

export default Main
