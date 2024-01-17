import { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/dist/client/router'
import React, { useEffect } from 'react'

import Container from '@/ui/container'

import { useAppSelector } from '@/api/store'

import LoginForm from '@/components/login-form'

const LoginPage: NextPage = () => {
    const router = useRouter()
    const authSlice = useAppSelector((state) => state.auth)

    const handleSuccessLogin = async () => {
        await router.push('/')
    }

    useEffect(() => {
        if (authSlice.isAuth) {
            router.push('/')
        }
    })

    return (
        <Container className={'loginPage'}>
            <NextSeo title={'Авторизация'} />
            <LoginForm onSuccessLogin={handleSuccessLogin} />
        </Container>
    )
}

export default LoginPage
