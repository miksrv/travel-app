import {
    AccessTimeOutlined,
    AccountCircleOutlined,
    BookmarkBorderOutlined,
    FlagOutlined,
    PlaceOutlined,
    RemoveRedEyeOutlined,
    StarBorderOutlined,
    StraightenOutlined
} from '@mui/icons-material'
import { Avatar, AvatarGroup } from '@mui/material'
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

import { ImageHost } from '@/api/api'
import { API } from '@/api/api'
import { Place } from '@/api/types/Place'

import StatisticLine from '@/components/statistic-line'
import UserAvatar from '@/components/user-avatar'

import { categoryImage } from '@/functions/categories'
import { convertDMS, formatDate } from '@/functions/helpers'

const InteractiveMap = dynamic(() => import('@/components/interactive-map'), {
    ssr: false
})

interface PlaceInformationProps {
    place?: Place
    ratingCount?: number
    loading?: boolean
}

const PlaceInformation: React.FC<PlaceInformationProps> = (props) => {
    const { place, ratingCount, loading } = props

    const [setRating, { data: newRating, isLoading: setRatingLoading }] =
        API.useRatingPutScoreMutation()

    const { data: visitedUsersData, isLoading: visitedUsersLoading } =
        API.useVisitedGetUsersListQuery(place?.id!, { skip: !place?.id })

    const [setVisited, { isLoading: visitedPutLoading }] =
        API.useVisitedPutPlaceMutation()

    const handlePutPlaceVisited = () => {
        setVisited({ place: place?.id! })
    }

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
                            content={
                                <Stack
                                    direction={'row'}
                                    spacing={2}
                                >
                                    {loading ? (
                                        <>
                                            <Skeleton
                                                variant={'rectangular'}
                                                width={20}
                                                height={20}
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
                                                    marginRight: '8px'
                                                }}
                                                src={
                                                    categoryImage(
                                                        place?.category?.name
                                                    ).src
                                                }
                                                alt={
                                                    place?.category?.title || ''
                                                }
                                                width={18}
                                                height={20}
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
                            content={
                                <UserAvatar
                                    user={place?.author}
                                    loading={loading}
                                />
                            }
                        />
                        <StatisticLine
                            icon={<RemoveRedEyeOutlined color={'disabled'} />}
                            title={'Просмотров:'}
                            content={
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
                        {place?.distance && (
                            <StatisticLine
                                icon={<StraightenOutlined color={'disabled'} />}
                                title={'Как далеко:'}
                                content={
                                    loading ? (
                                        <Skeleton
                                            variant={'text'}
                                            width={60}
                                        />
                                    ) : (
                                        `${place?.distance} км`
                                    )
                                }
                            />
                        )}
                        <StatisticLine
                            icon={<PlaceOutlined color={'disabled'} />}
                            title={'Координаты:'}
                            content={
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
                            content={
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
                            icon={<FlagOutlined color={'disabled'} />}
                            title={'Были тут:'}
                            content={
                                loading ? (
                                    <Skeleton
                                        variant={'text'}
                                        width={150}
                                    />
                                ) : (
                                    <>
                                        <AvatarGroup
                                            max={4}
                                            componentsProps={{
                                                additionalAvatar: {
                                                    sx: {
                                                        fontSize: '10px',
                                                        height: 20,
                                                        width: 20
                                                    }
                                                }
                                            }}
                                        >
                                            {visitedUsersData?.items?.map(
                                                (user) => (
                                                    <Avatar
                                                        key={user.id}
                                                        alt={user.name}
                                                        src={`${ImageHost}avatar/${user.avatar}`}
                                                        sx={{
                                                            height: 20,
                                                            width: 20
                                                        }}
                                                    />
                                                )
                                            )}
                                        </AvatarGroup>
                                    </>
                                )
                            }
                        />
                        <StatisticLine
                            icon={<StarBorderOutlined color={'disabled'} />}
                            title={'Рейтнг:'}
                            last={true}
                            content={
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
                            {loading ||
                            (!place?.latitude && !place?.longitude) ? (
                                <Skeleton
                                    variant={'rounded'}
                                    height={'100%'}
                                />
                            ) : (
                                <InteractiveMap
                                    zoom={15}
                                    center={[place.latitude, place.longitude]}
                                    scrollWheelZoom={false}
                                    places={[
                                        {
                                            category: place.category?.name!,
                                            latitude: place.latitude,
                                            longitude: place.longitude
                                        }
                                    ]}
                                />
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    )
}

export default PlaceInformation
