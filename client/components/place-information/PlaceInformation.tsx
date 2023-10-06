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
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Unstable_Grid2'
import dayjs from 'dayjs'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { API } from '@/api/api'
import { Place } from '@/api/types/Place'

import Avatar from '@/components/avatar'

import { categoryImage } from '@/functions/categories'
import { convertDMS } from '@/functions/helpers'

const DynamicMap = dynamic(() => import('@/components/map'), { ssr: false })
const Point = dynamic(() => import('@/components/map/Point'), {
    ssr: false
})

interface PlaceInformationProps {
    place?: Place
    ratingCount?: number
}

const PlaceInformation: React.FC<PlaceInformationProps> = ({
    place,
    ratingCount
}) => {
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
                                place?.category?.name ? (
                                    <Stack
                                        direction={'row'}
                                        spacing={2}
                                    >
                                        <Image
                                            style={{
                                                height: '18px',
                                                marginRight: '4px',
                                                marginTop: '2px',
                                                objectFit: 'cover',
                                                width: '18px'
                                            }}
                                            src={
                                                categoryImage(
                                                    place.category?.name
                                                ).src
                                            }
                                            alt={place?.category?.title}
                                            width={22}
                                            height={26}
                                        />
                                        {place?.category?.title}
                                    </Stack>
                                ) : (
                                    '-'
                                )
                            }
                        />
                        <StatisticLine
                            icon={<AccountCircleOutlined color={'disabled'} />}
                            title={'Автор:'}
                            text={
                                <Avatar
                                    userName={place?.author?.name}
                                    image={place?.author?.avatar}
                                />
                            }
                        />
                        <StatisticLine
                            icon={<RemoveRedEyeOutlined color={'disabled'} />}
                            title={'Просмотров:'}
                            text={place?.views || 0}
                        />
                        <StatisticLine
                            icon={<StraightenOutlined color={'disabled'} />}
                            title={'Расстояние:'}
                            text={`${place?.distance || 0} км`}
                        />
                        <StatisticLine
                            icon={<PlaceOutlined color={'disabled'} />}
                            title={'Координаты:'}
                            text={
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
                            }
                        />
                        <StatisticLine
                            icon={<AccessTimeOutlined color={'disabled'} />}
                            title={'Изменено:'}
                            text={dayjs(place?.updated?.date).format(
                                'D MMMM YYYY, HH:mm'
                            )}
                        />
                        <StatisticLine
                            icon={<StarBorderOutlined color={'disabled'} />}
                            title={'Рейтнг:'}
                            text={
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
                            <DynamicMap
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
                                        <TileLayer
                                            url={
                                                'https://api.mapbox.com/styles/v1/miksoft/cli4uhd5b00bp01r6eocm21rq/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoibWlrc29mdCIsImEiOiJjbGFtY3d6dDkwZjA5M3lvYmxyY2kwYm5uIn0.j_wTLxCCsqAn9TJSHMvaJg'
                                            }
                                            attribution='Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>'
                                        />
                                        {place?.latitude &&
                                            place?.longitude && (
                                                <Point
                                                    lat={place.latitude}
                                                    lon={place.longitude}
                                                    title={place?.title}
                                                    category={
                                                        place?.subcategory
                                                            ?.name ??
                                                        place?.category?.name
                                                    }
                                                />
                                            )}
                                    </>
                                )}
                            </DynamicMap>
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    )
}

export default PlaceInformation

interface StatisticLineProps {
    title: string
    icon?: React.ReactNode
    text?: React.ReactNode
}

const StatisticLine: React.FC<StatisticLineProps> = ({ icon, title, text }) => (
    <Stack
        direction={'row'}
        spacing={1}
        sx={{ mb: 0.6 }}
    >
        {icon}
        <Typography
            sx={{ color: '#818c99', width: 140 }}
            variant={'body1'}
        >
            {title}
        </Typography>
        <Typography variant={'body1'}>{text || '-'}</Typography>
    </Stack>
)
