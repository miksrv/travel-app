import { Button, Pagination } from '@mui/material'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import { LatLngBounds } from 'leaflet'
import debounce from 'lodash-es/debounce'
import { NextPage } from 'next'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/dist/client/router'
import dynamic from 'next/dynamic'
import { useCallback, useEffect } from 'react'
import React, { useState } from 'react'

import { API } from '@/api/api'
import { Photo, Poi } from '@/api/types'

import PageLayout from '@/components/page-layout'
import PhotoGallery from '@/components/photo-gallery'
import PhotoLightbox from '@/components/photo-lightbox'

import { encodeQueryData } from '@/functions/helpers'

import Breadcrumbs from '../ui/breadcrumbs'

const PHOTOS_PER_PAGE = 32
const PAGE_TITLE = 'Фотографии интересных мест'

const InteractiveMap = dynamic(() => import('@/components/interactive-map'), {
    ssr: false
})

const PhotosPage: NextPage = () => {
    const { t } = useTranslation('common', { keyPrefix: 'page.photos' })

    const router = useRouter()

    const [page, setPage] = useState<number>(1)
    const [mapBounds, setMapBounds] = useState<string>()
    const [showLightbox, setShowLightbox] = useState<boolean>(false)
    const [photoIndex, setPhotoIndex] = useState<number>()
    const [photos, setPhotos] = useState<Photo.Photo[] | Poi.Photo[]>()

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

    const handleMapPhotoClick = (photo: Poi.Photo) => {
        const index = poiListData?.items?.findIndex(
            (item) => item.filename === photo.filename
        )

        setPhotos(poiListData?.items)
        setPhotoIndex(index)
        setShowLightbox(true)
    }

    const handlePhotoClick = (index: number) => {
        setPhotos(data?.items)
        setPhotoIndex(index)
        setShowLightbox(true)
    }

    const handleCloseLightbox = () => {
        setShowLightbox(false)
    }

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
            <NextSeo title={PAGE_TITLE} />
            <Card sx={{ mb: 2 }}>
                <CardHeader
                    title={t('title', PAGE_TITLE)}
                    titleTypographyProps={{ component: 'h1' }}
                    subheader={<Breadcrumbs currentPage={PAGE_TITLE} />}
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
                    onPhotoClick={handleMapPhotoClick}
                />
            </Card>

            <Card sx={{ mb: 2, mt: 2 }}>
                <CardContent sx={{ mb: -1 }}>
                    <PhotoGallery
                        photos={data?.items}
                        onPhotoClick={handlePhotoClick}
                    />
                    <PhotoLightbox
                        photos={photos}
                        photoIndex={photoIndex}
                        showLightbox={showLightbox}
                        onChangeIndex={setPhotoIndex}
                        onCloseLightBox={handleCloseLightbox}
                    />
                </CardContent>
            </Card>

            <Pagination
                sx={{ mt: 2 }}
                shape={'rounded'}
                page={page}
                hidden={!data?.count}
                count={Math.ceil((data?.count || 0) / PHOTOS_PER_PAGE)}
                onChange={(_, page) => setPage(page)}
            />
        </PageLayout>
    )
}

export default PhotosPage
