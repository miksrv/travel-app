import * as ReactLeaflet from 'react-leaflet'
import Leaflet from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'

const { MapContainer } = ReactLeaflet

// @ts-ignore
const Map = ({ children, className, width, height, ...rest }) => {
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

    return (
        <MapContainer
            {...rest}
            style={{ height: '100%', width: '100%' }}
            attributionControl={false}
        >
            {children(ReactLeaflet, Leaflet)}
        </MapContainer>
    )
}

export default Map
