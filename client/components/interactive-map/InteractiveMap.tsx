'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as ReactLeaflet from 'react-leaflet'
import { LatLngBounds, LatLngExpression, Map, MapOptions } from 'leaflet'
import isEqual from 'lodash-es/isEqual'
import { useRouter } from 'next/dist/client/router'

import 'leaflet.heat'
import 'leaflet/dist/leaflet.css'

import ContextMenu from './context-menu/ContextMenu'
import CoordinatesControl from './coordinates-control/CoordinatesControl'
import HeatmapLayer from './heatmap-layer/HeatmapLayer'
import HistoricalPhotos from './historical-photos/HistoricalPhotos'
import MarkerPhoto from './marker-photo/MarkerPhoto'
import MarkerPhotoCluster from './marker-photo-cluster/MarkerPhotoCluster'
import MarkerPoint from './marker-point/MarkerPoint'
import MarkerPointCluster from './marker-point-cluster/MarkerPointCluster'
import PlaceMark from './place-mark/PlaceMark'
import SearchControl from './search-control/SearchControl'
import CategoryControl from './CategoryControl'
import LayerSwitcherControl from './LayerSwitcherControl'
import MarkerUser from './MarkerUser'
import styles from './styles.module.sass'

import { ApiTypes, Place, Placemark } from '@/api/types'
import { LOCAL_STORAGE } from '@/functions/constants'
import { round } from '@/functions/helpers'
import useLocalStorage from '@/functions/hooks/useLocalStorage'
import Button from '@/ui/button'
import Spinner from '@/ui/spinner'

export const MapAdditionalLayers = {
    Heatmap: 'Heatmap',
    HistoricalPhotos: 'HistoricalPhotos'
} as const
export type MapAdditionalLayersType = (typeof MapAdditionalLayers)[keyof typeof MapAdditionalLayers]

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
    zoom?: number
}

type MapProps = {
    places?: Placemark.Place[]
    photos?: Placemark.Photo[]
    categories?: Place.Categories[]
    layer?: MapLayersType
    loading?: boolean
    storeMapPosition?: boolean
    enableCenterPopup?: boolean
    enableSearch?: boolean
    enableFullScreen?: boolean
    enableCoordsControl?: boolean
    enableCategoryControl?: boolean
    enableLayersSwitcher?: boolean
    enableContextMenu?: boolean
    hideAdditionalLayers?: boolean
    storeMapKey?: string
    fullMapLink?: string
    userLatLon?: ApiTypes.LatLonCoordinate
    onChangeCategories?: (categories?: Place.Categories[]) => void
    onChangeMapType?: (type?: MapObjectsType) => void
    onChangeBounds?: (bounds: LatLngBounds, zoom: number) => void
    onPhotoClick?: (photos: Placemark.Photo[], index?: number) => void
    onClickCreatePlace?: () => void
} & MapOptions

const DEFAULT_MAP_ZOOM = 12
const DEFAULT_MAP_CENTER: LatLngExpression = [51.765445, 55.099745]
const DEFAULT_MAP_LAYER: MapLayersType = MapLayers.OSM
const DEFAULT_MAP_TYPE: MapObjectsType = MapObjects.Places

