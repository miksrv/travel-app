import Grid from '@mui/material/Unstable_Grid2'
import React from 'react'

import { Place } from '@/api/types/Place'

import PlacesListItem from '@/components/places-list/PlacesListItem'
import PlacesListSkeleton from '@/components/places-list/PlacesListSkeleton'

interface PlacesListProps {
    perPage?: number
    loading?: boolean
    places?: Place[]
}

const PlacesList: React.FC<PlacesListProps> = ({
    perPage,
    places,
    loading
}) => (
    <Grid
        container
        spacing={2}
    >
        {loading &&
            Array.from(Array(perPage || 6), (_, i) => (
                <Grid
                    lg={4}
                    md={6}
                    xs={12}
                    key={i}
                >
                    <PlacesListSkeleton />
                </Grid>
            ))}

        {places?.map((place) => (
            <Grid
                lg={4}
                md={6}
                xs={12}
                key={place.id}
            >
                <PlacesListItem place={place} />
            </Grid>
        ))}
    </Grid>
)

export default PlacesList
