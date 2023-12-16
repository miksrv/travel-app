'use client'

import GoogleIcon from '@mui/icons-material/Google'
import Button from '@mui/material/Button'
import { useSearchParams } from 'next/navigation'
import React, { useEffect } from 'react'

import { API } from '@/api/api'
import { login } from '@/api/authSlice'
import { useAppDispatch } from '@/api/store'

interface LoginFormProps {
    loading?: boolean
    onSuccessLogin?: () => void
    setLoading?: (loading: boolean) => void
}

const LoginGoogle: React.FC<LoginFormProps> = (props) => {
    const { loading, onSuccessLogin, setLoading } = props
    const dispatch = useAppDispatch()
    const searchParams = useSearchParams()

    const [authLoginPost, { isLoading, data: authData }] =
        API.useAuthGoogleLoginMutation()

    const handleLoginButton = () => {
        authLoginPost({})
        setLoading?.(true)
    }

    useEffect(() => {
        if (authData?.auth === false && authData?.redirect) {
            window.location.href = authData.redirect
        }

        if (authData?.auth === true) {
            dispatch(login(authData))
            onSuccessLogin?.()
        }
    }, [authData])

    useEffect(() => {
        const code = searchParams.get('code')

        if (code) {
            authLoginPost({ code })
            setLoading?.(true)
        }
    }, [searchParams])

    useEffect(() => {
        setLoading?.(isLoading)
    }, [isLoading])

    return (
        <Button
            variant={'contained'}
            color={'error'}
            fullWidth={true}
            disabled={isLoading || loading}
            onClick={handleLoginButton}
            startIcon={<GoogleIcon />}
        >
            {'Войти через Google'}
        </Button>
    )
}
export default LoginGoogle
