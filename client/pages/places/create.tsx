import React, { useEffect, useMemo, useState } from 'react'
import { Container } from 'simple-react-ui-kit'

import { GetServerSidePropsResult, NextPage } from 'next'
import { useRouter } from 'next/dist/client/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'

import { API, ApiType, isApiValidationErrors } from '@/api'
import { setLocale } from '@/api/applicationSlice'
import { wrapper } from '@/api/store'
import AppLayout from '@/components/app-layout'
import Header from '@/components/header'
import PlaceForm from '@/components/place-form'

type CreatePlacePageProps = object

const CreatePlacePage: NextPage<CreatePlacePageProps> = () => {
    const router = useRouter()
    const { t } = useTranslation()

    const [clickedButton, setClickedButton] = useState<boolean>(false)

    const [createPlace, { data, error, isLoading, isSuccess }] = API.usePlacesPostItemMutation()

    const validationErrors = useMemo(
        () => (isApiValidationErrors<ApiType.Places.PostItemRequest>(error) ? error.messages : undefined),
        [error]
    )

    const handleCancel = () => router.back()

    const handleSubmit = async (formData?: ApiType.Places.PostItemRequest) => {
        if (formData) {
            setClickedButton(true)
            await createPlace(formData)
        }
    }

    useEffect(() => {
        setClickedButton(false)

        if (data?.id && isSuccess) {
            void router.push(`/places/${data.id}`)
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
                        text: t('interesting-places')
                    }
                ]}
            />
            <Container style={{ marginTop: 15 }}>
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
            const locale = (context.locale ?? 'en') as ApiType.Locale
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
