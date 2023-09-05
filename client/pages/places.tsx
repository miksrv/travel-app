import { usePlacesGetListQuery } from '@/api/api'
import { NextPage } from 'next'

const Places: NextPage = () => {
    const { data, isLoading } = usePlacesGetListQuery()

    return (
        <div>
            {isLoading && <div>Loading....</div>}
            {data && JSON.stringify(data)}
        </div>
    )
}

export default Places
