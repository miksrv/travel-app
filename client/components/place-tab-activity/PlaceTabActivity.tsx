// import { ImageList, ImageListItem } from '@mui/material'
import Box from '@mui/material/Box'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Rating from '@mui/material/Rating'
// import Stack from '@mui/material/Stack'
// import Typography from '@mui/material/Typography'
// import Image from 'next/image'
import React from 'react'

// import { ImageHost } from '@/api/api'
import { ActivityTypes, Item } from '@/api/types/Activity'

import UserAvatar from '@/components/user-avatar'

import { formatDate } from '@/functions/helpers'

interface PlaceTabActivityProps {
    title?: string
    placeId?: string
    activity?: Item[]
}

const PlaceTabActivity: React.FC<PlaceTabActivityProps> = ({
    title,
    // placeId,
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
            {activity?.map((item, index) => (
                <Box
                    sx={{ mb: 2 }}
                    key={index}
                >
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
                                {item.type === ActivityTypes.Rating && (
                                    <Rating
                                        sx={{
                                            float: 'right',
                                            marginLeft: '5px',
                                            marginTop: '2px'
                                        }}
                                        size={'small'}
                                        value={item.rating?.value}
                                        readOnly={true}
                                    />
                                )}
                            </>
                        }
                    />

                    {/*{!!item.photos?.length && (*/}
                    {/*    <ImageList*/}
                    {/*        cols={item.photos.length}*/}
                    {/*        gap={1}*/}
                    {/*        variant={'standard'}*/}
                    {/*    >*/}
                    {/*        {item.photos.map((photo, photoIndex) => (*/}
                    {/*            <ImageListItem key={photoIndex}>*/}
                    {/*                <Image*/}
                    {/*                    src={`${ImageHost}photos/${placeId}/${photo.filename}_thumb.${photo.extension}`}*/}
                    {/*                    alt={''}*/}
                    {/*                    width={200}*/}
                    {/*                    height={100}*/}
                    {/*                />*/}
                    {/*            </ImageListItem>*/}
                    {/*        ))}*/}
                    {/*    </ImageList>*/}
                    {/*)}*/}
                </Box>
            ))}
        </CardContent>
    </>
)

export default PlaceTabActivity
