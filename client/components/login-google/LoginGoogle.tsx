import { Button } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect } from 'react'

import { API } from '@/api/api'
import { login } from '@/api/authSlice'
import { useAppDispatch } from '@/api/store'

interface LoginFormProps {}

const LoginGoogle: React.FC<LoginFormProps> = () => {
    const dispatch = useAppDispatch()
    const searchParams = useSearchParams()
    const router = useRouter()
    const [authLoginPost, { isLoading, data: authData }] =
        API.useAuthGoogleLoginMutation()

    const handleLoginButton = () => {
        authLoginPost({})
    }

    useEffect(() => {
        if (authData?.auth === false && authData?.redirect) {
            window.location.href = authData.redirect
        }

        if (authData?.auth === true) {
            dispatch(login(authData))
            router.push('/')
        }
    }, [authData])

    useEffect(() => {
        const code = searchParams.get('code')

        if (code) {
            authLoginPost({ code })
        }
    }, [searchParams])

    return (
        <>
            <Button
                variant={'contained'}
                size={'small'}
                color={'primary'}
                onClick={handleLoginButton}
            >
                {'Войти через Google'}
            </Button>
        </>
    )
}
export default LoginGoogle
