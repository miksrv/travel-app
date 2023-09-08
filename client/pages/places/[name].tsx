import Typography from '@mui/material/Typography'
import { skipToken } from '@reduxjs/toolkit/query'
import { NextPage } from 'next'
import { useRouter } from 'next/dist/client/router'
import React from 'react'

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
        <>
            <Typography
                variant='h1'
                color='text.primary'
            >
                {data?.title}
            </Typography>
            {isLoading && <div>Loading....</div>}
            {data && JSON.stringify(data)}
            <div>{routerObject}</div>
        </>
    )
}

export default Place
