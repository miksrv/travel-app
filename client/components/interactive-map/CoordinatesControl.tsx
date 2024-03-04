import { LatLng } from 'leaflet'
import React, { useEffect, useState } from 'react'

import Button from '@/ui/button'
import Container from '@/ui/container'

import { round } from '@/functions/helpers'

import styles from './styles.module.sass'

interface CoordinatesControlProps {
    coordinates: LatLng
    onSetCoordinates?: (lat: number, lon: number) => void
}

const CoordinatesControl: React.FC<CoordinatesControlProps> = ({
    coordinates,
    onSetCoordinates
}) => {
    const [editMode, setEditMode] = useState<boolean>(false)
    const [localCoordinates, setLocalCoordinates] = useState<LatLng>()
    const [localLat, setLocalLat] = useState<number | string>()
    const [localLon, setLocalLon] = useState<number | string>()

    const coordinateTemplate = /^-?\d{0,3}(\.\d{0,})?$/

    const disabled =
        !localLon ||
        !localLat ||
        !coordinateTemplate.test(localLon.toString()) ||
        !coordinateTemplate.test(localLat.toString())

    const handleContainerClick = (event: React.MouseEvent) => {
        event.stopPropagation()

        if (!editMode) {
            setEditMode(true)
            setLocalCoordinates(coordinates)
            setLocalLat(round(coordinates?.lat, 6))
            setLocalLon(round(coordinates?.lng, 6))
        }
    }

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSetCoordinates()
        }
    }

    const handleChange = ({
        target: { name, value }
    }: React.ChangeEvent<HTMLInputElement>) => {
        if (!coordinateTemplate.test(value)) {
            return
        }

        if (name === 'lat') {
            setLocalLat(value)
        }

        if (name === 'lon') {
            setLocalLon(value)
        }
    }

    const handleSetCoordinates = () => {
        if (!disabled) {
            onSetCoordinates?.(Number(localLat), Number(localLon))
        }
    }

    useEffect(() => {
        if (
            editMode &&
            localCoordinates &&
            (localCoordinates?.lat !== coordinates?.lat ||
                localCoordinates?.lng !== coordinates?.lng)
        ) {
            setEditMode(false)
            setLocalLat(undefined)
            setLocalLon(undefined)
        }
    }, [localCoordinates, coordinates, editMode])

    return (
        <Container
            className={styles.mapCoordinatesControl}
            onClick={handleContainerClick}
            onMouseMove={(e) => e.stopPropagation()}
        >
            <b>Lat:</b>
            {editMode ? (
                <input
                    value={localLat}
                    name={'lat'}
                    onKeyDown={handleKeyPress}
                    onChange={handleChange}
                />
            ) : (
                localLat ?? round(coordinates?.lat, 6)
            )}
            <b>Lon:</b>
            {editMode ? (
                <input
                    value={localLon}
                    name={'lon'}
                    onKeyDown={handleKeyPress}
                    onChange={handleChange}
                />
            ) : (
                localLon ?? round(coordinates?.lng, 6)
            )}
            {editMode && (
                <Button
                    disabled={disabled}
                    mode={'secondary'}
                    icon={'CheckCircle'}
                    onClick={handleSetCoordinates}
                />
            )}
        </Container>
    )
}

export default CoordinatesControl
