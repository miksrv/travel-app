'use client'

import * as ReactLeaflet from 'react-leaflet'
import { LatLngBounds, LatLngExpression, Map, MapOptions } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import isEqual from 'lodash-es/isEqual'
import React, { useEffect, useRef, useState } from 'react'
import { useMapEvents } from 'react-leaflet'

import Button from '@/ui/button'
import Loader from '@/ui/loader'

import { ApiTypes } from '@/api/types'
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
    lon: number
    zoom: number
}

type MapProps = {
    places?: Place[]
    photos?: Photo[]
    loading?: boolean
    storeMapPosition?: boolean
    storeMapKey?: string
    centerPoint?: boolean
    userLatLon?: ApiTypes.LatLonCoordinate
    onChangeBounds?: (bounds: LatLngBounds, zoom: number) => void
    onPhotoClick?: (photo: Photo) => void
} & MapOptions

const InteractiveMap: React.FC<MapProps> = ({
    places,
    photos,
    loading,
    storeMapPosition,
    storeMapKey,
    centerPoint,
    userLatLon,
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
        if (userLatLon?.lat && userLatLon?.lon) {
            mapRef.current?.setView(
                [userLatLon.lat, userLatLon.lon],
                DEFAULT_MAP_ZOOM
            )
        }
    }

    const handleChangeBounds = (bounds: LatLngBounds, zoom: number) => {
        const center = bounds.getCenter()
        const currentMapPosition = {
            lat: center.lat,
            lon: center.lng,
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
                coordinates?.lon &&
                coordinates?.lat &&
                coordinates?.zoom
            ) {
                mapRef.current?.setView(
                    [coordinates.lat, coordinates.lon],
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
                {userLatLon && (
                    <>
                        <div className={styles.controls}>
                            <Button
                                mode={'primary'}
                                icon={'User'}
                                onClick={handleUserPosition}
                            />
                        </div>
                        <MarkerUser coordinates={userLatLon} />
                    </>
                )}
                {loading && (
                    <div className={styles.loader}>
                        <Loader />
                    </div>
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
