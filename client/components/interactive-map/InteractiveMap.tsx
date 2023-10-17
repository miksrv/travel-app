'use client'

import * as ReactLeaflet from 'react-leaflet'
import Leaflet, {
    LatLngBounds,
    LatLngExpression,
    Map,
    MapOptions
} from 'leaflet'
import 'leaflet/dist/leaflet.css'
import isEqual from 'lodash-es/isEqual'
import React, { useEffect, useRef, useState } from 'react'
import { useMapEvents } from 'react-leaflet'

import { Photo, Place } from '@/api/types/Poi'

import MarkerPoint from '@/components/interactive-map/MarkerPoint'
import MarkerUser from '@/components/interactive-map/MarkerUser'

import styles from './styles.module.sass'

type MapProps = {
    children: any
    places?: Place[]
    photos?: Photo[]
    storeMapPosition?: boolean
    userLatLng?: LatLngExpression
    onChangePosition?: (bounds: LatLngBounds, zoom: number) => void
} & MapOptions

const InteractiveMap: React.FC<MapProps> = ({
    children,
    places,
    photos,
    storeMapPosition,
    userLatLng,
    onChangePosition,
    ...props
}) => {
    const [center, setCenter] = useState<LatLngExpression>()
    const mapRef = useRef<Map | any>()

    // const handleUserPosition = () => {
    //     if (myCoordinates?.latitude && myCoordinates?.longitude) {
    //         setMapCenter([myCoordinates.latitude, myCoordinates.longitude])
    //     }
    // }

    useEffect(() => {
        if (!isEqual(center, props.center) && props.center) {
            setCenter(props.center)
            mapRef.current?.setView(props.center, mapRef?.current.getZoom())
        }
    }, [props.center, center])

    return (
        <div className={styles.mapContainer}>
            <ReactLeaflet.MapContainer
                {...props}
                style={{ height: '100%', width: '100%' }}
                attributionControl={false}
                ref={mapRef}
            >
                {/*<ReactLeaflet.TileLayer*/}
                {/*    url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'*/}
                {/*/>*/}
                <ReactLeaflet.TileLayer
                    url={`https://api.mapbox.com/styles/v1/miksoft/cli4uhd5b00bp01r6eocm21rq/tiles/256/{z}/{x}/{y}@2x?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`}
                />
                {places?.map((place) => (
                    <MarkerPoint
                        key={place.id}
                        place={place}
                    />
                ))}
                {userLatLng && (
                    <>
                        {/*<div className='leaflet-control'>*/}
                        {/*    <Button*/}
                        {/*        variant={'contained'}*/}
                        {/*        size={'small'}*/}
                        {/*        sx={{*/}
                        {/*            left: '10px',*/}
                        {/*            minWidth: '26px',*/}
                        {/*            mt: 9,*/}
                        {/*            width: '26px'*/}
                        {/*        }}*/}
                        {/*        color={'primary'}*/}
                        {/*        onClick={handleUserPosition}*/}
                        {/*    >*/}
                        {/*        <AccountCircleOutlined fontSize={'small'} />*/}
                        {/*    </Button>*/}
                        {/*</div>*/}
                        <MarkerUser latLng={userLatLng} />
                    </>
                )}
                {children(ReactLeaflet, Leaflet)}
                {onChangePosition && (
                    <MapEvents onChangeBounds={onChangePosition} />
                )}
            </ReactLeaflet.MapContainer>
        </div>
    )
}

type MapEventsProps = {
    onChangeBounds?: (bounds: LatLngBounds, zoom: number) => void
}

const MapEvents: React.FC<MapEventsProps> = ({ onChangeBounds }) => {
    const mapEvents = useMapEvents({
        mousedown: () => {
            mapEvents.closePopup()
        },
        moveend: () => {
            onChangeBounds?.(mapEvents.getBounds(), mapEvents.getZoom())
        }
    })

    useEffect(() => {
        onChangeBounds?.(mapEvents.getBounds(), mapEvents.getZoom())
    })

    return null
}

export default InteractiveMap
