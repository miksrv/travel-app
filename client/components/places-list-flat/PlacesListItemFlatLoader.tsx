import React from 'react'

import Skeleton from '@/ui/skeleton'

import styles from './styles.module.sass'

const PlacesListItemFlatLoader: React.FC = () => (
    <article className={styles.placeFlatItem}>
        <section className={styles.photoSection}>
            <Skeleton style={{ height: '50px', width: '100px' }} />
        </section>

        <section>
            <h2 className={styles.title}>
                <Skeleton style={{ height: '18px', width: '100px' }} />
            </h2>

            <div className={styles.bottomPanel}>
                <div className={styles.statistic}>
                    <Skeleton style={{ height: '18px', width: '200px' }} />
                </div>

                <div className={styles.address}>
                    <Skeleton
                        style={{
                            height: '18px',
                            marginLeft: '10px',
                            width: '100px'
                        }}
                    />
                </div>
            </div>
        </section>
    </article>
)

export default PlacesListItemFlatLoader
