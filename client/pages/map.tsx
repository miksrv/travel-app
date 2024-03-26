import { LatLngBounds, LatLngExpression } from 'leaflet'
import debounce from 'lodash-es/debounce'
import { GetServerSidePropsResult, NextPage } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/dist/client/router'
import dynamic from 'next/dynamic'
import React, { useCallback, useEffect, useState } from 'react'

import Container from '@/ui/container'

import { API, SITE_LINK } from '@/api/api'
import { setLocale } from '@/api/applicationSlice'
import { useAppSelector, wrapper } from '@/api/store'
import { ApiTypes } from '@/api/types'
import { Categories } from '@/api/types/Place'
import { Photo } from '@/api/types/Poi'

import AppLayout from '@/components/app-layout'
import Header from '@/components/header'
import { MapObjectsType } from '@/components/interactive-map/InteractiveMap'
import PhotoLightbox from '@/components/photo-lightbox'

import { round } from '@/functions/helpers'

const InteractiveMap = dynamic(() => import('@/components/interactive-map'), {
    ssr: false
})

interface MapPageProps {}

const MapPage: NextPage<MapPageProps> = () => {
    const { t, i18n } = useTranslation('common', { keyPrefix: 'pages.map' })

    const router = useRouter()

    const location = useAppSelector((state) => state.application.userLocation)

    const [initMapCoords, setInitMapCoords] = useState<LatLngExpression>()
    const [initMapZoom, setInitMapZoom] = useState<number>()
    // const [initMapLayer, setInitMapLayer] = useState<MapLayersType>()

    const [showLightbox, setShowLightbox] = useState<boolean>(false)
    const [currentPhoto, setCurrentPhoto] = useState<Photo>()
    const [categories, setCategories] = useState<Categories[]>()

    const [mapCategories, setMapCategories] = useState<Categories[]>()
    const [mapType, setMapType] = useState<MapObjectsType>()
    const [mapBounds, setMapBounds] = useState<string>()

    const canonicalUrl = SITE_LINK + (i18n.language === 'en' ? 'en/' : '')

    const { data: poiListData, isFetching: placesLoading } =
        API.usePoiGetListQuery(
            { bounds: mapBounds, categories: mapCategories ?? [] },
            { skip: !mapBounds || mapType !== 'Places' }
        )

    const { data: photoListData, isFetching: photosLoading } =
        API.usePoiGetPhotoListQuery(
            { bounds: mapBounds },
            { skip: !mapBounds || mapType !== 'Photos' }
        )

    const handleCloseLightbox = () => {
        setShowLightbox(false)
    }

    const handlePhotoClick = (photo: Photo) => {
        setCurrentPhoto(photo)
        setShowLightbox(true)
    }

    const debounceSetMapBounds = useCallback(
        debounce((bounds: LatLngBounds, zoom: number) => {
            const mapCenter = bounds.getCenter()
            const lat = round(mapCenter.lat, 4)
            const lon = round(mapCenter.lng, 4)

            router.replace(`/map#${lat},${lon},${zoom}`)

            setMapBounds(bounds.toBBoxString())
        }, 500),
        []
    )

    const debounceSetMapCategories = useCallback(
        debounce((categories?: Categories[]) => {
            setMapCategories(categories)
        }, 1000),
        []
    )

    const handleChangeCategories = (categories?: Categories[]) => {
        setCategories(categories)
        debounceSetMapCategories(categories)
    }

    useEffect(() => {
        const hash = window?.location?.hash ?? null

        setCategories(Object.values(Categories))
        setMapCategories(Object.values(Categories))

        if (hash) {
            const splitCords = hash.replace('#', '').split(',')
            const lat = parseFloat(splitCords[0])
            const lon = parseFloat(splitCords[1])
            const zoom = parseFloat(splitCords[2])

            if (lat && lon) {
                setInitMapCoords([lat, lon])
            }

            if (zoom && Number(zoom) >= 6 && Number(zoom) <= 18) {
                setInitMapZoom(Number(zoom))
            }
        }
    }, [])

    return (
        <AppLayout className={'mainLayout'}>
            <NextSeo
                title={t('title')}
                description={t('description')}
                canonical={`${canonicalUrl}map`}
            />

            <Header
                title={t('title')}
                currentPage={t('breadCrumbCurrent')}
                className={'mainHeader'}
                actions={
                    <>
                        {t(
                            mapType === 'Places' ? 'pointsCount' : 'photosCount'
                        )}
                        <strong style={{ marginLeft: '5px' }}>
                            {(mapType === 'Places'
                                ? poiListData?.count
                                : photoListData?.count) ?? 0}
                        </strong>
                    </>
                }
            />

            <PhotoLightbox
                photos={currentPhoto ? [currentPhoto] : []}
                photoIndex={0}
                showLightbox={showLightbox}
                onCloseLightBox={handleCloseLightbox}
            />

            <Container className={'mainContainer'}>
                <InteractiveMap
                    center={initMapCoords}
                    zoom={initMapZoom}
                    categories={categories}
                    // layer={initMapLayer}
                    storeMapPosition={true}
                    enableSearch={true}
                    enableFullScreen={true}
                    enableCoordsControl={true}
                    enableLayersSwitcher={true}
                    enableCategoryControl={mapType === 'Places'}
                    loading={placesLoading || photosLoading}
                    places={mapType === 'Places' ? poiListData?.items : []}
                    photos={mapType === 'Photos' ? photoListData?.items : []}
                    onPhotoClick={handlePhotoClick}
                    onChangeCategories={handleChangeCategories}
                    onChangeMapType={setMapType}
                    onChangeBounds={debounceSetMapBounds}
                    userLatLon={location}
                />
            </Container>
        </AppLayout>
    )
}

export const getServerSideProps = wrapper.getServerSideProps(
    (store) =>
        async (context): Promise<GetServerSidePropsResult<MapPageProps>> => {
            const locale = (context.locale ?? 'en') as ApiTypes.LocaleType

            const translations = await serverSideTranslations(locale)

            store.dispatch(setLocale(locale))

            await Promise.all(store.dispatch(API.util.getRunningQueriesThunk()))

            return {
                props: {
                    ...translations
                }
            }
        }
)

export default MapPage
