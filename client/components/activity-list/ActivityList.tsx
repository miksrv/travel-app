import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import Gallery from 'react-photo-gallery'

import { ImageHost } from '@/api/api'
import { ActivityTypes, Item } from '@/api/types/Activity'

import UserAvatar from '@/components/user-avatar'

import { categoryImage } from '@/functions/categories'
import { formatDate } from '@/functions/helpers'

interface PlacesListProps {
    perPage?: number
    loading?: boolean
    activities?: Item[]
}

const ActivityList: React.FC<PlacesListProps> = ({
    perPage,
    activities,
    loading
}) => (
    <>
        {activities?.map((item, index) => (
            <Card
                key={index}
                sx={{ mb: 1.5 }}
            >
                <CardContent>
                    <UserAvatar
                        size={'medium'}
                        user={item.author}
                        text={
                            <>
                                {formatDate(item.created?.date)}
                                {' • '}
                                {
                                    {
                                        [ActivityTypes.Place]:
                                            'Отредактировал(а) материал',
                                        [ActivityTypes.Photo]:
                                            'Загрузил(а) фотографии',
                                        [ActivityTypes.Rating]:
                                            'Поставил(а) оценку'
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
                                    categoryImage(item.place?.category?.name)
                                        .src
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
                                src: `${ImageHost}photo/${item.place?.id}/${photo.filename}.${photo.extension}`,
                                width: photo.width
                            }))}
                        />
                    ) : (
                        ''
                    )}
                </CardContent>
            </Card>
        ))}
    </>
)

export default ActivityList
