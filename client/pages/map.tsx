import React, { useCallback, useEffect, useState } from 'react'
import { LatLngBounds, LatLngExpression } from 'leaflet'
import debounce from 'lodash-es/debounce'
import { Container } from 'simple-react-ui-kit'

import { GetServerSidePropsResult, NextPage } from 'next'
import { useRouter } from 'next/dist/client/router'
import dynamic from 'next/dynamic'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'

import { API, ApiModel, ApiType, SITE_LINK, useAppDispatch, useAppSelector } from '@/api'
import { openAuthDialog, setLocale } from '@/api/applicationSlice'
import { wrapper } from '@/api/store'
import { AppLayout, Header, MapObjectsTypeEnum, PhotoLightbox } from '@/components/common'
import { round } from '@/functions/helpers'

const InteractiveMap = dynamic(() => import('@/components/common/interactive-map/InteractiveMap'), {
    ssr: false
})

// Experiment to enable/disable POI clusterization on the map
const ENABLE_POI_CLUSTERIZATION = false

const MapPage: NextPage<object> = () => {
    const { t, i18n } = useTranslation()

    const router = useRouter()
    const dispatch = useAppDispatch()

    const location = useAppSelector((state) => state.application.userLocation)
    const isAuth = useAppSelector((state) => state.auth.isAuth)

    const [initMapCoords, setInitMapCoords] = useState<LatLngExpression>()
    const [initMapZoom, setInitMapZoom] = useState<number>()
    // const [initMapLayer, setInitMapLayer] = useState<MapLayersType>()

    const [showLightbox, setShowLightbox] = useState<boolean>(false)
    const [photoIndex, setPhotoIndex] = useState<number>()
    const [photoLightbox, setPhotoLightbox] = useState<ApiModel.PhotoMark[]>()
    // TODO: Categories and categories? Please refactoring this
    const [categories, setCategories] = useState<ApiModel.Categories[]>()
    const [mapCategories, setMapCategories] = useState<ApiModel.Categories[]>()
    const [mapType, setMapType] = useState<MapObjectsTypeEnum>()
    const [mapBounds, setMapBounds] = useState<string>()
    const [mapZoom, setMapZoom] = useState<number>()

    const canonicalUrl = SITE_LINK + (i18n.language === 'en' ? 'en/' : '')

    const { data: poiListData, isFetching: placesLoading } = API.usePoiGetListQuery(
        {
            bounds: ENABLE_POI_CLUSTERIZATION ? mapBounds : undefined,
            cluster: ENABLE_POI_CLUSTERIZATION,
            categories: mapCategories ?? [],
            zoom: ENABLE_POI_CLUSTERIZATION ? mapZoom : undefined
        },
        { skip: (ENABLE_POI_CLUSTERIZATION && !mapBounds) || mapType !== 'Places' }
    )

    const { data: photoListData, isFetching: photosLoading } = API.usePoiGetPhotoListQuery(
        { bounds: mapBounds, zoom: mapZoom, cluster: true },
        { skip: !mapBounds || mapType !== 'Photos' }
    )

    const handleCloseLightbox = () => {
        setShowLightbox(false)
    }

    const handlePhotoClick = (photos: ApiModel.PhotoMark[], index?: number) => {
        setPhotoLightbox(photos)
        setPhotoIndex(index ?? 0)
        setShowLightbox(true)
    }

    const updateUrlCoordinates = async (lat?: number, lon?: number, zoom?: number) => {
        const url = new URL(window.location.href)
        const hash = url.hash

        if (!lat || !lon) {
            return
        }

        const match = hash.match(/#([\d.]+),([\d.]+),(\d+)/)

        if (match) {
            url.hash = hash.replace(/#[^?]*/, `#${lat},${lon},${zoom}`)
        } else {
            url.hash = `#${lat},${lon},${zoom}`
        }

        await router.replace(url.toString())
    }

    const debounceSetMapBounds = useCallback(
        debounce(async (bounds: LatLngBounds, zoom: number) => {
            const mapCenter = bounds.getCenter()
            const lat = round(mapCenter.lat, 4)
            const lon = round(mapCenter.lng, 4)

            await updateUrlCoordinates(lat, lon, zoom)

            setMapBounds(bounds.toBBoxString())
            setMapZoom(zoom)
        }, 500),
        []
    )

    const debounceSetMapCategories = useCallback(
        debounce((categories?: ApiModel.Categories[]) => {
            setMapCategories(categories)
        }, 1000),
        []
    )

    const handleCreatePlace = async () => {
        if (isAuth) {
            await router.push('/places/create')
        } else {
            dispatch(openAuthDialog())
        }
    }

    const handleChangeCategories = (categories?: ApiModel.Categories[]) => {
        setCategories(categories)
        debounceSetMapCategories(categories)
    }

    useEffect(() => {
        const hash = window.location.hash ?? null

        setCategories(Object.values(ApiModel.Categories))
        setMapCategories(Object.values(ApiModel.Categories))

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
                title={t('map-of-geotags')}
                description={t('geotags-map-description')}
                canonical={`${canonicalUrl}map`}
                openGraph={{
                    description: t('geotags-map-description'),
                    images: [
                        {
                            height: 1305,
                            url: '/images/pages/map.jpg',
                            width: 1730
                        }
                    ],
                    locale: i18n.language === 'ru' ? 'ru_RU' : 'en_US',
                    siteName: t('geotags'),
                    title: t('map-of-geotags'),
                    type: 'website',
                    url: `${canonicalUrl}map`
                }}
            />

            <Header
                title={t('map-of-geotags')}
                homePageTitle={t('geotags')}
                currentPage={t('map-of-geotags')}
                className={'mainHeader'}
                actions={
                    <>
                        {t(mapType === 'Places' ? 'points-on-map' : 'photos-on-map')}
                        <strong style={{ marginLeft: '5px' }}>
                            {(mapType === 'Places' ? poiListData?.count : photoListData?.count) ?? 0}
                        </strong>
                    </>
                }
            />

            <PhotoLightbox
                photos={photoLightbox}
                photoIndex={photoIndex}
                showLightbox={showLightbox}
                onCloseLightBox={handleCloseLightbox}
            />

            <Container
                style={{ marginTop: 15 }}
                className={'mainContainer'}
            >
                <InteractiveMap
                    center={initMapCoords}
                    zoom={initMapZoom}
                    categories={categories}
                    // layer={initMapLayer}
                    storeMapPosition={true}
                    enableCenterPopup={true}
                    enableSearch={true}
                    enableFullScreen={true}
                    enableCoordsControl={true}
                    enableLayersSwitcher={true}
                    enableContextMenu={true}
                    enableCategoryControl={mapType === 'Places'}
                    loading={placesLoading || photosLoading}
                    places={mapType === 'Places' ? poiListData?.items : []}
                    photos={mapType === 'Photos' ? photoListData?.items : []}
                    onPhotoClick={handlePhotoClick}
                    onChangeCategories={handleChangeCategories}
                    onClickCreatePlace={handleCreatePlace}
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
        async (context): Promise<GetServerSidePropsResult<object>> => {
            const locale = (context.locale ?? 'en') as ApiType.Locale
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
