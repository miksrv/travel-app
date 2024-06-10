import React from 'react'

import Skeleton from '@/ui/skeleton'

import styles from './styles.module.sass'

const PlacesListItemLoader: React.FC = () => (
    <article className={styles.placesListItem}>
        <div className={styles.photoSection}>
            <Skeleton style={{ height: '100%', width: '100%' }} />
        </div>

        <Skeleton
            style={{ height: '17px', margin: '8px auto', width: '94%' }}
        />

        <div className={styles.address}>
            <Skeleton
                style={{ height: '12px', marginBottom: '10px', width: '70%' }}
            />
        </div>

        {Array(5)
            .fill('')
            .map((_, i) => (
                <Skeleton
                    key={i}
                    style={{
                        height: '14px',
                        margin: '0 10px 5px 10px',
                        width: i === 4 ? '85%' : '94%'
                    }}
                />
            ))}
    </article>
)

export default PlacesListItemLoader
