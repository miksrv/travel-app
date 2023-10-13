import { Button, Pagination } from '@mui/material'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import { NextPage } from 'next'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/dist/client/router'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import React, { useState } from 'react'
import useGeolocation from 'react-hook-geolocation'
import Lightbox from 'react-image-lightbox'
import Gallery from 'react-photo-gallery'

import { API, ImageHost } from '@/api/api'
import { ApiTypes, Place } from '@/api/types'

import Avatar from '@/components/avatar'
import Breadcrumbs from '@/components/breadcrumbs'
import PageLayout from '@/components/page-layout'
import PlacesFilterPanel from '@/components/places-filter-panel'

import { encodeQueryData, formatDate } from '@/functions/helpers'

const POST_PER_PAGE = 9

const PhotosPage: NextPage = () => {
    const { t } = useTranslation('common', { keyPrefix: 'page.photos' })

    const searchParams = useSearchParams()
    const geolocation = useGeolocation()
    const router = useRouter()

    const [page, setPage] = useState<number>(1)
    const [sort, setSort] = useState<ApiTypes.SortFields>(
        ApiTypes.SortFields.Updated
    )
    const [order, setOrder] = useState<ApiTypes.SortOrder>(
        ApiTypes.SortOrder.DESC
    )
    const [category, setCategory] = useState<Place.Category>()
    const [location, setLocation] = useState<ApiTypes.PlaceLocationType>()

    const [showLightbox, setShowLightbox] = useState<boolean>(false)
    const [photoIndex, setCurrentIndex] = useState<number>(0)

    const imageUrl = (index: number) =>
        `${ImageHost}photo/${data?.items?.[index]?.placeId}/${data?.items?.[index]?.filename}.${data?.items?.[index]?.extension}`

    const thumbImageUrl = (index: number) =>
        `${ImageHost}photo/${data?.items?.[index]?.placeId}/${data?.items?.[index]?.filename}_thumb.${data?.items?.[index]?.extension}`

    const [introduce] = API.useIntroduceMutation()
    const { data, isLoading } = API.usePhotosGetListQuery({
        category: category?.name,
        city:
            location?.type === ApiTypes.LocationType.City
                ? location.value
                : undefined,
        country:
            location?.type === ApiTypes.LocationType.Country
                ? location.value
                : undefined,
        district:
            location?.type === ApiTypes.LocationType.District
                ? location.value
                : undefined,
        limit: POST_PER_PAGE,
        offset: ((Number(page) || 1) - 1) * POST_PER_PAGE,
        order: order,
        region:
            location?.type === ApiTypes.LocationType.Region
                ? location.value
                : undefined,
        sort: sort
    })

    // useEffect(() => {
    //     if (pageUrl) {
    //         setPage(Number(pageUrl))
    //     }
    //
    //     if (sortUrl) {
    //         setSort(sortUrl as API.SortFields)
    //     }
    //
    //     if (orderUrl) {
    //         setOrder(orderUrl as API.SortOrder)
    //     }
    // })

    useEffect(() => {
        const urlParams = {
            order: order !== ApiTypes.SortOrder.DESC ? order : undefined,
            page: page !== 1 ? page : undefined,
            sort: sort !== ApiTypes.SortFields.Updated ? sort : undefined
        }

        router.push(`photos${encodeQueryData(urlParams)}`, undefined, {
            shallow: true
        })
    }, [page, sort, order])

    useEffect(() => {
        if (geolocation?.latitude && geolocation?.longitude) {
            introduce({ lat: geolocation.latitude, lon: geolocation.longitude })
        }
    }, [geolocation.latitude, geolocation.longitude])

    return (
        <PageLayout maxWidth={'lg'}>
            <Card sx={{ mb: 2 }}>
                <CardHeader
                    title={t('title', 'Фотографии интересных мест')}
                    titleTypographyProps={{ component: 'h1' }}
                    subheader={
                        <Breadcrumbs
                            currentPage={'Фотографии интересных мест'}
                        />
                    }
                    sx={{ mb: -0.5, mt: -0.5 }}
                    action={
                        <Button
                            sx={{ mr: 1, mt: 1.5 }}
                            size={'medium'}
                            variant={'contained'}
                        >
                            Добавить
                        </Button>
                    }
                />
            </Card>
            <Card sx={{ mb: 2 }}>
                <CardContent sx={{ mb: -2, mt: -2 }}>
                    <PlacesFilterPanel
                        sort={sort}
                        order={order}
                        location={location}
                        category={category}
                        onChangeSort={setSort}
                        onChangeOrder={setOrder}
                        onChangeLocation={async (location) => {
                            setPage(1)
                            setLocation(location)
                        }}
                        onChangeCategory={(category) => {
                            setPage(1)
                            setCategory(category)
                        }}
                    />
                </CardContent>
            </Card>

            {data?.items?.length ? (
                <Gallery
                    photos={data.items.map((photo) => ({
                        height: photo.height,
                        src: `${ImageHost}photo/${photo.placeId}/${photo.filename}_thumb.${photo.extension}`,
                        width: photo.width
                    }))}
                    onClick={(event, photos) => {
                        setCurrentIndex(photos.index)
                        setShowLightbox(true)
                    }}
                />
            ) : (
                <div>{'Нет фотографий'}</div>
            )}

            <Pagination
                sx={{ mt: 2 }}
                shape={'rounded'}
                page={page}
                hidden={!data?.count}
                count={Math.ceil((data?.count || 0) / POST_PER_PAGE)}
                onChange={(_, page) => setPage(page)}
            />

            {showLightbox && (
                <Lightbox
                    mainSrc={imageUrl(photoIndex)}
                    nextSrc={imageUrl(
                        (photoIndex + 1) % (data?.items?.length || 0)
                    )}
                    prevSrc={imageUrl(
                        (photoIndex + (data?.items?.length || 0) - 1) %
                            (data?.items?.length || 0)
                    )}
                    mainSrcThumbnail={thumbImageUrl(photoIndex)}
                    prevSrcThumbnail={thumbImageUrl(
                        (photoIndex + (data?.items?.length || 0) - 1) %
                            (data?.items?.length || 0)
                    )}
                    nextSrcThumbnail={thumbImageUrl(
                        (photoIndex + 1) % (data?.items?.length || 0)
                    )}
                    imageTitle={data?.items?.[photoIndex]?.title || ''}
                    imageCaption={
                        <Avatar
                            size={'medium'}
                            userName={data?.items?.[photoIndex]?.author?.name}
                            image={data?.items?.[photoIndex]?.author?.avatar}
                            text={formatDate(
                                data?.items?.[photoIndex]?.created?.date
                            )}
                        />
                    }
                    onCloseRequest={() => setShowLightbox(false)}
                    onMovePrevRequest={() =>
                        setCurrentIndex(
                            (photoIndex + (data?.items?.length || 0) - 1) %
                                (data?.items?.length || 0)
                        )
                    }
                    onMoveNextRequest={() =>
                        setCurrentIndex(
                            (photoIndex + 1) % (data?.items?.length || 0)
                        )
                    }
                />
            )}
        </PageLayout>
    )
}

export default PhotosPage
