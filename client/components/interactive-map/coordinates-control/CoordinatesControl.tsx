'use client'

import React, { useState } from 'react'
import { Button, Container } from 'simple-react-ui-kit'

import styles from './styles.module.sass'

import { ApiTypes } from '@/api/types'

interface CoordinatesControlProps {
    coordinates?: ApiTypes.LatLonCoordinate
    onChangeOpen?: (open: boolean) => void
}

const CoordinatesControl: React.FC<CoordinatesControlProps> = ({ coordinates, onChangeOpen }) => {
    const [open, setOpen] = useState<boolean>(false)

    const handleToggleOpen = () => {
        setOpen(!open)
        onChangeOpen?.(!open)
    }

    return !open ? (
        <Button
            mode={'secondary'}
            icon={'PinDrop'}
            onClick={handleToggleOpen}
        />
    ) : (
        <Container
            className={styles.coordinatesControl}
            onClick={handleToggleOpen}
        >
            <b>Lat:</b>
            <span>{coordinates?.lat}</span>
            <b>Lon:</b>
            <span>{coordinates?.lon}</span>
        </Container>
    )
}

export default CoordinatesControl
