import { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/dist/client/router'
import React, { useEffect, useMemo } from 'react'

import Container from '@/ui/container'

import { API, isApiValidationErrors } from '@/api/api'
import { useAppSelector } from '@/api/store'
import { ApiTypes } from '@/api/types'

import RegistrationForm from '@/components/registration-form'

const RegistrationPage: NextPage = () => {
    const router = useRouter()
    const authSlice = useAppSelector((state) => state.auth)

    const [registration, { data, error, isLoading, isError }] =
        API.useAuthPostRegistrationMutation()

    const validationErrors = useMemo(
        () =>
            isApiValidationErrors<ApiTypes.RequestAuthRegistration>(error)
                ? error?.messages
                : undefined,
        [error]
    )

    const handleSubmit = (formData?: ApiTypes.RequestAuthRegistration) => {
        if (formData) {
            registration(formData)
        }
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
                loading={isLoading}
                errors={validationErrors}
                onCancel={handleCancel}
                onSubmit={handleSubmit}
            />
        </Container>
    )
}

export default RegistrationPage
