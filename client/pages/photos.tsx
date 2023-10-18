import { Button, Pagination } from '@mui/material'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import { LatLngBounds } from 'leaflet'
import debounce from 'lodash-es/debounce'
import { NextPage } from 'next'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/dist/client/router'
import dynamic from 'next/dynamic'
import { useCallback, useEffect } from 'react'
import React, { useState } from 'react'
import Lightbox from 'react-image-lightbox'
import Gallery from 'react-photo-gallery'

import { API, ImageHost } from '@/api/api'

import Breadcrumbs from '@/components/breadcrumbs'
import PageLayout from '@/components/page-layout'
import UserAvatar from '@/components/user-avatar'

import { encodeQueryData, formatDate } from '@/functions/helpers'

const PHOTOS_PER_PAGE = 30

const InteractiveMap = dynamic(() => import('@/components/interactive-map'), {
    ssr: false
})

const PhotosPage: NextPage = () => {
    const { t } = useTranslation('common', { keyPrefix: 'page.photos' })

    const router = useRouter()

    const [page, setPage] = useState<number>(1)
    const [mapBounds, setMapBounds] = useState<string>()
    const [showLightbox, setShowLightbox] = useState<boolean>(false)
    const [photoIndex, setCurrentIndex] = useState<number>(0)

    const imageUrl = (index: number) =>
        `${ImageHost}photo/${data?.items?.[index]?.placeId}/${data?.items?.[index]?.filename}.${data?.items?.[index]?.extension}`

    const thumbImageUrl = (index: number) =>
        `${ImageHost}photo/${data?.items?.[index]?.placeId}/${data?.items?.[index]?.filename}_thumb.${data?.items?.[index]?.extension}`

    const { data } = API.usePhotosGetListQuery({
        limit: PHOTOS_PER_PAGE,
        offset: ((Number(page) || 1) - 1) * PHOTOS_PER_PAGE
    })

    const { data: poiListData } = API.usePoiGetPhotoListQuery(
        {
            bounds: mapBounds
        },
        { skip: !mapBounds }
    )

    const debounceSetMapBounds = useCallback(
        debounce((bounds: LatLngBounds, zoom?: number) => {
            setMapBounds(bounds.toBBoxString())
        }, 500),
        []
    )

    useEffect(() => {
        const urlParams = {
            page: page !== 1 ? page : undefined
        }

        router.push(`photos${encodeQueryData(urlParams)}`, undefined, {
            shallow: true
        })
    }, [page])

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
                    sx={{ mb: -1, mt: -1 }}
                    action={
                        <Button
                            sx={{ mr: 1, mt: 1.4 }}
                            size={'medium'}
                            variant={'contained'}
                        >
                            Загрузить
                        </Button>
                    }
                />
            </Card>

            <Card sx={{ height: '200px', mt: 2 }}>
                <InteractiveMap
                    storeMapPosition={true}
                    photos={poiListData?.items}
                    onChangeBounds={debounceSetMapBounds}
                />
            </Card>

            {data?.items?.length ? (
                <Card sx={{ mb: 2, mt: 2 }}>
                    <CardContent sx={{ mb: -1 }}>
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
                    </CardContent>
                </Card>
            ) : (
                <div>{'Нет фотографий'}</div>
            )}

            <Pagination
                sx={{ mt: 2 }}
                shape={'rounded'}
                page={page}
                hidden={!data?.count}
                count={Math.ceil((data?.count || 0) / PHOTOS_PER_PAGE)}
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
                        <UserAvatar
                            size={'medium'}
                            user={data?.items?.[photoIndex]?.author}
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
