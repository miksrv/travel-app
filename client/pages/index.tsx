import { useIntroduceMutation, usePoiGetListMutation } from '@/api/api'
import { LatLngBounds } from 'leaflet'
import debounce from 'lodash-es/debounce'
import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useState } from 'react'
import useGeolocation from 'react-hook-geolocation'

const MyAwesomeMap = dynamic(() => import('@/components/map'), { ssr: false })
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

const Page: NextPage = () => {
    const [introduce, { isLoading }] = useIntroduceMutation()
    const [getPlaces, { isLoading: placesLoading, data }] =
        usePoiGetListMutation()
    const [mapBounds, setBounds] = useState<LatLngBounds>()
    const geolocation = useGeolocation()
    const [poiList, setPoiList] = useState<any[]>([])

    const handleChangeBounds = (bounds: LatLngBounds) => {
        // left, top, right, bottom
        const boundsString = bounds.toBBoxString()

        if (boundsString !== mapBounds?.toBBoxString()) {
            setBounds(bounds)
            getPoiList(bounds)
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
        <div>
            <MyAwesomeMap
                height={300}
                width={500}
                center={
                    geolocation.longitude && geolocation.longitude
                        ? [geolocation.latitude, geolocation.longitude]
                        : DEFAULT_CENTER
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
            </MyAwesomeMap>
            <div>{(isLoading || placesLoading) && 'Загрузка...'}</div>
            <div>
                My Location: {geolocation?.latitude},{geolocation?.longitude}
            </div>
            <div>Bounds: {mapBounds?.toBBoxString()}</div>
        </div>
    )
}

export default Page
