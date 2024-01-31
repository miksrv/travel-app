'use client'

import * as ReactLeaflet from 'react-leaflet'
import { LatLngBounds, LatLngExpression, Map, MapOptions } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import isEqual from 'lodash-es/isEqual'
import React, { useEffect, useRef, useState } from 'react'
import { useMapEvents } from 'react-leaflet'

import Button from '@/ui/button'
import Spinner from '@/ui/spinner'

import { ApiTypes } from '@/api/types'
import { Photo, Place } from '@/api/types/Poi'

import LayerSwitcherControl from '@/components/interactive-map/LayerSwitcherControl'
import MarkerPhoto from '@/components/interactive-map/MarkerPhoto'
import MarkerPoint from '@/components/interactive-map/MarkerPoint'
import MarkerUser from '@/components/interactive-map/MarkerUser'
import SearchControl from '@/components/interactive-map/SearchControl'

import useLocalStorage from '@/functions/hooks/useLocalStorage'

import styles from './styles.module.sass'

export type MapLayersType =
    | 'MabBox'
    | 'OSM'
    | 'GoogleSat'
    | 'GoogleMap'
    | 'MapBoxSat'

export type MapPositionType = {
    lat: number
    lon: number
    zoom: number
}

type MapProps = {
    places?: Place[]
    photos?: Photo[]
    loading?: boolean
    storeMapPosition?: boolean
    enableSearch?: boolean
    enableFullScreen?: boolean
    enableLayersSwitcher?: boolean
    storeMapKey?: string
    centerPoint?: boolean
    userLatLon?: ApiTypes.LatLonCoordinate
    onChangeBounds?: (bounds: LatLngBounds, zoom: number) => void
    onPhotoClick?: (photo: Photo) => void
} & MapOptions

const DEFAULT_MAP_STORAGE_KEY = 'mapCoordinates'
const DEFAULT_MAP_ZOOM = 15
const DEFAULT_MAP_CENTER: LatLngExpression = [51.765445, 55.099745]
const DEFAULT_MAP_LAYER: MapLayersType = 'MabBox'

const InteractiveMap: React.FC<MapProps> = ({
    places,
    photos,
    loading,
    storeMapPosition,
    enableSearch,
    enableFullScreen,
    enableLayersSwitcher,
    storeMapKey,
    centerPoint,
    userLatLon,
    onChangeBounds,
    onPhotoClick,
    ...props
}) => {
    const [readyStorage, setReadyStorage] = useState<boolean>(false)
    const [mapLayer, setMapLayer] = useState<MapLayersType>(DEFAULT_MAP_LAYER)
    const [mapPosition, setMapPosition] = useState<MapPositionType>()
    const mapRef = useRef<Map | any>()

    const [coordinates, setCoordinates] = useLocalStorage<MapPositionType>(
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

    const handleSelectSearch = (coordinates: ApiTypes.LatLonCoordinate) => {
        mapRef.current?.setView(
            [coordinates.lat, coordinates.lon],
            DEFAULT_MAP_ZOOM
        )
    }

    const handleToggleFullscreen = async () => {
        const mapElement = mapRef.current.getContainer()

        if (!document.fullscreenElement) {
            await mapElement.requestFullscreen()
        } else {
            await document.exitFullscreen()
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
                mapRef?.current?.setView(
                    [coordinates?.lat, coordinates?.lon],
                    coordinates?.zoom || DEFAULT_MAP_ZOOM
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
    }, [props.center, props.zoom])

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
                {mapLayer === 'MabBox' && (
                    <ReactLeaflet.TileLayer
                        url={`https://api.mapbox.com/styles/v1/miksoft/cli4uhd5b00bp01r6eocm21rq/tiles/256/{z}/{x}/{y}@2x?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`}
                    />
                )}
                {mapLayer === 'OSM' && (
                    <ReactLeaflet.TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
                )}
                {mapLayer === 'GoogleMap' && (
                    <ReactLeaflet.TileLayer
                        attribution={'Google Maps'}
                        url={
                            'https://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}'
                        }
                    />
                )}
                {mapLayer === 'GoogleSat' && (
                    <ReactLeaflet.TileLayer
                        attribution={'Google Maps Satellite'}
                        url={
                            'https://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}'
                        }
                    />
                )}
                {mapLayer === 'MapBoxSat' && (
                    <ReactLeaflet.TileLayer
                        attribution='&copy; <a href="https://www.mapbox.com">Mapbox</a> '
                        url='https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}'
                        accessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                    />
                )}
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
                {enableSearch && (
                    <SearchControl onSelectResult={handleSelectSearch} />
                )}
                <div className={styles.leftControls}>
                    {enableFullScreen && (
                        <Button
                            mode={'secondary'}
                            icon={
                                document.fullscreenElement
                                    ? 'FullscreenOut'
                                    : 'FullscreenIn'
                            }
                            onClick={handleToggleFullscreen}
                        />
                    )}

                    {userLatLon && (
                        <Button
                            mode={'secondary'}
                            icon={'User'}
                            onClick={handleUserPosition}
                        />
                    )}
                </div>
                <div className={styles.rightControls}>
                    {enableLayersSwitcher && (
                        <LayerSwitcherControl
                            currentLayer={mapLayer}
                            onSwitchMapLayer={setMapLayer}
                        />
                    )}
                </div>
                {userLatLon && <MarkerUser coordinates={userLatLon} />}
                {loading && (
                    <div className={styles.loader}>
                        <Spinner />
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
