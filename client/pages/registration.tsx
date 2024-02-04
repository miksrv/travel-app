import { GetServerSidePropsResult, NextPage } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/dist/client/router'
import React, { useEffect, useMemo } from 'react'

import Container from '@/ui/container'

import { API, isApiValidationErrors } from '@/api/api'
import { setLocale } from '@/api/applicationSlice'
import { login } from '@/api/authSlice'
import { useAppDispatch, useAppSelector, wrapper } from '@/api/store'
import { ApiTypes } from '@/api/types'

import RegistrationForm from '@/components/registration-form'

interface RegistrationPageProps {}

const RegistrationPage: NextPage<RegistrationPageProps> = () => {
    const { t } = useTranslation('common', {
        keyPrefix: 'pages.registration'
    })

    const dispatch = useAppDispatch()
    const router = useRouter()
    const authSlice = useAppSelector((state) => state.auth)

    const [registration, { data, error, isLoading }] =
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
            router.push(`/users/${data?.user?.id}`)
        }
    }, [data])

    useEffect(() => {
        if (authSlice.isAuth) {
            router.push('/')
        }
    })

    return (
        <>
            <NextSeo title={t('title')} />
            <Container
                className={'loginPage'}
                title={t('title')}
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
            const locale = (context.locale ?? 'en') as ApiTypes.LocaleType

            const translations = await serverSideTranslations(locale)

            store.dispatch(setLocale(locale))

            return {
                props: {
                    ...translations
                }
            }
        }
)

export default RegistrationPage
