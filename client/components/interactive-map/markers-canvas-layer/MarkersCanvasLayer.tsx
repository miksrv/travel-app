import L from 'leaflet'
import 'leaflet-markers-canvas'
import 'leaflet/dist/leaflet.css'
import React, { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'

type MarkersCanvasProps = {
    markers?: any[]
}

const MarkersCanvasLayer: React.FC<MarkersCanvasProps> = ({ markers }) => {
    const map = useMap()
    const markersLayerRef = useRef(null)

    useEffect(() => {
        if (markers && markers.length > 0 && !markersLayerRef.current) {
            const canvasMarkers = new (L as any).MarkersCanvas()
            markers.forEach((marker) => {
                const { lat, lon, iconUrl } = marker
                const markerIcon = L.icon({
                    iconSize: [30, 30], // Размер иконки маркера
                    iconUrl: iconUrl
                })
                const canvasMarker = L.marker([lat, lon], { icon: markerIcon })
                canvasMarkers.addMarker(canvasMarker)
            })
            canvasMarkers.addTo(map)
            markersLayerRef.current = canvasMarkers
        } else if (
            markersLayerRef.current &&
            (!markers || markers.length === 0)
        ) {
            if (markersLayerRef.current && (!markers || markers.length === 0)) {
                ;(markersLayerRef.current as any).clearLayers()
                markersLayerRef.current = null
            }
        }

        return () => {
            if (markersLayerRef.current) {
                ;(markersLayerRef.current as any).clearLayers()
                markersLayerRef.current = null
            }
        }
    }, [map, markers])

    return null
}

export default MarkersCanvasLayer
