import React from 'react'

import styles from './styles.module.sass'

import Skeleton from '@/ui/skeleton'

const PlacesListItemLoader: React.FC = () => (
    <article className={styles.placesListItem}>
        <div
            className={styles.photoSection}
            style={{ marginBottom: '10px' }}
        >
            <Skeleton style={{ height: '100%', width: '100%' }} />
        </div>

        {Array(7)
            .fill('')
            .map((_, i) => (
                <Skeleton
                    key={i}
                    style={{
                        height: '13px',
                        margin: '0 10px 5px 10px',
                        width: i === 6 ? '85%' : '94%'
                    }}
                />
            ))}
    </article>
)

export default PlacesListItemLoader