const InteractiveMap: React.FC<MapProps> = ({
    places,
    photos,
    categories,
    // layer,
    loading,
    storeMapPosition,
    enableCenterPopup,
    enableSearch,
    enableFullScreen,
    enableCoordsControl,
    enableCategoryControl,
    enableLayersSwitcher,
    enableContextMenu,
    hideAdditionalLayers,
    storeMapKey,
    fullMapLink,
    userLatLon,
    onChangeCategories,
    onChangeMapType,
    onChangeBounds,
    onPhotoClick,
    onClickCreatePlace,
    ...props
}) => {
    const router = useRouter()
    const mapRef = useRef<Map | any>()

    const [readyStorage, setReadyStorage] = useState<boolean>(false)
    const [coordinatesOpen, setCoordinatesOpen] = useState<boolean>(false)
    const [placeMark, setPlaceMark] = useState<ApiTypes.LatLonCoordinate>()
    const [mapPosition, setMapPosition] = useState<MapPositionType>()
    const [mapLayer, setMapLayer] = useState<MapLayersType>(DEFAULT_MAP_LAYER)
    const [mapType, setMapType] = useState<MapObjectsType>(DEFAULT_MAP_TYPE)
    const [additionalLayers, setAdditionalLayers] = useState<MapAdditionalLayersType[]>()
    const [cursorPosition, setCursorPosition] = useState<ApiTypes.LatLonCoordinate>()

    const [coordinates, setCoordinates] = useLocalStorage<MapPositionType>(storeMapKey || LOCAL_STORAGE.MAP_CENTER)

    const handleUserPosition = () => {
        if (userLatLon?.lat && userLatLon.lon) {
            mapRef.current?.setView([userLatLon.lat, userLatLon.lon], DEFAULT_MAP_ZOOM)
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

    const handleSelectSearch = async (
        coordinates: ApiTypes.LatLonCoordinate,
        zoom?: number,
        showPosition?: boolean
    ) => {
        mapRef.current?.setView([coordinates.lat, coordinates.lon], zoom ?? DEFAULT_MAP_ZOOM)

        if (showPosition) {
            await handleSetPlaceMarker(coordinates)
        }
    }

    const handleSetPlaceMarker = async (coords: ApiTypes.LatLonCoordinate | undefined) => {
        setPlaceMark(coords)

        const url = new URL(window.location.href)
        const match = url.hash.match(/\?m=(-?\d+\.\d+),(-?\d+\.\d+)/)
        const param = coords ? `?m=${coords.lat},${coords.lon}` : ''

        url.hash = match ? url.hash.replace(match[0], param) : url.hash + param

        await router.replace(url.toString())
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
                (document as any).webkitFullscreenElement || (document as any).webkitCurrentFullScreenElement
            if (!fullscreenElement) {
                await mapElement.webkitRequestFullscreen()
            } else {
                await (document as any).webkitExitFullscreen()
            }
        }
    }

    useEffect(() => {
        const url = new URL(window.location.href)
        const match = url.hash.match(/\?m=(-?\d+\.\d+),(-?\d+\.\d+)/)

        if (match && !placeMark) {
            const [, lat, lon] = match
            setPlaceMark({
                lat: Number(lat),
                lon: Number(lon)
            })
        } else if (!match && placeMark) {
            setPlaceMark(undefined)
        }

        if (typeof coordinates !== 'undefined') {
            if (
                !readyStorage &&
                !props.center &&
                storeMapPosition &&
                coordinates.lon &&
                coordinates.lat &&
                coordinates.zoom &&
                mapRef.current?.setView
            ) {
                mapRef.current?.setView([coordinates.lat, coordinates.lon], coordinates.zoom || DEFAULT_MAP_ZOOM)
            }

            setReadyStorage(true)
        }
    }, [props.center, readyStorage, coordinates, placeMark])

    useEffect(() => {
        if (props.center || props.zoom) {
            mapRef.current?.setView(
                props.center ?? DEFAULT_MAP_CENTER,
                mapPosition?.zoom ?? props.zoom ?? DEFAULT_MAP_ZOOM
            )
        }
    }, [props.center, props.zoom])

    useEffect(() => {
        onChangeMapType?.(mapType)
    }, [])

    return (
        <div className={styles.mapContainer}>
            <ReactLeaflet.MapContainer
                {...props}
                center={props.center ?? DEFAULT_MAP_CENTER}
                zoom={props.zoom ?? DEFAULT_MAP_ZOOM}
                minZoom={6}
                style={{
                    cursor: enableCoordsControl ? 'crosshair' : props.dragging ? 'pointer' : 'default',
                    height: '100%',
                    width: '100%'
                }}
                attributionControl={false}
                ref={mapRef}
            >
                {additionalLayers?.includes(MapAdditionalLayers.Heatmap) && <HeatmapLayer />}

                {additionalLayers?.includes(MapAdditionalLayers.HistoricalPhotos) && (
                    <HistoricalPhotos
                        position={mapPosition}
                        onPhotoClick={onPhotoClick}
                    />
                )}

                {mapLayer === MapLayers.OCM && (
                    <ReactLeaflet.TileLayer
                        attribution='Open Cycle Map'
                        url={`https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=${process.env.NEXT_PUBLIC_CYCLEMAP_TOKEN}`}
                    />
                )}
                {mapLayer === MapLayers.MapBox && (
                    <ReactLeaflet.TileLayer
                        attribution='&copy; <a href="https://www.mapbox.com">Mapbox</a> '
                        url={`https://api.mapbox.com/styles/v1/miksoft/cli4uhd5b00bp01r6eocm21rq/tiles/256/{z}/{x}/{y}@2x?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`}
                    />
                )}
                {mapLayer === MapLayers.OSM && (
                    <ReactLeaflet.TileLayer
                        attribution={'Open Street Map'}
                        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    />
                )}
                {mapLayer === MapLayers.GoogleMap && (
                    <ReactLeaflet.TileLayer
                        attribution={'Google Maps'}
                        url={'https://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}'}
                    />
                )}
                {mapLayer === MapLayers.GoogleSat && (
                    <ReactLeaflet.TileLayer
                        attribution={'Google Maps Satellite'}
                        url={'https://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}'}
                    />
                )}
                {mapLayer === MapLayers.MapBoxSat && (
                    <ReactLeaflet.TileLayer
                        attribution='&copy; <a href="https://www.mapbox.com">Mapbox</a> '
                        url='https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}'
                        accessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                    />
                )}

                {placeMark && (
                    <PlaceMark
                        {...placeMark}
                        onClick={() => handleSetPlaceMarker(undefined)}
                    />
                )}

                {places?.map((place, i) =>
                    place.type === 'cluster' ? (
                        <MarkerPointCluster
                            key={`markerPointCluster${i}`}
                            marker={place}
                            onClick={(coords) =>
                                mapRef.current?.setView([coords.lat, coords.lon], (mapPosition?.zoom ?? 16) + 2)
                            }
                        />
                    ) : (
                        <MarkerPoint
                            key={`markerPoint${i}`}
                            place={place}
                            keepInView={enableCenterPopup}
                        />
                    )
                )}

                {photos?.map((photo, i) =>
                    photo.type === 'cluster' ? (
                        <MarkerPhotoCluster
                            key={`markerPhotoCluster${i}`}
                            marker={photo}
                            onClick={(coords) =>
                                mapRef.current?.setView([coords.lat, coords.lon], (mapPosition?.zoom ?? 16) + 2)
                            }
                        />
                    ) : (
                        <MarkerPhoto
                            key={`markerPhoto${i}`}
                            photo={photo}
                            onPhotoClick={() => onPhotoClick?.(photos, i)}
                        />
                    )
                )}

                {enableSearch && (
                    <SearchControl
                        onSelectResult={handleSelectSearch}
                        onClear={() => handleSetPlaceMarker(undefined)}
                    />
                )}

                {enableContextMenu && <ContextMenu />}

                <div className={styles.leftControls}>
                    {onClickCreatePlace && (
                        <Button
                            mode={'secondary'}
                            icon={'PlusCircle'}
                            onClick={onClickCreatePlace}
                        />
                    )}

                    {enableFullScreen && (
                        <Button
                            mode={'secondary'}
                            icon={document.fullscreenElement ? 'FullscreenOut' : 'FullscreenIn'}
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
                            hideAdditionalLayers={hideAdditionalLayers}
                            additionalLayers={additionalLayers}
                            onSwitchMapLayer={setMapLayer}
                            onSwitchMapType={handleSwitchMapType}
                            onSwitchAdditionalLayers={setAdditionalLayers}
                        />
                    )}

                    {enableCategoryControl && (
                        <CategoryControl
                            categories={categories}
                            onChangeCategories={onChangeCategories}
                        />
                    )}
                </div>

                <div className={styles.bottomControls}>
                    {enableCoordsControl && (
                        <CoordinatesControl
                            coordinates={cursorPosition ?? mapPosition}
                            onChangeOpen={setCoordinatesOpen}
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
                    <MapEvents
                        onChangeBounds={handleChangeBounds}
                        onMouseMove={enableCoordsControl && coordinatesOpen ? setCursorPosition : undefined}
                    />
                )}
            </ReactLeaflet.MapContainer>
        </div>
    )
}

interface MapEventsProps {
    onMouseMove?: (coordinates: ApiTypes.LatLonCoordinate) => void
    onChangeBounds?: (bounds: LatLngBounds, zoom: number) => void
}

const MapEvents: React.FC<MapEventsProps> = ({ onMouseMove, onChangeBounds }) => {
    const mapEvents = ReactLeaflet.useMapEvents({
        mousedown: () => {
            mapEvents.closePopup()
        },
        mousemove: (event) => {
            onMouseMove?.({
                lat: round(event.latlng.lat, 5) || 0,
                lon: round(event.latlng.lng, 5) || 0
            })
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
