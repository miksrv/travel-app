import { GetServerSidePropsResult, NextPage } from 'next'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/dist/client/router'
import React, { useEffect, useMemo } from 'react'

import Container from '@/ui/container'
import ScreenSpinner from '@/ui/screen-spinner'

import { API, isApiValidationErrors } from '@/api/api'
import { useAppSelector, wrapper } from '@/api/store'
import { ApiTypes } from '@/api/types'

import AppLayout from '@/components/app-layout'
import Header from '@/components/header'
import PlaceForm from '@/components/place-form'

interface CreatePlacePageProps {}

const CreatePlacePage: NextPage<CreatePlacePageProps> = () => {
    const { t } = useTranslation('common', {
        keyPrefix: 'pages.places.createPlacePage'
    })

    const router = useRouter()
    const authSlice = useAppSelector((state) => state.auth)

    const [createPlace, { data, error, isLoading, isSuccess }] =
        API.usePlacesPostItemMutation()

    const validationErrors = useMemo(
        () =>
            isApiValidationErrors<ApiTypes.RequestPlacesPostItem>(error)
                ? error?.messages
                : undefined,
        [error]
    )

    const handleCancel = () => {
        router.back()
    }

    const handleSubmit = (formData?: ApiTypes.RequestPlacesPostItem) => {
        createPlace(formData as ApiTypes.RequestPlacesPostItem)
    }

    useEffect(() => {
        if (authSlice?.isAuth === false) {
            router.push('/login')
        }
    }, [])

    useEffect(() => {
        if (data?.id && isSuccess) {
            router.push(`/places/${data.id}`)
        }
    }, [isSuccess, data])

    return (
        <AppLayout>
            <NextSeo title={t('title')} />
            <Header
                title={t('title')}
                currentPage={t('breadCrumbCurrent')}
                links={[
                    {
                        link: '/places/',
                        text: t('breadCrumbPlacesLink')
                    }
                ]}
            />
            <Container>
                {!authSlice?.isAuth && <ScreenSpinner />}

                <PlaceForm
                    loading={isLoading || isSuccess}
                    errors={validationErrors}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            </Container>
        </AppLayout>
    )
}

export const getServerSideProps = wrapper.getServerSideProps(
    () =>
        async (
            context
        ): Promise<GetServerSidePropsResult<CreatePlacePageProps>> => {
            const locale = context.locale ?? 'en'

            const translations = await serverSideTranslations(locale)

            return {
                props: {
                    ...translations
                }
            }
        }
)

export default CreatePlacePage
