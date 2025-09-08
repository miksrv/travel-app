import React, { useEffect, useMemo } from 'react'
import { Container } from 'simple-react-ui-kit'

import { GetServerSidePropsResult, NextPage } from 'next'
import { useRouter } from 'next/dist/client/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { NextSeo } from 'next-seo'

import { API, ApiModel, ApiType, isApiValidationErrors, SITE_LINK } from '@/api'
import { setLocale } from '@/api/applicationSlice'
import { wrapper } from '@/api/store'
import { AppLayout, Header } from '@/components/common'
import { PlaceForm } from '@/components/pages/place'
import { LOCAL_STORAGE } from '@/functions/constants'
import { equalsArrays } from '@/functions/helpers'

interface PlaceEditPageProps {
    place?: ApiModel.Place
}

const PlaceEditPage: NextPage<PlaceEditPageProps> = ({ place }) => {
    const { t, i18n } = useTranslation()

    const router = useRouter()

    const canonicalUrl = SITE_LINK + (i18n.language === 'en' ? 'en/' : '')

    const [updatePlace, { error, isLoading, isSuccess }] = API.usePlacesPatchItemMutation()

    const placeValuesData: ApiType.Places.PostItemRequest = useMemo(
        () => ({
            category: place?.category?.name,
            content: place?.content,
            lat: place?.lat ?? 0,
            lon: place?.lon ?? 0,
            tags: place?.tags,
            title: place?.title
        }),
        [place?.id]
    )

    const validationErrors = useMemo(
        () => (isApiValidationErrors<ApiType.Places.PostItemRequest>(error) ? error.messages : undefined),
        [error]
    )

    const handleCancel = () => router.back()

    const handleSubmit = async (formData?: ApiType.Places.PostItemRequest) => {
        const title = formData?.title?.trim()
        const content = formData?.content?.trim()

        await updatePlace({
            ...formData,
            category: formData?.category !== place?.category?.name ? formData?.category : undefined,
            content: content !== place?.content ? content : undefined,
            id: place?.id ?? '',
            tags: !equalsArrays(place?.tags, formData?.tags) ? formData?.tags : undefined,
            title: title !== place?.title ? title : undefined
        })
    }

    useEffect(() => {
        if (isSuccess) {
            void router.push(`/places/${place?.id}`)
        }
    }, [isSuccess])

    return (
        <AppLayout>
            <NextSeo
                nofollow={true}
                noindex={true}
                title={`${place?.title} - ${t('editing')}`}
                description={''}
                canonical={`${canonicalUrl}places/${place?.id}/edit`}
            />

            <Header
                title={`${place?.title} - ${t('editing')}`}
                homePageTitle={t('geotags')}
                currentPage={t('editing')}
                backLink={`/places/${place?.id}`}
                links={[
                    {
                        link: '/places/',
                        text: t('geotags')
                    },
                    {
                        link: `/places/${place?.id}`,
                        text: place?.title || ''
                    }
                ]}
            />

            <Container style={{ marginTop: 15 }}>
                <PlaceForm
                    placeId={place?.id}
                    values={placeValuesData}
                    loading={isLoading || isSuccess}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    errors={validationErrors as any}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            </Container>
        </AppLayout>
    )
}

export const getServerSideProps = wrapper.getServerSideProps(
    (store) =>
        async (context): Promise<GetServerSidePropsResult<PlaceEditPageProps>> => {
            const id = context.params?.slug?.[0]
            const cookies = context.req.cookies
            const locale = (context.locale ?? 'en') as ApiType.Locale
            const translations = await serverSideTranslations(locale)

            if (typeof id !== 'string') {
                return { notFound: true }
            }

            let lat
            let lon

            if (cookies[LOCAL_STORAGE.LOCATION]) {
                const userLocation = cookies[LOCAL_STORAGE.LOCATION]?.split(';')

                if (userLocation?.[0] && userLocation[1]) {
                    lat = parseFloat(userLocation[0])
                    lon = parseFloat(userLocation[1])
                }
            }

            store.dispatch(setLocale(locale))

            const { data: placeData, isError } = await store.dispatch(
                API.endpoints.placesGetItem.initiate({
                    id,
                    lat: lat ?? null,
                    lon: lon ?? null
                })
            )

            if (isError) {
                return { notFound: true }
            }

            await Promise.all(store.dispatch(API.util.getRunningQueriesThunk()))

            return {
                props: {
                    ...translations,
                    place: placeData
                }
            }
        }
)

export default PlaceEditPage
