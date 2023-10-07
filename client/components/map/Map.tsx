import * as ReactLeaflet from 'react-leaflet'
import Leaflet, { LatLngExpression, Map as LeafletMap } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import isEqual from 'lodash-es/isEqual'
import React, { useEffect, useState } from 'react'

import styles from './styles.module.sass'

const { MapContainer } = ReactLeaflet

const Map: React.FC<any> = (params) => {
    const { children, className, width, height, ...rest } = params
    const [center, setCenter] = useState<LatLngExpression>()
    const [map, setMap] = useState<LeafletMap>()

    useEffect(() => {
        if (!isEqual(center, rest.center)) {
            setCenter(rest.center)
            map?.setView(rest.center, map?.getZoom())
        }
    }, [rest.center, center])

    return (
        <div className={styles.mapContainer}>
            <MapContainer
                {...rest}
                style={{ height: '100%', width: '100%' }}
                attributionControl={false}
                ref={setMap}
            >
                {children(ReactLeaflet, Leaflet)}
            </MapContainer>
        </div>
    )
}

export default Map
