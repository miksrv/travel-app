import Box from '@mui/material/Box'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Rating from '@mui/material/Rating'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import React from 'react'

import { ImageHost } from '@/api/api'
import { ActivityTypes, Item } from '@/api/types/Activity'

import Avatar from '@/components/avatar'

import { formatDate } from '@/functions/helpers'

interface PlaceTabActivityProps {
    title?: string
    placeId?: string
    activity?: Item[]
}

const PlaceTabActivity: React.FC<PlaceTabActivityProps> = ({
    title,
    placeId,
    activity
}) => (
    <>
        <CardHeader
            title={
                title ? `${title} - история активности` : 'История активности'
            }
            titleTypographyProps={{
                component: 'h2',
                fontSize: 18
            }}
            sx={{ mb: -2 }}
        />
        <CardContent sx={{ mb: -2 }}>
            {activity?.length ? (
                <>
                    {activity?.map((item, key) => (
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
                                {formatDate(item?.created?.date)}
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
                                        [ActivityTypes.Place]: 'Редактирование',
                                        [ActivityTypes.Photo]:
                                            'Загрузка фотографии',
                                        [ActivityTypes.Rating]: 'Оценка места'
                                    }[item.type]
                                }
                            </Typography>
                            <Box sx={{ width: 120 }}>
                                {item.type === ActivityTypes.Place && (
                                    <div> </div>
                                )}
                                {item.type === ActivityTypes.Rating && (
                                    <Rating
                                        size={'medium'}
                                        value={item.rating?.value}
                                        readOnly={true}
                                    />
                                )}
                                {item.type === ActivityTypes.Photo &&
                                    placeId && (
                                        <Image
                                            style={{
                                                objectFit: 'cover'
                                            }}
                                            src={`${ImageHost}/photos/${placeId}/${item.photo?.filename}_thumb.${item.photo?.extension}`}
                                            alt={item.photo?.title || ''}
                                            width={105}
                                            height={20}
                                        />
                                    )}
                            </Box>
                            <Avatar
                                userName={item.author?.name}
                                image={item.author?.avatar}
                            />
                        </Stack>
                    ))}
                </>
            ) : (
                <>{'Нет данных для отображения'}</>
            )}
        </CardContent>
    </>
)

export default PlaceTabActivity
