import React, { useEffect, useMemo } from 'react'
import { GetServerSidePropsResult, NextPage } from 'next'
import { useRouter } from 'next/dist/client/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'

import { API, isApiValidationErrors } from '@/api/api'
import { setLocale } from '@/api/applicationSlice'
import { Notify } from '@/api/notificationSlice'
import { useAppDispatch, useAppSelector, wrapper } from '@/api/store'
import { ApiTypes } from '@/api/types'
import AppLayout from '@/components/app-layout'
import Header from '@/components/header'
import UserForm from '@/components/user-form'
import Container from '@/ui/container'
import ScreenSpinner from '@/ui/screen-spinner'

type SettingsUserPageProps = object

const SettingsUserPage: NextPage<SettingsUserPageProps> = () => {
    const dispatch = useAppDispatch()
    const router = useRouter()
    const { t } = useTranslation()

    const authSlice = useAppSelector((state) => state.auth)

    const { data: userData, isFetching } = API.useUsersGetItemQuery(authSlice.user?.id || '', {
        refetchOnMountOrArgChange: true,
        skip: !authSlice.user?.id
    })

    const [updateProfile, { data, error, isLoading, isSuccess }] = API.useUsersPatchProfileMutation()

    const validationErrors = useMemo(
        () => (isApiValidationErrors<ApiTypes.RequestUsersPatch>(error) ? error.messages : undefined),
        [error]
    )

    const handleCancel = () => {
        router.back()
    }

    const handleSubmit = (formData?: ApiTypes.RequestUsersPatch) => {
        updateProfile({
            id: authSlice.user?.id,
            name: formData?.name !== userData?.name ? formData?.name : undefined,
            newPassword:
                userData?.authType === 'native' && formData?.newPassword && formData.newPassword.length > 1
                    ? formData.newPassword
                    : undefined,
            oldPassword:
                userData?.authType === 'native' && formData?.oldPassword && formData.oldPassword.length > 1
                    ? formData.oldPassword
                    : undefined,
            settings: formData?.settings,
            website: formData?.website !== userData?.website ? formData?.website : undefined
        })
    }

    useEffect(() => {
        if (!authSlice.isAuth) {
            router.push('/users')
        }
    })

    useEffect(() => {
        if (isSuccess) {
            router.replace(`/users/${authSlice.user?.id}`)

            dispatch(
                Notify({
                    id: 'userFormSuccess',
                    title: '',
                    message: t('settings-have-been-saved'),
                    type: 'success'
                })
            )
        }
    }, [isSuccess, data])

    return (
        <AppLayout>
            <NextSeo
                noindex={true}
                nofollow={true}
                title={t('settings')}
            />
            <Header
                title={t('settings')}
                homePageTitle={t('geotags')}
                currentPage={t('settings')}
                backLink={`/users/${authSlice.user?.id}`}
                links={[
                    {
                        link: '/users/',
                        text: t('users')
                    },
                    {
                        link: `/users/${authSlice.user?.id}`,
                        text: authSlice.user?.name || t('my-page')
                    }
                ]}
            />
            <Container>
                {!authSlice.isAuth && <ScreenSpinner />}

                <UserForm
                    loading={isLoading || isSuccess || isFetching}
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
        async (context): Promise<GetServerSidePropsResult<SettingsUserPageProps>> => {
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
