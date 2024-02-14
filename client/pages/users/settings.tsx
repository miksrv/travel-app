import { GetServerSidePropsResult, NextPage } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/dist/client/router'
import React, { useEffect, useMemo } from 'react'

import Container from '@/ui/container'
import ScreenSpinner from '@/ui/screen-spinner'

import { API, isApiValidationErrors } from '@/api/api'
import { setLocale } from '@/api/applicationSlice'
import { useAppSelector, wrapper } from '@/api/store'
import { ApiTypes } from '@/api/types'

import AppLayout from '@/components/app-layout'
import Header from '@/components/header'
import UserForm from '@/components/user-form'

interface SettingsUserPageProps {}

const SettingsUserPage: NextPage<SettingsUserPageProps> = () => {
    const { t } = useTranslation('common', {
        keyPrefix: 'pages.settingsUserPage'
    })

    const router = useRouter()
    const authSlice = useAppSelector((state) => state.auth)

    const { data: userData } = API.useUsersGetItemQuery(
        authSlice.user?.id || '',
        {
            skip: !authSlice.user?.id
        }
    )

    const [updateProfile, { data, error, isLoading, isSuccess }] =
        API.useUsersPatchProfileMutation()

    const validationErrors = useMemo(
        () =>
            isApiValidationErrors<ApiTypes.RequestUsersPatch>(error)
                ? error?.messages
                : undefined,
        [error]
    )

    const handleCancel = () => {
        router.back()
    }

    const handleSubmit = (formData?: ApiTypes.RequestUsersPatch) => {
        updateProfile({
            id: authSlice.user?.id,
            name:
                formData?.name !== authSlice.user?.name
                    ? formData?.name
                    : undefined,
            website:
                formData?.website &&
                formData.website !== authSlice.user?.website
                    ? formData?.website
                    : undefined
        })
    }

    useEffect(() => {
        if (authSlice?.isAuth === false) {
            router.push('/login')
        }
    }, [])

    useEffect(() => {
        if (isSuccess) {
            router.push(`/users/${authSlice.user?.id}`)
        }
    }, [isSuccess, data])

    return (
        <AppLayout>
            <NextSeo title={t('title')} />
            <Header
                title={t('title')}
                currentPage={t('title')}
                backLink={`/users/${authSlice.user?.id}`}
                links={[
                    {
                        link: '/users/',
                        text: t('breadCrumbUsersLink')
                    },
                    {
                        link: `/users/${authSlice.user?.id}`,
                        text: authSlice.user?.name || t('breadCrumbMyPageLink')
                    }
                ]}
            />
            <Container>
                {!authSlice?.isAuth && <ScreenSpinner />}

                <UserForm
                    loading={isLoading || isSuccess}
                    values={userData}
                    errors={validationErrors}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            </Container>
        </AppLayout>
    )
}

export const getServerSideProps = wrapper.getServerSideProps(
    (store) =>
        async (
            context
        ): Promise<GetServerSidePropsResult<SettingsUserPageProps>> => {
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

export default SettingsUserPage
