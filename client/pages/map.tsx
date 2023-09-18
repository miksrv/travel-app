import Card from '@mui/material/Card'
import { LatLngBounds } from 'leaflet'
import debounce from 'lodash-es/debounce'
import { NextPage } from 'next'
import { useRouter } from 'next/dist/client/router'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import useGeolocation from 'react-hook-geolocation'

import { useIntroduceMutation, usePoiGetListMutation } from '@/api/api'

import Breadcrumbs from '@/components/breadcrumbs'
import PageLayout from '@/components/page-layout'
import PageTitle from '@/components/page-title'

const DynamicMap = dynamic(() => import('@/components/map'), { ssr: false })
const MyMapEvents = dynamic(() => import('@/components/map/MapEvents'), {
    ssr: false
})
const MyPoint = dynamic(() => import('@/components/map/MyPoint'), {
    ssr: false
})
const Point = dynamic(() => import('@/components/map/Point'), {
    ssr: false
})

const DEFAULT_CENTER = [52.580517, 56.855385]

// const MYPOINT = [42.834944, 74.586949]
// const MYPOINT = [42.877172, 74.593635] // Bishkek
export const MYPOINT = [51.765445, 55.099745] // Orenburg

const Map: NextPage = () => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [introduce, { isLoading }] = useIntroduceMutation()
    const [getPlaces, { isLoading: placesLoading, data }] =
        usePoiGetListMutation()
    const [mapBounds, setBounds] = useState<LatLngBounds>()
    const geolocation = useGeolocation()
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')
    const [poiList, setPoiList] = useState<any[]>([])

    const handleChangeBounds = async (bounds: LatLngBounds) => {
        // left, top, right, bottom
        const boundsString = bounds.toBBoxString()
        const mapCenter = bounds.getCenter()

        if (boundsString !== mapBounds?.toBBoxString()) {
            setBounds(bounds)
            await getPoiList(bounds)
        }

        if (mapCenter) {
            await router.push(
                `?lat=${mapCenter.lat}&lon=${mapCenter.lng}`,
                undefined,
                {
                    shallow: true
                }
            )
        }
    }

    const getPoiList = useCallback(
        debounce(async (bounds: LatLngBounds) => {
            await getPlaces({ bounds: bounds.toBBoxString() })
        }, 1000),
        []
    )

    const boundaryPoi = useMemo(
        () =>
            data?.items?.filter(
                // @ts-ignore
                (item) => poiList.find((p) => p.id === item.id) == null
            ) || [],
        [data?.items, poiList]
    )

    useEffect(() => {
        if (geolocation?.latitude && geolocation?.longitude) {
            introduce({ lat: geolocation.latitude, lon: geolocation.longitude })
        }
    }, [geolocation.latitude, geolocation.longitude])

    useEffect(() => {
        setPoiList([
            ...poiList.filter(
                ({ latitude, longitude }) =>
                    mapBounds !== undefined &&
                    longitude >= mapBounds.getWest() &&
                    latitude <= mapBounds.getNorth() &&
                    longitude <= mapBounds.getEast() &&
                    latitude >= mapBounds.getSouth()
            ),
            ...boundaryPoi
        ])
    }, [data, mapBounds])

    return (
        <PageLayout>
            <PageTitle title={'Карта интересных мест'} />
            <Breadcrumbs currentPage={'Карта интересных мест'} />
            <Card sx={{ height: '80vh', mt: 3 }}>
                <DynamicMap
                    center={
                        !lat || !lon
                            ? geolocation.longitude && geolocation.longitude
                                ? [geolocation.latitude, geolocation.longitude]
                                : DEFAULT_CENTER
                            : [lat, lon]
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
                            {/*<TileLayer*/}
                            {/*    url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'*/}
                            {/*    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'*/}
                            {/*/>*/}
                            {geolocation.latitude && geolocation.longitude && (
                                <MyPoint
                                    lat={geolocation.latitude}
                                    lon={geolocation.longitude}
                                />
                            )}
                            {!!poiList.length &&
                                poiList.map((item) => (
                                    <Point
                                        key={item.id}
                                        id={item.id}
                                        lat={item?.latitude}
                                        lon={item?.longitude}
                                        title={item?.title}
                                        category={
                                            item?.subcategory ?? item?.category
                                        }
                                    />
                                ))}
                            <MyMapEvents onChangeBounds={handleChangeBounds} />
                        </>
                    )}
                </DynamicMap>
                {/*<div>{(isLoading || placesLoading) && 'Загрузка...'}</div>*/}
                {/*<div>*/}
                {/*    My Location: {geolocation?.latitude},{geolocation?.longitude}*/}
                {/*</div>*/}
                {/*<div>Bounds: {mapBounds?.toBBoxString()}</div>*/}
            </Card>
        </PageLayout>
    )
}

export default Map
