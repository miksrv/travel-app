import React, { useEffect, useMemo } from 'react'
import { Container } from 'simple-react-ui-kit'

import { useRouter } from 'next/dist/client/router'
import { useTranslation } from 'next-i18next'
import { NextSeo } from 'next-seo'

import { API, ApiType, isApiValidationErrors, SITE_LINK } from '@/api'
import Header from '@/components/header'
import PlaceForm from '@/components/place-form'
import { equalsArrays } from '@/functions/helpers'
import { PlacePageProps } from '@/pages/places/[...slug]'

type EditProps = Omit<PlacePageProps, 'page'>

const Edit: React.FC<EditProps> = ({ place }) => {
    const router = useRouter()
    const { t, i18n } = useTranslation()

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
        <>
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
        </>
    )
}

export default Edit
