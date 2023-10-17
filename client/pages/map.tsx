import { Button } from '@mui/material'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import { LatLngBounds } from 'leaflet'
import debounce from 'lodash-es/debounce'
import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import React, { useCallback, useEffect, useState } from 'react'
import useGeolocation from 'react-hook-geolocation'

import { API } from '@/api/api'

import Breadcrumbs from '@/components/breadcrumbs'
import PageLayout from '@/components/page-layout'

import { round } from '@/functions/helpers'
import useLocalStorage from '@/functions/hooks/useLocalStorage'

const InteractiveMap = dynamic(() => import('@/components/interactive-map'), {
    ssr: false
})

// const MYPOINT = [42.834944, 74.586949]
// const MYPOINT = [42.877172, 74.593635] // Bishkek
export const MYPOINT = [51.765445, 55.099745] // Orenburg

export type LatLngCoordinate = {
    latitude: number
    longitude: number
}

interface mapLocalStorage extends LatLngCoordinate {
    zoom: number
}

const MapPage: NextPage = () => {
    // const searchParams = useSearchParams()
    // const router = useRouter()
    const geolocation = useGeolocation()
    // const [coordinates, setCoordinates] =
    //     useLocalStorage<mapLocalStorage>('map')

    const [myCoordinates, setMyCoordinates] = useState<LatLngCoordinate>()
    const [mapCenter, setMapCenter] = useState<number[]>(MYPOINT)
    const [mapBounds, setMapBounds] = useState<string>()

    // const lat = searchParams.get('lat')
    // const lon = searchParams.get('lon')

    const [introduce] = API.useIntroduceMutation()
    const { data: poiListData } = API.usePoiGetListQuery(
        { bounds: mapBounds },
        { skip: !mapBounds }
    )

    // const handleChangeBounds = async (bounds: LatLngBounds) => {
    //     // left, top, right, bottom
    //     const boundsString = bounds.toBBoxString()
    //     const mapCenter = bounds.getCenter()
    //
    //     if (boundsString !== mapBounds) {
    //         debounceSetMapBounds(boundsString, mapCenter)
    //     }
    //
    //     // if (mapCenter) {
    //     //     await router.push(
    //     //         `?lat=${mapCenter.lat}&lon=${mapCenter.lng}`,
    //     //         undefined,
    //     //         {
    //     //             shallow: true
    //     //         }
    //     //     )
    //     // }
    // }

    const debounceSetMapBounds = useCallback(
        debounce((bounds: LatLngBounds, zoom?: number) => {
            setMapBounds(bounds.toBBoxString())

            // setCoordinates({
            //     latitude: mapCenter.lat,
            //     longitude: mapCenter.lng,
            //     zoom: 14
            // })
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

    // useEffect(() => {
    //     if (coordinates?.latitude && coordinates?.longitude) {
    //         console.log('111')
    //         setMapCenter([coordinates.latitude, coordinates.longitude])
    //     }
    // })

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

            <Card sx={{ height: '80vh', mt: 2 }}>
                <InteractiveMap
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
                    places={poiListData?.items}
                    zoom={15}
                    center={[mapCenter[0], mapCenter[1]]}
                    userLatLng={[geolocation.latitude, geolocation.longitude]}
                    onChangePosition={debounceSetMapBounds}
                />
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
