import {
    AccessTimeOutlined,
    AccountCircleOutlined,
    BookmarkBorderOutlined,
    PlaceOutlined,
    RemoveRedEyeOutlined,
    StarBorderOutlined,
    StraightenOutlined
} from '@mui/icons-material'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Rating from '@mui/material/Rating'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Grid from '@mui/material/Unstable_Grid2'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { API } from '@/api/api'
import { Place } from '@/api/types/Place'

import Avatar from '@/components/avatar'
import StatisticLine from '@/components/place-information/StatisticLine'

import { categoryImage } from '@/functions/categories'
import { convertDMS, formatDate } from '@/functions/helpers'

const InteractiveMap = dynamic(() => import('@/components/interactive-map'), {
    ssr: false
})
const MarkerPoint = dynamic(
    () => import('@/components/interactive-map/MarkerPoint'),
    {
        ssr: false
    }
)

interface PlaceInformationProps {
    place?: Place
    ratingCount?: number
    loading?: boolean
}

const PlaceInformation: React.FC<PlaceInformationProps> = (props) => {
    const { place, ratingCount, loading } = props

    const [setRating, { data: newRating, isLoading: setRatingLoading }] =
        API.useRatingPutScoreMutation()

    return (
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
                            icon={<BookmarkBorderOutlined color={'disabled'} />}
                            title={'Категория:'}
                            text={
                                <Stack
                                    direction={'row'}
                                    spacing={2}
                                >
                                    {loading ? (
                                        <>
                                            <Skeleton
                                                variant={'rectangular'}
                                                width={18}
                                                height={18}
                                            />
                                            <Skeleton
                                                variant={'text'}
                                                width={150}
                                                sx={{
                                                    marginLeft:
                                                        '10px !important',
                                                    marginTop: '-1px !important'
                                                }}
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <Image
                                                style={{
                                                    marginLeft: '2px',
                                                    marginRight: '4px',
                                                    marginTop: '2px'
                                                }}
                                                src={
                                                    categoryImage(
                                                        place?.category?.name
                                                    ).src
                                                }
                                                alt={
                                                    place?.category?.title || ''
                                                }
                                                width={16}
                                                height={18}
                                            />
                                            {place?.category?.title}
                                        </>
                                    )}
                                </Stack>
                            }
                        />
                        <StatisticLine
                            icon={<AccountCircleOutlined color={'disabled'} />}
                            title={'Автор:'}
                            text={
                                <Avatar
                                    userName={place?.author?.name}
                                    image={place?.author?.avatar}
                                    loading={loading}
                                />
                            }
                        />
                        <StatisticLine
                            icon={<RemoveRedEyeOutlined color={'disabled'} />}
                            title={'Просмотров:'}
                            text={
                                loading ? (
                                    <Skeleton
                                        variant={'text'}
                                        width={150}
                                    />
                                ) : (
                                    place?.views || 0
                                )
                            }
                        />
                        <StatisticLine
                            icon={<StraightenOutlined color={'disabled'} />}
                            title={'Расстояние:'}
                            text={
                                loading ? (
                                    <Skeleton
                                        variant={'text'}
                                        width={60}
                                    />
                                ) : place?.distance ? (
                                    `${place?.distance || 0} км`
                                ) : (
                                    '-'
                                )
                            }
                        />
                        <StatisticLine
                            icon={<PlaceOutlined color={'disabled'} />}
                            title={'Координаты:'}
                            text={
                                loading ? (
                                    <Skeleton
                                        variant={'text'}
                                        width={150}
                                    />
                                ) : (
                                    <>
                                        {`${convertDMS(
                                            place?.latitude || 0,
                                            place?.longitude || 0
                                        )}`}{' '}
                                        <sup>
                                            <Link
                                                color={'inherit'}
                                                target={'_blank'}
                                                href={`https://yandex.ru/maps/?pt=${place?.longitude},${place?.latitude}&spn=0.1,0.1&l=sat,skl&z=14`}
                                            >
                                                {'Я'}
                                            </Link>{' '}
                                            <Link
                                                target={'_blank'}
                                                color={'inherit'}
                                                href={`https://maps.google.com/maps?ll=${place?.latitude},${place?.longitude}&q=${place?.latitude},${place?.longitude}&spn=0.1,0.1&amp;t=h&amp;hl=ru`}
                                            >
                                                {'G'}
                                            </Link>
                                        </sup>
                                    </>
                                )
                            }
                        />
                        <StatisticLine
                            icon={<AccessTimeOutlined color={'disabled'} />}
                            title={'Изменено:'}
                            text={
                                loading ? (
                                    <Skeleton
                                        variant={'text'}
                                        width={150}
                                    />
                                ) : (
                                    formatDate(place?.updated?.date)
                                )
                            }
                        />
                        <StatisticLine
                            icon={<StarBorderOutlined color={'disabled'} />}
                            title={'Рейтнг:'}
                            text={
                                loading ? (
                                    <Skeleton
                                        variant={'text'}
                                        width={150}
                                    />
                                ) : (
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
                                                place?.rating &&
                                                place.rating > 0 &&
                                                !newRating?.rating
                                                    ? place?.rating
                                                    : newRating?.rating ?? 0
                                            }
                                            // precision={0.5}
                                            disabled={setRatingLoading}
                                            readOnly={
                                                !place?.actions?.rating ||
                                                !!newRating?.rating
                                            }
                                            onChange={(_, value) => {
                                                setRating({
                                                    place: place?.id!,
                                                    score: value || 5
                                                })
                                            }}
                                        />
                                        {ratingCount && (
                                            <Box
                                                sx={{ ml: 1 }}
                                            >{`(${ratingCount})`}</Box>
                                        )}
                                    </Box>
                                )
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
                            {loading ? (
                                <Skeleton
                                    variant={'rounded'}
                                    height={'100%'}
                                />
                            ) : (
                                <InteractiveMap
                                    center={
                                        place?.latitude && place?.longitude
                                            ? [place.latitude, place.longitude]
                                            : [52.580517, 56.855385]
                                    }
                                    zoom={15}
                                >
                                    {/*@ts-ignore*/}
                                    {({ TileLayer }) => (
                                        <>
                                            {place?.latitude &&
                                                place?.longitude &&
                                                place?.category && (
                                                    <MarkerPoint
                                                        place={{
                                                            category:
                                                                place.category
                                                                    .name,
                                                            latitude:
                                                                place.latitude,
                                                            longitude:
                                                                place.longitude
                                                        }}
                                                    />
                                                )}
                                        </>
                                    )}
                                </InteractiveMap>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    )
}

export default PlaceInformation
