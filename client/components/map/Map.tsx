import DynamicMap from '@/components/map/DynamicMap'

import styles from './styles.module.sass'

const Map = (props: any) => (
    <div className={styles.mapContainer}>
        <DynamicMap {...props} />
    </div>
)

export default Map
