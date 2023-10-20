import Card from '@mui/material/Card'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Unstable_Grid2'
import React from 'react'

import { Place } from '@/api/types/Place'

import PlacesListItem from '@/components/places-list/PlacesListItem'
import PlacesListSkeleton from '@/components/places-list/PlacesListSkeleton'

interface PlacesListProps {
    perPage?: number
    loading?: boolean
    places?: Place[]
    useLinearView?: boolean
}

const PlacesList: React.FC<PlacesListProps> = ({
    perPage,
    places,
    loading,
    useLinearView
}) =>
    !useLinearView ? (
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

            {!places?.length && (
                <Grid xs={12}>
                    <PlacesListNotFound />
                </Grid>
            )}
        </Grid>
    ) : (
        <>
            {loading &&
                Array.from(Array(perPage || 6), (_, i) => (
                    <Container
                        key={i}
                        sx={{ p: '0 5px !important' }}
                    >
                        <PlacesListSkeleton />
                    </Container>
                ))}

            {places?.map((place) => (
                <Container
                    key={place.id}
                    sx={{ p: '0 5px !important' }}
                >
                    <PlacesListItem place={place} />
                </Container>
            ))}

            {!places?.length && <PlacesListNotFound />}
        </>
    )

const PlacesListNotFound: React.FC = () => (
    <Card sx={{ p: 5 }}>
        <Typography
            variant={'body1'}
            color={'text.primary'}
            align={'center'}
        >
            {
                'Нет интересных мест по вашему запросу. Попробуйте изменить условия поиска.'
            }
        </Typography>
    </Card>
)

export default PlacesList
