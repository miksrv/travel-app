import { Place } from '@/api/types/Place'
import Grid from '@mui/material/Unstable_Grid2'
import React from 'react'

import PlacesListItem from '@/components/places-list-item'

import styles from './styles.module.sass'

interface PlacesListProps {
    places?: Place[]
}

const PlacesList: React.FC<PlacesListProps> = ({ places }) => {
    return (
        <Grid
            container
            spacing={2}
        >
            {places?.map((place) => (
                <Grid
                    md={3}
                    xs={12}
                    key={place.id}
                >
                    <PlacesListItem place={place} />
                </Grid>
            ))}
        </Grid>
    )
}

export default PlacesList
