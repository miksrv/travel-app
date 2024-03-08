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

import CoordinatesControl from '@/components/interactive-map/CoordinatesControl'
import LayerSwitcherControl from '@/components/interactive-map/LayerSwitcherControl'
import MarkerPhoto from '@/components/interactive-map/MarkerPhoto'
import MarkerPoint from '@/components/interactive-map/MarkerPoint'
import MarkerUser from '@/components/interactive-map/MarkerUser'
import SearchControl from '@/components/interactive-map/SearchControl'

import { LOCAL_STORGE } from '@/functions/constants'
import useLocalStorage from '@/functions/hooks/useLocalStorage'

import styles from './styles.module.sass'

export const MapObjects = {
    Photos: 'Photos',
    Places: 'Places'
} as const
export type MapObjectsType = (typeof MapObjects)[keyof typeof MapObjects]

export const MapLayers = {
    GoogleMap: 'GoogleMap',
    GoogleSat: 'GoogleSat',
    MapBox: 'MapBox',
    MapBoxSat: 'MapBoxSat',
    OCM: 'OCM',
    OSM: 'OSM'
} as const
export type MapLayersType = (typeof MapLayers)[keyof typeof MapLayers]

export type MapPositionType = {
    lat: number
    lon: number
    zoom: number
}

type MapProps = {
    places?: Place[]
    photos?: Photo[]
    layer?: MapLayersType
    loading?: boolean
    storeMapPosition?: boolean
    enableSearch?: boolean
    enableFullScreen?: boolean
    enableCoordsControl?: boolean
    enableLayersSwitcher?: boolean
    storeMapKey?: string
    fullMapLink?: string
    userLatLon?: ApiTypes.LatLonCoordinate
    onChangeMapType?: (type?: MapObjectsType) => void
    onChangeBounds?: (bounds: LatLngBounds, zoom: number) => void
    onPhotoClick?: (photo: Photo) => void
} & MapOptions

const DEFAULT_MAP_ZOOM = 8
const DEFAULT_MAP_CENTER: LatLngExpression = [51.765445, 55.099745]
const DEFAULT_MAP_LAYER: MapLayersType = MapLayers.OSM
const DEFAULT_MAP_TYPE: MapObjectsType = MapObjects.Places

