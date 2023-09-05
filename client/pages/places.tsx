import { usePlacesGetListQuery } from '@/api/api'
import { NextPage } from 'next'

import PlacesList from '@/components/places-list'

const Places: NextPage = () => {
    const { data, isLoading } = usePlacesGetListQuery()

    return (
        <div className={'wrapper'}>
            {/*{isLoading && <div>Loading....</div>}*/}
            {/*{data && JSON.stringify(data)}*/}
            <PlacesList places={data?.items} />
        </div>
    )
}

export default Places
