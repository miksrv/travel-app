import React, { useEffect } from 'react'

import { API } from '@/api/api'
import { login, logout } from '@/api/authSlice'
import { useAppDispatch } from '@/api/store'

const AppAuthChecker: React.FC = () => {
    const dispatch = useAppDispatch()

    const { data: meData, isSuccess } = API.useAuthGetMeQuery(undefined, {
        pollingInterval: 60 * 1000
    })

    useEffect(() => {
        if (isSuccess) {
            if (meData?.auth === true) {
                dispatch(login(meData))
            } else {
                dispatch(logout())
            }
        }
    }, [meData])

    return <></>
}

export default AppAuthChecker