const InteractiveMap: React.FC<MapProps> = ({
    places,
    photos,
    // layer,
    loading,
    storeMapPosition,
    enableSearch,
    enableFullScreen,
    enableCoordsControl,
    enableLayersSwitcher,
    storeMapKey,
    fullMapLink,
    userLatLon,
    onChangeMapType,
    onChangeBounds,
    onPhotoClick,
    ...props
}) => {
    const mapRef = useRef<Map | any>()

    const [readyStorage, setReadyStorage] = useState<boolean>(false)
    const [mapPosition, setMapPosition] = useState<MapPositionType>()
    const [mapLayer, setMapLayer] = useState<MapLayersType>(DEFAULT_MAP_LAYER)
    const [mapType, setMapType] = useState<MapObjectsType>(DEFAULT_MAP_TYPE)

    const [coordinates, setCoordinates] = useLocalStorage<MapPositionType>(
        storeMapKey || LOCAL_STORGE.MAP_CENTER
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

    const handleSwitchMapType = (type: MapObjectsType) => {
        setMapType(type)
        onChangeMapType?.(type)
    }

    const handleSelectSearch = (coordinates: ApiTypes.LatLonCoordinate) => {
        mapRef.current?.setView(
            [coordinates.lat, coordinates.lon],
            DEFAULT_MAP_ZOOM
        )
    }

    const handleToggleFullscreen = async () => {
        const mapElement = mapRef.current.getContainer()

        if (mapElement.requestFullscreen) {
            // Full screen mode supported
            if (!document.fullscreenElement) {
                await mapElement.requestFullscreen()
            } else {
                await document.exitFullscreen()
            }
        } else if (mapElement.webkitRequestFullscreen) {
            // For Safari on iOS devices
            const fullscreenElement =
                // @ts-ignore
                document.webkitFullscreenElement ||
                // @ts-ignore
                document.webkitCurrentFullScreenElement
            if (!fullscreenElement) {
                await mapElement.webkitRequestFullscreen()
            } else {
                // @ts-ignore
                await document.webkitExitFullscreen()
            }
        }
    }

    const handleSetCoordinates = (lat: number, lon: number) => {
        mapRef?.current?.setView(
            [lat, lon],
            coordinates?.zoom || DEFAULT_MAP_ZOOM
        )
    }

    useEffect(() => {
        if (typeof coordinates !== 'undefined') {
            if (
                !readyStorage &&
                !props.center &&
                storeMapPosition &&
                coordinates?.lon &&
                coordinates?.lat &&
                coordinates?.zoom &&
                mapRef?.current?.setView
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
                props.center ?? DEFAULT_MAP_CENTER,
                props.zoom ?? mapPosition?.zoom ?? DEFAULT_MAP_ZOOM
            )
        }
    }, [props.center, props.zoom])

    useEffect(() => {
        onChangeMapType?.(mapType)
    }, [])

    // TODO Change layer
    // useEffect(() => {
    //     if (layer && Object.values(MapLayers).includes(layer)) {
    //
    //     }
    // }, [])

    return (
        <div className={styles.mapContainer}>
            <ReactLeaflet.MapContainer
                {...props}
                center={props.center ?? DEFAULT_MAP_CENTER}
                zoom={props.zoom ?? DEFAULT_MAP_ZOOM}
                minZoom={6}
                style={{ height: '100%', width: '100%' }}
                attributionControl={false}
                ref={mapRef}
            >
                {mapLayer === MapLayers.OCM && (
                    <ReactLeaflet.TileLayer
                        url={`https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=${process.env.NEXT_PUBLIC_CYCLEMAP_TOKEN}`}
                    />
                )}
                {mapLayer === MapLayers.MapBox && (
                    <ReactLeaflet.TileLayer
                        url={`https://api.mapbox.com/styles/v1/miksoft/cli4uhd5b00bp01r6eocm21rq/tiles/256/{z}/{x}/{y}@2x?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`}
                    />
                )}
                {mapLayer === MapLayers.OSM && (
                    <ReactLeaflet.TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
                )}
                {mapLayer === MapLayers.GoogleMap && (
                    <ReactLeaflet.TileLayer
                        attribution={'Google Maps'}
                        url={
                            'https://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}'
                        }
                    />
                )}
                {mapLayer === MapLayers.GoogleSat && (
                    <ReactLeaflet.TileLayer
                        attribution={'Google Maps Satellite'}
                        url={
                            'https://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}'
                        }
                    />
                )}
                {mapLayer === MapLayers.MapBoxSat && (
                    <ReactLeaflet.TileLayer
                        attribution='&copy; <a href="https://www.mapbox.com">Mapbox</a> '
                        url='https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}'
                        accessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                    />
                )}
                {places?.map((place) => (
                    <MarkerPoint
                        key={`poi${place.id}`}
                        place={place}
                    />
                ))}
                {photos?.map((photo) => (
                    <MarkerPhoto
                        key={`photo${photo.lat}_${photo.lon}`}
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
                            icon={'Gps'}
                            onClick={handleUserPosition}
                        />
                    )}

                    {fullMapLink && (
                        <Button
                            noIndex={true}
                            mode={'secondary'}
                            icon={'External'}
                            link={fullMapLink}
                        />
                    )}
                </div>

                <div className={styles.rightControls}>
                    {enableLayersSwitcher && (
                        <LayerSwitcherControl
                            currentLayer={mapLayer}
                            currentType={mapType}
                            onSwitchMapLayer={setMapLayer}
                            onSwitchMapType={handleSwitchMapType}
                        />
                    )}
                </div>

                <div className={styles.bottomControls}>
                    {enableCoordsControl && (
                        <CoordinatesControl
                            coordinates={mapRef?.current?.getCenter()}
                            onSetCoordinates={handleSetCoordinates}
                        />
                    )}
                </div>

                {userLatLon && <MarkerUser coordinates={userLatLon} />}
                <div
                    className={styles.loader}
                    style={{ display: loading ? 'block' : 'none' }}
                >
                    <Spinner />
                </div>
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
