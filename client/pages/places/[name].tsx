import { skipToken } from '@reduxjs/toolkit/query'
import { NextPage } from 'next'
import { useRouter } from 'next/dist/client/router'

import { usePlacesGetItemQuery } from '@/api/api'

const Place: NextPage = () => {
    const router = useRouter()
    const routerObject = router.query.name
    const objectName =
        typeof routerObject === 'string' ? routerObject : skipToken

    const { data, isLoading } = usePlacesGetItemQuery(
        typeof objectName === 'string' ? objectName : '',
        {
            skip: router.isFallback || !routerObject
        }
    )

    return (
        <div>
            {isLoading && <div>Loading....</div>}
            {data && JSON.stringify(data)}
            <div>{routerObject}</div>
        </div>
    )
}

export default Place
