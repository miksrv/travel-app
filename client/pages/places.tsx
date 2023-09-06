import { useIntroduceMutation, usePlacesGetListQuery } from '@/api/api'
import { Pagination } from '@mui/material'
import { NextPage } from 'next'
import { useRouter } from 'next/dist/client/router'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import React from 'react'
import useGeolocation from 'react-hook-geolocation'

import PlacesList from '@/components/places-list'

const PER_PAGE_LIMIT = 4

const Places: NextPage = () => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const page = searchParams.get('page')
    const geolocation = useGeolocation()
    const [introduce] = useIntroduceMutation()

    const { data, isLoading } = usePlacesGetListQuery({
        limit: PER_PAGE_LIMIT,
        offset: Number(page) ?? 0
    })

    const handlePaginationChange = async (
        e: React.ChangeEvent<unknown>,
        value: number
    ) => {
        await router.push(
            value === 1 ? 'places' : `places?page=${value}`,
            undefined,
            {
                shallow: true
            }
        )
    }

    useEffect(() => {
        if (geolocation?.latitude && geolocation?.longitude) {
            introduce({ lat: geolocation.latitude, lon: geolocation.longitude })
        }
    }, [geolocation.latitude, geolocation.longitude])

    return (
        <div className={'wrapper'}>
            <PlacesList places={data?.items} />
            {data?.count && (
                <Pagination
                    count={Math.ceil(data?.count / PER_PAGE_LIMIT)}
                    shape='rounded'
                    onChange={handlePaginationChange}
                />
            )}
        </div>
    )
}

export default Places
