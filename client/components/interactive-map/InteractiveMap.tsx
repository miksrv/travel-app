'use client'

import * as ReactLeaflet from 'react-leaflet'
import { AccountCircleOutlined } from '@mui/icons-material'
import { Button } from '@mui/material'
import {
    LatLngBounds,
    LatLngExpression,
    LatLngLiteral,
    Map,
    MapOptions
} from 'leaflet'
import 'leaflet/dist/leaflet.css'
import isEqual from 'lodash-es/isEqual'
import React, { useEffect, useRef, useState } from 'react'
import { useMapEvents } from 'react-leaflet'

import { Photo, Place } from '@/api/types/Poi'

import MarkerPhoto from '@/components/interactive-map/MarkerPhoto'
import MarkerPoint from '@/components/interactive-map/MarkerPoint'
import MarkerUser from '@/components/interactive-map/MarkerUser'

import useLocalStorage from '@/functions/hooks/useLocalStorage'

import styles from './styles.module.sass'

const DEFAULT_MAP_STORAGE_KEY = 'mapCoordinates'
const DEFAULT_MAP_ZOOM = 15
const DEFAULT_MAP_CENTER: LatLngExpression = [51.765445, 55.099745]

type mapPositionType = {
    lat: number
    lng: number
    zoom: number
}

type MapProps = {
    places?: Place[]
    photos?: Photo[]
    storeMapPosition?: boolean
    storeMapKey?: string
    centerPoint?: boolean
    userLatLng?: LatLngLiteral
    onChangeBounds?: (bounds: LatLngBounds, zoom: number) => void
    onPhotoClick?: (photo: Photo) => void
} & MapOptions

const InteractiveMap: React.FC<MapProps> = ({
    places,
    photos,
    storeMapPosition,
    storeMapKey,
    centerPoint,
    userLatLng,
    onChangeBounds,
    onPhotoClick,
    ...props
}) => {
    const [readyStorage, setReadyStorage] = useState<boolean>(false)
    const [mapPosition, setMapPosition] = useState<mapPositionType>()
    const mapRef = useRef<Map | any>()

    const [coordinates, setCoordinates] = useLocalStorage<mapPositionType>(
        storeMapKey || DEFAULT_MAP_STORAGE_KEY
    )

    const handleUserPosition = () => {
        if (userLatLng) {
            mapRef.current?.setView(
                [userLatLng.lat, userLatLng.lng],
                DEFAULT_MAP_ZOOM
            )
        }
    }

    const handleChangeBounds = (bounds: LatLngBounds, zoom: number) => {
        const center = bounds.getCenter()
        const currentMapPosition = {
            lat: center.lat,
            lng: center.lng,
            zoom
        }

        if (!isEqual(mapPosition, currentMapPosition)) {
            onChangeBounds?.(bounds, zoom)
            setMapPosition(currentMapPosition)

            if (readyStorage && storeMapPosition) {
                setCoordinates(currentMapPosition)
            }
        }
    }

    useEffect(() => {
        if (typeof coordinates !== 'undefined') {
            if (
                !readyStorage &&
                storeMapPosition &&
                coordinates?.lng &&
                coordinates?.lat &&
                coordinates?.zoom
            ) {
                mapRef.current?.setView(
                    [coordinates.lat, coordinates.lng],
                    coordinates.zoom
                )
            }

            setReadyStorage(true)
        }
    }, [readyStorage, coordinates])

    useEffect(() => {
        if (props.center || props.zoom) {
            mapRef.current?.setView(
                props.center || DEFAULT_MAP_CENTER,
                props.zoom || DEFAULT_MAP_ZOOM
            )
        }
    })

    return (
        <div className={styles.mapContainer}>
            <ReactLeaflet.MapContainer
                {...props}
                center={props.center || DEFAULT_MAP_CENTER}
                zoom={props.zoom || DEFAULT_MAP_ZOOM}
                minZoom={6}
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
                {photos?.map((photo) => (
                    <MarkerPhoto
                        key={photo.filename}
                        photo={photo}
                        onPhotoClick={onPhotoClick}
                    />
                ))}
                {userLatLng && (
                    <>
                        <div className={'leaflet-control'}>
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
                        <MarkerUser latLng={userLatLng} />
                    </>
                )}
                {onChangeBounds && (
                    <MapEvents onChangeBounds={handleChangeBounds} />
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
