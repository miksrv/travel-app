import React from 'react'

import Container from '@/ui/container'

import { ApiTypes } from '@/api/types'

import styles from './styles.module.sass'

interface CoordinatesControlProps {
    coordinates?: ApiTypes.LatLonCoordinate
}

const CoordinatesControl: React.FC<CoordinatesControlProps> = ({
    coordinates
}) => (
    <Container className={styles.mapCoordinatesControl}>
        <b>Lat:</b>
        <span>{coordinates?.lat}</span>
        <b>Lon:</b>
        <span>{coordinates?.lon}</span>
    </Container>
)

export default CoordinatesControl
