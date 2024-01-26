import { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/dist/client/router'
import React, { useEffect } from 'react'

import Container from '@/ui/container'

import { API } from '@/api/api'
import { useAppSelector } from '@/api/store'
import { ApiTypes } from '@/api/types'

import RegistrationForm from '@/components/registration-form'

const RegistrationPage: NextPage = () => {
    const router = useRouter()
    const authSlice = useAppSelector((state) => state.auth)

    const [registration, { data, isLoading, isError }] =
        API.useAuthPostLoginMutation()

    const handleSubmit = (formData?: ApiTypes.RequestAuthRegistration) => {
        console.log('formData', formData)
    }

    const handleCancel = () => {
        router.back()
    }

    useEffect(() => {
        if (authSlice.isAuth) {
            router.push('/')
        }
    })

    return (
        <Container className={'loginPage'}>
            <NextSeo title={'Регистрация'} />
            <RegistrationForm
                onCancel={handleCancel}
                onSubmit={handleSubmit}
            />
        </Container>
    )
}

export default RegistrationPage
