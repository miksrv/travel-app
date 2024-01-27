import { GetServerSidePropsResult, NextPage } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/dist/client/router'
import React, { useEffect, useMemo } from 'react'

import Container from '@/ui/container'

import { API, isApiValidationErrors } from '@/api/api'
import { login } from '@/api/authSlice'
import { useAppDispatch, useAppSelector, wrapper } from '@/api/store'
import { ApiTypes } from '@/api/types'

import RegistrationForm from '@/components/registration-form'

interface RegistrationPageProps {}

const RegistrationPage: NextPage<RegistrationPageProps> = () => {
    const dispatch = useAppDispatch()
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
        if (data?.auth) {
            dispatch(login(data))
        }
    }, [data])

    useEffect(() => {
        if (authSlice.isAuth) {
            router.push('/')
        }
    })

    return (
        <>
            <NextSeo title={'Регистрация'} />
            <Container
                className={'loginPage'}
                title={'Регистрация'}
            >
                <RegistrationForm
                    loading={isLoading || data?.auth}
                    errors={validationErrors}
                    onCancel={handleCancel}
                    onSubmit={handleSubmit}
                />
            </Container>
        </>
    )
}

export const getServerSideProps = wrapper.getServerSideProps(
    (store) =>
        async (
            context
        ): Promise<GetServerSidePropsResult<RegistrationPageProps>> => {
            const locale = context.locale ?? 'ru'

            const translations = await serverSideTranslations(locale)

            return {
                props: {
                    ...translations
                }
            }
        }
)

export default RegistrationPage
