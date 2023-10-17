'use client'

import * as ReactLeaflet from 'react-leaflet'
import Leaflet, { LatLngExpression, Map, MapOptions } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import isEqual from 'lodash-es/isEqual'
import React, { useEffect, useRef, useState } from 'react'

import styles from './styles.module.sass'

type MapProps = { children: any } & MapOptions

const InteractiveMap: React.FC<MapProps> = ({ children, ...props }) => {
    const [center, setCenter] = useState<LatLngExpression>()
    const mapRef = useRef<Map | any>()

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
                {children(ReactLeaflet, Leaflet)}
            </ReactLeaflet.MapContainer>
        </div>
    )
}

export default InteractiveMap
