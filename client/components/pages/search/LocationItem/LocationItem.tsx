import React from 'react'
import { Icon } from 'simple-react-ui-kit'

import { ApiModel } from '@/api'

import { buildLocationParts } from './utils'

import styles from './styles.module.sass'

interface LocationItemProps {
    location: ApiModel.GeoSearchLocation
    onClick?: () => void
}

export const LocationItem: React.FC<LocationItemProps> = ({ location, onClick }) => {
    const { primary, secondary } = buildLocationParts(location)

    return (
        <div className={styles.locationItem}>
            <span className={styles.icon}>
                <Icon name={'Point'} />
            </span>

            <div className={styles.content}>
                <button
                    type={'button'}
                    className={styles.primary}
                    onClick={onClick}
                >
                    {primary}
                </button>

                {secondary && <span className={styles.secondary}>{secondary}</span>}
            </div>
        </div>
    )
}
