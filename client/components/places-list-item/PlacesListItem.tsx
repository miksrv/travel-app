import { Place } from '@/api/types/Place'
import {
    PhotoCamera,
    RemoveRedEye,
    Star,
    Straighten
} from '@mui/icons-material'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import noPhoto from '@/public/images/no-photo-available.png'

import styles from './styles.module.sass'

interface PlacesListItemProps {
    place: Place
}

const PlacesListItem: React.FC<PlacesListItemProps> = ({ place }) => {
    return (
        <Card className={styles.placesListItem}>
            <Image
                className={styles.categoryIcon}
                src={`/poi/${
                    place?.subcategory?.name || place?.category?.name
                }.png`}
                alt={''}
                width={22}
                height={26}
            />
            <CardMedia
                component='img'
                height='180'
                image={
                    place?.photos?.[0]?.filename
                        ? `http://localhost:8080/photos/${place?.id}/${place?.photos?.[0]?.filename}_thumb.${place?.photos?.[0]?.extension}`
                        : noPhoto.src
                }
                alt='green iguana'
            />
            <CardContent sx={{ height: 157, overflow: 'hidden' }}>
                <Typography
                    gutterBottom
                    variant='h3'
                >
                    {place?.title}
                </Typography>
                <Typography
                    variant='body2'
                    color='text.secondary'
                >
                    {place?.content}...
                </Typography>
            </CardContent>
            <CardContent>
                <Stack
                    direction='row'
                    spacing={1}
                    sx={{ mb: -1 }}
                >
                    <Chip
                        icon={<RemoveRedEye />}
                        label={place.views || 0}
                        size={'small'}
                    />
                    {!!place.photosCount && (
                        <Chip
                            icon={<PhotoCamera />}
                            label={place.photosCount || 0}
                            size={'small'}
                        />
                    )}
                    {place.rating > 0 && (
                        <Chip
                            icon={<Star />}
                            label={place.rating}
                            size={'small'}
                        />
                    )}
                    {place.distance && (
                        <Chip
                            icon={<Straighten />}
                            label={`${place.distance || 0}`}
                            size={'small'}
                        />
                    )}
                </Stack>
            </CardContent>
        </Card>
    )
}

export default PlacesListItem
