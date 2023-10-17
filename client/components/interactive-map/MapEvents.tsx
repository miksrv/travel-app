import { LatLngBounds } from 'leaflet'
import React, { useEffect } from 'react'
import { useMapEvents } from 'react-leaflet'

type TMapEventsProps = {
    onChangeBounds?: (bounds: LatLngBounds) => void
}

const MapEvents: React.FC<TMapEventsProps> = ({ onChangeBounds }) => {
    const mapEvents = useMapEvents({
        mousedown: () => {
            mapEvents.closePopup()
        },
        moveend: () => {
            onChangeBounds?.(mapEvents.getBounds())
        }
    })

    useEffect(() => {
        onChangeBounds?.(mapEvents.getBounds())
    })

    return null
}

export default MapEvents
