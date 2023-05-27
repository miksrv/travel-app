import * as ReactLeaflet from 'react-leaflet'
import Leaflet from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useCallback, useEffect, useState } from 'react'
import { useMapEvents } from 'react-leaflet'

const { MapContainer } = ReactLeaflet

// @ts-ignore
const Map = ({ children, className, width, height, ...rest }) => {
    // const mapEvents = useMapEvents({
    //     locationfound(e) {
    //         mapEvents.flyTo(e.latlng, mapEvents.getZoom())
    //     }
    // })
    const [map, setMap] = useState()

    // @ts-ignore
    const [position, setPosition] = useState(() => map?.getCenter?.())

    const onMove = useCallback(() => {
        // @ts-ignore
        setPosition(map?.getCenter?.())
    }, [map])

    useEffect(() => {
        // @ts-ignore
        // map?.on('move', onMove)
        // return () => {
        //     // @ts-ignore
        //     map.off('move', onMove)
        // }
    }, [map, onMove])

    useEffect(() => {
        ;(async function init() {
            // @ts-ignore
            // delete Leaflet.Icon.Default.prototype._getIconUrl
            Leaflet.Icon.Default.mergeOptions({
                iconRetinaUrl: 'leaflet/images/marker-icon-2x.png',
                iconUrl: 'leaflet/images/marker-icon.png',
                shadowUrl: 'leaflet/images/marker-shadow.png'
            })
        })()
    }, [])

    // @ts-ignore
    console.log('map', map?.getCenter?.())

    return (
        <MapContainer
            {...rest}
            style={{ height: '100%', width: '100%' }}
            attributionControl={false}
            // @ts-ignore
            ref={setMap}
        >
            {children(ReactLeaflet, Leaflet)}
        </MapContainer>
    )
}

export default Map
