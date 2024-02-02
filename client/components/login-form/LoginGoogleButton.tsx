'use client'

import { useTranslation } from 'next-i18next'
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

export const RETURN_PATH_KEY = 'returnPath'

interface LoginFormProps {
    loading?: boolean
    onSuccessLogin?: () => void
    onErrorLogin?: () => void
    onLoading?: (loading: boolean) => void
}

const LoginGoogleButton: React.FC<LoginFormProps> = ({
    loading,
    onSuccessLogin,
    onErrorLogin,
    onLoading
}) => {
    const { t } = useTranslation('common', {
        keyPrefix: 'components.loginForm.LoginGoogleButton'
    })

    const dispatch = useAppDispatch()
    const router = useRouter()
    const searchParams = useSearchParams()

    const [returnPath, setReturnPath] = useLocalStorage<string>(RETURN_PATH_KEY)

    const [authLoginPost, { data: authData, isLoading, isSuccess, isError }] =
        API.useAuthGoogleLoginMutation()

    const handleLoginButton = () => {
        setReturnPath(router.asPath)
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

            if (returnPath) {
                router.push(returnPath)
                setReturnPath('')
            }
        }
    }, [authData])

    useEffect(() => {
        if (isError) {
            onErrorLogin?.()
        }
    }, [isError])

    useEffect(() => {
        const code = searchParams.get('code')

        if (code) {
            authLoginPost({ code })
            onLoading?.(true)
        }
    }, [searchParams])

    useEffect(() => {
        onLoading?.(isLoading || isSuccess)
    }, [isLoading, isSuccess])

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
                style={{ marginBottom: '3px', verticalAlign: 'middle' }}
                width={16}
                height={16}
                alt={''}
            />
            {t('buttonLogin')}
        </Button>
    )
}
export default LoginGoogleButton
