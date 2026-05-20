import React from 'react'
import { Skeleton } from 'simple-react-ui-kit'

import { ApiType } from '@/api'

import styles from './styles.module.sass'

interface SearchResultsSkeletonProps {
    type?: ApiType.Search.Request['type']
}

const LocationItemSkeleton: React.FC = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Skeleton style={{ width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Skeleton style={{ height: '14px', width: '60%' }} />
            <Skeleton style={{ height: '11px', width: '80%' }} />
        </div>
    </div>
)

const PlaceCardSkeleton: React.FC = () => (
    <div style={{ display: 'flex', gap: '12px', padding: '2px 0' }}>
        <Skeleton style={{ width: '120px', height: '80px', borderRadius: 'var(--border-radius)', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Skeleton style={{ height: '14px', width: '75%' }} />
            <Skeleton style={{ height: '12px', width: '50%' }} />
            <Skeleton style={{ height: '22px', width: '80px', borderRadius: '20px' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'auto' }}>
                <Skeleton style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                <Skeleton style={{ height: '11px', width: '70px' }} />
                <Skeleton style={{ height: '11px', width: '40px' }} />
            </div>
        </div>
    </div>
)

const CoordinatesItemSkeleton: React.FC = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Skeleton style={{ width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Skeleton style={{ height: '14px', width: '55%' }} />
        </div>
    </div>
)

export const SearchResultsSkeleton: React.FC<SearchResultsSkeletonProps> = ({ type }) => {
    const showLocations = !type || type === 'all' || type === 'location'
    const showCoordinates = !type || type === 'all' || type === 'coordinates'
    const showPlaces = !type || type === 'all' || type === 'places'

    return (
        <div className={styles.results}>
            {showLocations && (
                <section className={styles.section}>
                    <Skeleton style={{ height: '18px', width: '80px' }} />
                    <div className={styles.locationList}>
                        <LocationItemSkeleton />
                        <LocationItemSkeleton />
                        <LocationItemSkeleton />
                    </div>
                </section>
            )}

            {showCoordinates && (
                <section className={styles.section}>
                    <Skeleton style={{ height: '18px', width: '100px' }} />
                    <CoordinatesItemSkeleton />
                </section>
            )}

            {showPlaces && (
                <section className={styles.section}>
                    <Skeleton style={{ height: '18px', width: '140px' }} />
                    <div className={styles.placeList}>
                        <PlaceCardSkeleton />
                        <PlaceCardSkeleton />
                        <PlaceCardSkeleton />
                        <PlaceCardSkeleton />
                    </div>
                </section>
            )}
        </div>
    )
}
