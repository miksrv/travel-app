import { LatLngBounds } from 'leaflet'
import React, { useEffect } from 'react'
import { useMapEvent } from 'react-leaflet'

type TMapEventsProps = {
    onChangeBounds?: (bounds: LatLngBounds) => void
}

const MapEvents: React.FC<TMapEventsProps> = ({ onChangeBounds }) => {
    const map = useMapEvent('moveend', () => {
        onChangeBounds?.(map.getBounds())
    })

    useEffect(() => {
        onChangeBounds?.(map.getBounds())
    })

    return null
}

export default MapEvents
