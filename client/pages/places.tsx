import { useIntroduceMutation, usePlacesGetListQuery } from '@/api/api'
import { NextPage } from 'next'
import { useEffect } from 'react'
import useGeolocation from 'react-hook-geolocation'

import PlacesList from '@/components/places-list'

const Places: NextPage = () => {
    const geolocation = useGeolocation()
    const [introduce] = useIntroduceMutation()
    const { data, isLoading } = usePlacesGetListQuery()

    useEffect(() => {
        if (geolocation?.latitude && geolocation?.longitude) {
            introduce({ lat: geolocation.latitude, lon: geolocation.longitude })
        }
    }, [geolocation.latitude, geolocation.longitude])

    return (
        <div className={'wrapper'}>
            <PlacesList places={data?.items} />
        </div>
    )
}

export default Places
