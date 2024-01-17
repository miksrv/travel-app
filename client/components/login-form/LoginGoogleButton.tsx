'use client'

import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'

import Button from '@/ui/button'

import { API } from '@/api/api'
import { login } from '@/api/authSlice'
import { useAppDispatch } from '@/api/store'

import useLocalStorage from '@/functions/hooks/useLocalStorage'

import googleLogo from '@/public/images/google-logo.png'

const LOGIN_PATH = 'currentPath'

interface LoginFormProps {
    loading?: boolean
    onSuccessLogin?: () => void
    onLoading?: (loading: boolean) => void
}

const LoginGoogleButton: React.FC<LoginFormProps> = ({
    loading,
    onSuccessLogin,
    onLoading
}) => {
    const dispatch = useAppDispatch()
    const router = useRouter()
    const searchParams = useSearchParams()

    const [path, setPath] = useLocalStorage<string>(LOGIN_PATH)

    const [authLoginPost, { isLoading, data: authData }] =
        API.useAuthGoogleLoginMutation()

    const handleLoginButton = () => {
        setPath(router.asPath)
        authLoginPost({})
        onLoading?.(true)
    }

    useEffect(() => {
        if (authData?.auth === false && authData?.redirect) {
            window.location.href = authData.redirect
        }

        if (authData?.auth === true) {
            dispatch(login(authData))
            onSuccessLogin?.()

            if (path) {
                setPath('')
                router.push(path)
            }
        }
    }, [authData])

    useEffect(() => {
        const code = searchParams.get('code')

        if (code) {
            authLoginPost({ code })
            onLoading?.(true)
        }
    }, [searchParams])

    useEffect(() => {
        onLoading?.(isLoading)
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
