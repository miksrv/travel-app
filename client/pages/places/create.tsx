import React, { useEffect, useMemo, useState } from 'react'
import { GetServerSidePropsResult, NextPage } from 'next'
import { useRouter } from 'next/dist/client/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'

import { API, isApiValidationErrors } from '@/api/api'
import { setLocale } from '@/api/applicationSlice'
import { useAppSelector, wrapper } from '@/api/store'
import { ApiTypes } from '@/api/types'
import AppLayout from '@/components/app-layout'
import Header from '@/components/header'
import PlaceForm from '@/components/place-form'
import Container from '@/ui/container'
import ScreenSpinner from '@/ui/screen-spinner'

type CreatePlacePageProps = object

const CreatePlacePage: NextPage<CreatePlacePageProps> = () => {
    const router = useRouter()
    const { t } = useTranslation()

    const authSlice = useAppSelector((state) => state.auth)

    const [clickedButton, setClickedButton] = useState<boolean>(false)

    const [createPlace, { data, error, isLoading, isSuccess }] = API.usePlacesPostItemMutation()

    const validationErrors = useMemo(
        () => (isApiValidationErrors<ApiTypes.RequestPlacesPostItem>(error) ? error.messages : undefined),
        [error]
    )

    const handleCancel = () => {
        router.back()
    }

    const handleSubmit = (formData?: ApiTypes.RequestPlacesPostItem) => {
        if (formData) {
            setClickedButton(true)
            createPlace(formData)
        }
    }

    useEffect(() => {
        if (!authSlice.isAuth) {
            router.push('/places')
        }
    })

    useEffect(() => {
        setClickedButton(false)

        if (data?.id && isSuccess) {
            router.push(`/places/${data.id}`)
        }
    }, [isSuccess, data])

    return (
        <AppLayout>
            <NextSeo
                noindex={true}
                nofollow={true}
                title={t('create-geotag')}
            />
            <Header
                title={t('create-geotag')}
                homePageTitle={t('geotags')}
                currentPage={t('create-geotag')}
                links={[
                    {
                        link: '/places/',
                        text: t('geotags')
                    }
                ]}
            />
            <Container>
                {!authSlice.isAuth && <ScreenSpinner />}

                <PlaceForm
                    loading={isLoading || isSuccess || clickedButton}
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
        async (context): Promise<GetServerSidePropsResult<CreatePlacePageProps>> => {
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

export default CreatePlacePage
