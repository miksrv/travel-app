import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Skeleton from '@mui/material/Skeleton'
import React from 'react'

import styles from './styles.module.sass'

const PlacesListItem: React.FC = () => (
    <Card className={styles.placesListItem}>
        <Skeleton
            variant={'rectangular'}
            height={180}
        />
        <CardContent sx={{ height: 155, overflow: 'hidden', p: 1.5 }}>
            <Skeleton
                variant={'text'}
                height={30}
            />
            <Skeleton variant={'text'} />
            <Skeleton variant={'text'} />
            <Skeleton variant={'text'} />
            <Skeleton variant={'text'} />
            <Skeleton
                variant={'text'}
                width={'80%'}
            />
        </CardContent>
    </Card>
)

export default PlacesListItem
