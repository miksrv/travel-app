'use client'

import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import React, { useEffect } from 'react'

import Button from '@/ui/button'

import { API } from '@/api/api'
import { login } from '@/api/authSlice'
import { useAppDispatch } from '@/api/store'

import googleLogo from '@/public/images/google-logo.png'

interface LoginFormProps {
    loading?: boolean
    onSuccessLogin?: () => void
    setLoading?: (loading: boolean) => void
}

const LoginGoogleButton: React.FC<LoginFormProps> = (props) => {
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
            stretched={true}
            size={'m'}
            mode={'secondary'}
            disabled={isLoading || loading}
            onClick={handleLoginButton}
        >
            <Image
                src={googleLogo.src}
                width={16}
                height={16}
                alt={''}
            />
            {'Войти через Google'}
        </Button>
    )
}
export default LoginGoogleButton
