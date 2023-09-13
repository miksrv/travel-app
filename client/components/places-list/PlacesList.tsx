import Grid from '@mui/material/Unstable_Grid2'
import React from 'react'

import { Place } from '@/api/types/Place'

import PlacesListItem from '@/components/places-list-item'

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
                    lg={3}
                    md={6}
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
