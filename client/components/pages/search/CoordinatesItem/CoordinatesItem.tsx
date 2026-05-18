import React from 'react'
import { Icon } from 'simple-react-ui-kit'

import { convertDMS } from '@/utils/coordinates'

import styles from './styles.module.sass'

interface CoordinatesItemProps {
    lat: number
    lon: number
    secondary?: string
    onClick?: () => void
}

export const CoordinatesItem: React.FC<CoordinatesItemProps> = ({ lat, lon, secondary, onClick }) => (
    <div className={styles.coordinatesItem}>
        <span className={styles.icon}>
            <Icon name={'Point'} />
        </span>

        <div className={styles.content}>
            <button
                type={'button'}
                className={styles.primary}
                onClick={onClick}
            >
                {convertDMS(lat, lon)}
            </button>

            {secondary && <span className={styles.secondary}>{secondary}</span>}
        </div>
    </div>
)
