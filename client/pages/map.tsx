import { AccountCircleOutlined } from '@mui/icons-material'
import { Button } from '@mui/material'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import { LatLngBounds } from 'leaflet'
import debounce from 'lodash-es/debounce'
import { NextPage } from 'next'
import { useRouter } from 'next/dist/client/router'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import useGeolocation from 'react-hook-geolocation'

import { API } from '@/api/api'

import Breadcrumbs from '@/components/breadcrumbs'
import PageLayout from '@/components/page-layout'

import { round } from '@/functions/helpers'

const DynamicMap = dynamic(() => import('@/components/map'), { ssr: false })
const MyMapEvents = dynamic(() => import('@/components/map/MapEvents'), {
    ssr: false
})
const MyPoint = dynamic(() => import('@/components/map/MyPoint'), {
    ssr: false
})
const MarkerPoint = dynamic(() => import('@/components/map/MarkerPoint'), {
    ssr: false
})

const DEFAULT_CENTER = [52.580517, 56.855385]

// const MYPOINT = [42.834944, 74.586949]
// const MYPOINT = [42.877172, 74.593635] // Bishkek
export const MYPOINT = [51.765445, 55.099745] // Orenburg

export type LatLngCoordinate = {
    latitude: number
    longitude: number
}

const MapPage: NextPage = () => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const geolocation = useGeolocation()

    const [myCoordinates, setMyCoordinates] = useState<LatLngCoordinate>()
    const [mapCenter, setMapCenter] = useState<number[]>(MYPOINT)
    const [mapBounds, setMapBounds] = useState<string>()

    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')

    const [introduce] = API.useIntroduceMutation()
    const { data: poiList } = API.usePoiGetListQuery(
        { bounds: mapBounds },
        { skip: !mapBounds }
    )

    const handleChangeBounds = async (bounds: LatLngBounds) => {
        // left, top, right, bottom
        const boundsString = bounds.toBBoxString()
        const mapCenter = bounds.getCenter()

        if (boundsString !== mapBounds) {
            debounceSetMapBounds(boundsString)
        }

        // if (mapCenter) {
        //     await router.push(
        //         `?lat=${mapCenter.lat}&lon=${mapCenter.lng}`,
        //         undefined,
        //         {
        //             shallow: true
        //         }
        //     )
        // }
    }

    const debounceSetMapBounds = useCallback(
        debounce((bounds: string) => {
            setMapBounds(bounds)
        }, 500),
        []
    )

    const handleUserPosition = () => {
        if (myCoordinates?.latitude && myCoordinates?.longitude) {
            setMapCenter([myCoordinates.latitude, myCoordinates.longitude])
        }
    }

    useEffect(() => {
        const updateLatitude = round(geolocation?.latitude)
        const updateLongitude = round(geolocation?.longitude)

        if (
            updateLatitude &&
            updateLongitude &&
            updateLatitude !== myCoordinates?.latitude &&
            updateLongitude !== myCoordinates?.longitude
        ) {
            setMyCoordinates({
                latitude: updateLatitude,
                longitude: updateLongitude
            })

            introduce({ lat: updateLatitude, lon: updateLongitude })
        }
    }, [geolocation.latitude, geolocation.longitude])

    return (
        <PageLayout>
            <Card sx={{ mb: 2 }}>
                <CardHeader
                    title={'Карта интересных мест'}
                    titleTypographyProps={{ component: 'h1' }}
                    subheader={
                        <Breadcrumbs currentPage={'Карта интересных мест'} />
                    }
                    sx={{ mb: -1, mt: -1 }}
                    action={
                        <Button
                            sx={{ mr: 1, mt: 1.4 }}
                            size={'medium'}
                            variant={'contained'}
                        >
                            Добавить
                        </Button>
                    }
                />
            </Card>

            <Card sx={{ height: '80vh', mt: 3 }}>
                <DynamicMap
                    // center={
                    //     !lat || !lon
                    //         ? myCoordinates?.latitude && myCoordinates.longitude
                    //             ? [
                    //                   myCoordinates.latitude,
                    //                   myCoordinates.longitude
                    //               ]
                    //             : DEFAULT_CENTER
                    //         : [lat, lon]
                    // }
                    center={mapCenter}
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
                            {poiList?.items?.map((place) => (
                                <MarkerPoint
                                    key={place.id}
                                    place={place}
                                />
                            ))}
                            <div className='leaflet-control'>
                                <Button
                                    variant={'contained'}
                                    size={'small'}
                                    sx={{
                                        left: '10px',
                                        minWidth: '26px',
                                        mt: 9,
                                        width: '26px'
                                    }}
                                    color={'primary'}
                                    onClick={handleUserPosition}
                                >
                                    <AccountCircleOutlined fontSize={'small'} />
                                </Button>
                            </div>
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

export default MapPage
